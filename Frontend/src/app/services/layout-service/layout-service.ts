import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KonvaService } from '../konva-service/konva-service';
import { SignalZero } from 'lucide-angular';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private http = inject(HttpClient);
  private konva = inject(KonvaService);

  private readonly API_BASE = 'http://localhost:8080/layout';
  private machineOffset = 0;
  private queueOffset = 0;
  private readonly SHIFT_STEP = 40;
  private machineCounter = 0;
  private queueCounter = 0;

  addMachine() {
    const initialData = {
      x: 100 + this.machineOffset,
      y: 100 + this.machineOffset,
      color: 'white',
    };

    this.http.post<any>(`${this.API_BASE}/machines/add`, initialData).subscribe({
      next: (savedMachine) => {
        this.konva.drawMachine(savedMachine, this.machineCounter);
        this.machineOffset += this.SHIFT_STEP;
        this.machineCounter++;
      },
      error: (err) => console.error('Failed to add machine', err),
    });
  }

  addQueue() {
    const initialData = {
      x: 300 + this.queueOffset,
      y: 100 + this.queueOffset,
      size: 0,
    };

    this.http.post<any>(`${this.API_BASE}/queues/add`, initialData).subscribe({
      next: (savedQueue) => {
        this.konva.drawQueue(savedQueue, this.queueCounter);
        this.queueOffset += this.SHIFT_STEP;
        this.queueCounter++;
      },
      error: (err) => console.error('Failed to add queue', err),
    });
  }

  updateMachinePosition(id: string, x: number, y: number) {
    const payload = {
      id: Number(id),
      x: Math.round(x),
      y: Math.round(y),
      color: 'white',
    };
    this.http
      .put(`${this.API_BASE}/machines/update`, payload, {
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
        },
        error: (err) => {
          console.error('Update failed:', err);
        },
      });
  }

  updateQueuePosition(id: string, x: number, y: number) {
    const payload = { id: Number(id), x: Math.round(x), y: Math.round(y), size: 0 };

    this.http
      .put(`${this.API_BASE}/queues/update`, payload, {
        responseType: 'text',
      })
      .subscribe({
        next: (response) => {
          console.log('Success:', response);
        },
        error: (err) => {
          console.error('Update failed:', err);
        },
      });
  }

  clearAll() {
    this.http.delete(`${this.API_BASE}/clear`).subscribe(() => {
      this.konva.clear();
      this.machineOffset = 0;
      this.queueOffset = 0;
    });
  }
}
