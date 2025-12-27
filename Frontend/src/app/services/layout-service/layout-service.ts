import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { KonvaService } from '../konva-service/konva-service';
import { SignalZero } from 'lucide-angular';
import { first } from 'rxjs';
import { Connection } from '../../models/Connection.model';
import Konva from 'konva';
import { SimulationService } from '../simulation-service/simulation-service';
import { Queue } from '../../models/Queue.model';

@Injectable({
  providedIn: 'root',
})
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private http = inject(HttpClient);
  private konva = inject(KonvaService);
  private simService = inject(SimulationService);
  private firstSelectedId: number | null = null;
  private firstSelectedType: 'machine' | 'queue' | 'connection' | null = null;

  private readonly API_BASE = 'http://localhost:8080/layout';
  private machineOffset = 0;
  private queueOffset = 0;
  private readonly SHIFT_STEP = 40;
  private machineCounter = 0;
  private queueCounter = 0;
  private connectionCounter = 0;

  private connectionIdMap: Record<number, string> = {};

  addMachine() {
    const initialData = {
      x: 100 + this.machineOffset,
      y: 100 + this.machineOffset,
      color: 'white',
    };

    this.http.post<any>(`${this.API_BASE}/machines/add`, initialData).subscribe({
      next: (savedMachine) => {
        this.konva.drawMachine(savedMachine, this.machineCounter);

        this.simService.addComponent('machine', savedMachine); // update global state

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

    this.http.post<Queue>(`${this.API_BASE}/queues/add`, initialData).subscribe({
      next: (savedQueue) => {
        this.konva.drawQueue(savedQueue, this.queueCounter);
        this.simService.addComponent('queue', savedQueue); // Add this line!
        this.queueOffset += this.SHIFT_STEP;
        this.queueCounter++;
      },
      error: (err) => console.error('Failed to add queue', err),
    });
  }

  updateMachinePosition(id: number, x: number, y: number) {
    const payload = {
      id: id,
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

  updateQueuePosition(id: number, x: number, y: number) {
    const payload = { id: id, x: Math.round(x), y: Math.round(y), size: 0 };

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
      this.deleteComponent(id, type);
    } else if (currentMode === 'connect') {
      this.handleConnectFlow(id, type);
    }
  }

  private handleConnectFlow(id: number, type: 'machine' | 'queue' | 'connection') {
    if (this.firstSelectedId === null) {
      this.firstSelectedId = id;
      this.firstSelectedType = type;
      // console.log(`Source ${id} selected. Click target.`);
      // You could call a konva method here to make the shape "glow"
    } else {
      const sourceId = this.firstSelectedId;
      const targetId = id;
      const sourceType = this.firstSelectedType;
      const targetType = type;

      this.firstSelectedId = null;
      this.firstSelectedType = null;

      if (!sourceType || !targetType) {
        console.log('Invalid source or target type.');
        return;
      }

      if (sourceType === 'machine') {
        if (this.machineHasConnection(sourceId)) {
          console.log(`Machine ${sourceId} is already connected to a queue.`);
          return;
        }
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
        next: (savedConnection) => {
          const arrowId = `link-${savedConnection.id}-${sourceType}-${sourceId}-${targetType}-${targetId}`;
          this.connectionCounter++;
          this.connectionIdMap[savedConnection.id] = arrowId;
          console.log(arrowId);

          this.konva.drawConnection(
            savedConnection.id,
            arrowId,
            sourceId,
            sourceType,
            targetId,
            targetType
          );
        },
        error: (err) => console.error('Connection rejected by backend', err),
      });
    }
  }

  private deleteConnectionsOfNode(nodeId: number, nodeType: 'machine' | 'queue') {
    // Find all connection IDs related to this node
    const relatedConnectionIds = Object.entries(this.connectionIdMap)
      .filter(([connId, arrowId]) => arrowId.includes(`${nodeType}-${nodeId}`))
      .map(([connId]) => Number(connId));

    // Delete each connection from backend and remove from Konva
    relatedConnectionIds.forEach((connId) => {
      const arrowId = this.connectionIdMap[connId];
      console.log(connId);
      if (!arrowId) return;
      this.http.delete(`${this.API_BASE}/connections/delete/${connId}`).subscribe({
        next: () => {
          if (arrowId) {
            console.log(connId, this.connectionIdMap[connId]);

            this.konva.removeNode(arrowId);
            this.simService.removeComponent(connId, 'connection'); // update global state
            delete this.connectionIdMap[connId];
          }
        },
        error: (err) => console.error('Failed to delete connection', err),
      });
    });
  }

  deleteComponent(id: number, type: 'machine' | 'queue' | 'connection') {
    if (type === 'machine' || type === 'queue') {
      this.deleteConnectionsOfNode(id, type);
    }
    if (type === 'machine') {
      this.http
        .delete(`${this.API_BASE}/machines/delete/${id}`, { responseType: 'text' })
        .subscribe({
          next: () => {
            this.konva.removeNode(`machine-${id}`);
            this.simService.removeComponent(id, type); // updates global state in simService
          },
          error: (err) => console.error('Failed to delete machine', err),
        });
    }

    if (type === 'queue') {
      this.http.delete(`${this.API_BASE}/queues/delete/${id}`, { responseType: 'text' }).subscribe({
        next: () => {
          this.konva.removeNode(`queue-${id}`);
          this.simService.removeComponent(id, type); // updates global state in simService
        },
        error: (err) => console.error('Failed to delete queue', err),
      });
    }
    if (type === 'connection') {
      const arrowId = this.connectionIdMap[id];
      this.http.delete(`${this.API_BASE}/connections/delete/${id}`).subscribe({
        next: () => {
          if (arrowId) {
            const arrow = this.konva.findShapeBySelector(`#${arrowId}`);
            console.log('Arrow to delete:', arrow);

            console.log(arrowId, this.connectionIdMap[id]);

            this.konva.removeNode(arrowId);
            this.simService.removeComponent(id, type); // updates global state in simService
            delete this.connectionIdMap[id];
          }
        },
        error: (err) => console.error('Failed to delete layout', err),
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

  private machineHasConnection(machineId: number): boolean {
    const pattern = `-machine-${machineId}-`;
    const allArrows = this.konva.findShapeBySelector('Arrow') as any[];
    return [...allArrows].some((arrow) => {
      const arrowId = arrow.id();
      return arrowId && arrowId.includes(pattern);
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
