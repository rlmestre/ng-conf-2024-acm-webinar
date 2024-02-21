import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
    BehaviorSubject, combineLatest, EMPTY, interval, map, merge, of, scan, startWith, Subject, switchMap, throttleTime
} from 'rxjs';
import { TreasureComponent } from  './treasure.component';
import { treasuresMock } from './treasures.mock';

@Component({
    selector: 'treasure-list',
    imports: [NgIf, NgFor, AsyncPipe, TreasureComponent],
    standalone: true,
    template: `
        <ng-container *ngIf="vm$ | async; let vm">
            <h1>Discovering Angular 17's Hidden Treasures</h1>
            <div class="buttons">
                <button (click)="getNextArticle()">Get next article</button>
                <button (click)="toggleStreaming()">{{ vm.streaming ? 'Stop streaming' : 'Stream articles' }}</button>
                <input type="text" placeholder="Search" />
            </div>
            <main>
                <section class="treasures-container" *ngIf="vm.treasures; let treasures">
                    <treasure *ngFor="let treasure of treasures" [treasure]="treasure"/>
                </section>
            </main>
        </ng-container>
    `,
})
export class TreasureListComponent {
    private streaming = new BehaviorSubject(false);
    streaming$ = this.streaming.asObservable();

    private getTreasure = new Subject<void>();
    private gettingTreasure$ = this.getTreasure.pipe(throttleTime(1000));
    private findingTreasures$ = this.streaming.pipe(
      switchMap(auto => auto ? interval(1000) : EMPTY),
    );

    foundTreasures$ = merge(this.gettingTreasure$, this.findingTreasures$).pipe(
      scan((acc) => acc + 1, -1),
      map((index) => treasuresMock.slice(0, index + 1)),
    );

    vm$ = combineLatest({
        treasures: this.foundTreasures$.pipe(startWith([])),
        streaming: this.streaming$.pipe(startWith(false)),
    });

    getNextArticle() {
        this.getTreasure.next();
    }

    toggleStreaming() {
        this.streaming.next(!this.streaming.value);
    }

    getTreasureById(id: number) {
        return of(treasuresMock[id]);
    }
}
