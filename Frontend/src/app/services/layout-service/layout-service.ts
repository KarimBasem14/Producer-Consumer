import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KonvaService } from '../konva-service/konva-service';
import { SignalZero } from 'lucide-angular';
import { first } from 'rxjs';
import { Connection } from '../../models/Connection.model';
import Konva from 'konva';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private http = inject(HttpClient);
  private konva = inject(KonvaService);
  private firstSelectedId: number | null = null;
  private firstSelectedType: 'machine' | 'queue' | 'connection' | null = null;

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

  handleInteraction(id: number, currentMode: string, type: 'machine' | 'queue' | 'connection') {
    if (currentMode === 'delete') {
      this.deleteComponent(id);
    } else if (currentMode === 'connect') {
      this.handleConnectFlow(id, type);
    }
  }

  private handleConnectFlow(id: number, type: 'machine' | 'queue' | 'connection') {
    if (this.firstSelectedId === null) {
      this.firstSelectedId = id;
      this.firstSelectedType = type;
      console.log(`Source ${id} selected. Click target.`);
      // You could call a konva method here to make the shape "glow"
    } else {
      const sourceId = this.firstSelectedId;
      const targetId = id;
      const sourceType = this.firstSelectedType;
      const targetType = type;
      console.log(`Source ${sourceId} selected. target ${targetId} Selected.`);
      this.firstSelectedId = null;
      this.firstSelectedType = null;

      if (!sourceType || !targetType) {
        console.log('Invalid source or target type.');
        return;
      }

      if (sourceType === targetType) {
        console.log('Cannot connect two components of the same type.');
        return;
      }

      if (sourceType === 'connection' || targetType === 'connection') {
        console.log('Connecting from/to connections is not allowed.');
        return;
      }

      if (this.connectionExists(sourceId, sourceType, targetId, targetType)) {
        console.log('A connection already exists between these components!');
        return;
      }

      const dto = {
        fromId: sourceId,
        toId: targetId,
        direction: sourceType === 'machine' ? 0 : 1,
      };

      this.http.post<Connection>(`${this.API_BASE}/connections/add`, dto).subscribe({
        next: (conn) =>
          this.konva.drawConnection(conn.id, sourceId, sourceType, targetId, targetType),
        error: (err) => console.error('Connection rejected by backend', err),
      });
    }
  }

  private connectionExists(id1: number, type1: string, id2: number, type2: string): boolean {
    const patternA = `${type1}-${id1}`;
    const patternB = `${type2}-${id2}`;
    const allArrows = this.konva.findShapeBySelector('Arrow') as unknown as Konva.Node[];
    return allArrows.some((arrow) => {
      const arrowId = arrow.id();
      return arrowId.includes(patternA) && arrowId.includes(patternB);
    });
  }

  deleteComponent(id: number) {
    // Nour :) Smile
  }

  clearAll() {
    this.http.delete(`${this.API_BASE}/clear`).subscribe(() => {
      this.konva.clear();
      this.machineOffset = 0;
      this.queueOffset = 0;
    });
  }
}
