import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SnapshotService {
  private _history = signal<any[]>([]);
  private _currentIndex = signal<number>(-1);

  public history = this._history.asReadonly();
  public currentIndex = this._currentIndex.asReadonly();

  // Deep copy ensures we don't accidentally modify old data
  takeSnapshot(data: any) {
    const copy = JSON.parse(JSON.stringify(data));
    this._history.update(h => [...h, copy]);
    this._currentIndex.set(this._history().length - 1);
  }

  getSnapshot(index: number) {
    if (index >= 0 && index < this._history().length) {
      this._currentIndex.set(index);
      return this._history()[index];
    }
    return null;
  }
}
