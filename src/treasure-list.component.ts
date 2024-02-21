import { AsyncPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, model, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { EMPTY, interval, map, merge, of, scan, Subject, switchMap, tap, throttleTime } from 'rxjs';
import { TreasureComponent } from  './treasure.component';
import { treasuresMock } from './treasures.mock';

@Component({
    selector: 'treasure-list',
    imports: [NgIf, NgFor, AsyncPipe, JsonPipe, FormsModule, TreasureComponent],
    standalone: true,
    template: `
        <h1>Discovering Angular 17's Hidden Treasures</h1>
        <main>
            <div class="buttons">
                <button (click)="getNextArticle()">Get next article</button>
                <button (click)="toggleStreaming()">{{ streaming() ? 'Stop streaming' : 'Stream articles' }}</button>
                <input type="text" placeholder="Search treasure..." [(ngModel)]="searchId" />
                <span *ngIf="searchedTreasure()" class="center">Found treasure: {{ searchedTreasure()?.name }}</span>
            </div>
            <section class="treasures-container">
                <treasure *ngFor="let treasure of foundTreasures()" [treasure]="treasure" />
            </section>
        </main>
    `,
})
export class TreasureListComponent {
    searchId = model<number | null>(null);
    streaming = signal(false);
    streaming$ = toObservable(this.streaming);

    private getTreasure = new Subject<void>();
    private gettingTreasure$ = this.getTreasure.pipe(throttleTime(1000));
    private findingTreasures$ = this.streaming$.pipe(
      switchMap(auto => auto ? interval(1000) : EMPTY),
    );

    searchedTreasure = toSignal(toObservable(this.searchId).pipe(
      switchMap(id => id === null ? EMPTY : this.getTreasureById(id))
    ))

    foundTreasures = toSignal(
        merge(this.gettingTreasure$, this.findingTreasures$).pipe(
            scan((acc) => acc + 1, -1),
            tap(console.log),
            map((index) => treasuresMock.slice(0, index + 1)),
        )
    );

    getNextArticle() {
        this.getTreasure.next();
    }

    toggleStreaming() {
        this.streaming.update(streaming => !streaming);
    }

    getTreasureById(id: number) {
        return of(treasuresMock[id]);
    }
}
