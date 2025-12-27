import { Injectable, inject, signal, computed } from '@angular/core';
import { KonvaService } from '../konva-service/konva-service';
import { SnapshotService } from '../snapshot-service/snapshot-service';
import { HttpClient } from '@angular/common/http';
import { UIStateDTO } from '../../models/UIState';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  /*
   *
   */

  private snapshot = inject(SnapshotService);
  private http: HttpClient = inject(HttpClient);
  private konvaService = inject(KonvaService);

  // Private signals to ensure that no one can edit them from outside
  private _machines = signal<any[]>([]);
  private _queues = signal<any[]>([]);
  private _connections = signal<any[]>([]);
  private _editMode = signal<'select' | 'connect' | 'delete'>('select');
  private _status = signal<'running' | 'paused' | 'stopped'>('stopped');

  // Read-only signals for the UI
  public machines = this._machines.asReadonly();
  public queues = this._queues.asReadonly();
  public connections = this._connections.asReadonly();
  public editMode = this._editMode.asReadonly();
  public status = this._status.asReadonly();

  private readonly API_BASE = 'http://localhost:8080/simulation';

  private pollingInterval?: any;

  // Derived state for the Sidebar stats
  public totalProducts = computed(() =>
    this._queues().reduce((acc, q) => acc + (q.products?.length || 0), 0)
  );

  // only used to update the app's state
  addComponent(type: 'machine' | 'queue' | 'connection', data: any) {
    if (type === 'machine') this._machines.update((list) => [...list, data]);
    if (type === 'queue') this._queues.update((list) => [...list, data]);
    if (type === 'connection') this._connections.update((list) => [...list, data]);
  }

  // only used to update the app's state
  removeComponent(id: number, type: 'machine' | 'queue' | 'connection') {
    if (type === 'machine') this._machines.update((list) => list.filter((m) => m.id !== id));
    if (type === 'queue') this._queues.update((list) => list.filter((q) => q.id !== id));
    // connections might need filtering by string ID or backend ID
    if (type === 'connection') this._connections.update((list) => list.filter((c) => c.id !== id));
  }

  updateState(machines: any[], queues: any[], connections: any[]) {
    this._machines.set(machines);
    this._queues.set(queues);
    this._connections.set(connections);
    // this.refreshUI();
  }

  setEditMode(mode: 'select' | 'connect' | 'delete') {
    this._editMode.set(mode);
  }

  // updates the ui every 200ms
  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.http.get<any>(`${this.API_BASE}/state`).subscribe({
        next: (state) => {
          if (!state || !Array.isArray(state.queues)) {
            return; // stop infinte logs :(
          }

          // update queue sizes
          this._queues.update((queues) => {
            return queues.map((q) => {
              const backendQueue = state.queues.find((bq: any) => bq.id === q.id); // we should probably change that as that's very slow!
              if (backendQueue) {
                return { ...q, size: backendQueue.size };
              }
              return q;
            });
          });

          // update machine colors through konva service
          state.machineColors.forEach((colorData: any) => {
            this.konvaService.updateMachineColor(colorData.machineId, colorData.color);
          });
        },
        error: (err) => console.error('Polling error:', err),
      });
    }, 200);
  }

  // Coordination logic
  start() {
    this._status.set('running');
    this.http.post(`${this.API_BASE}/start`, {}, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Simulation started:', response);

        this.startPolling(); // asks the backend for the ui update every 200 ms
      },
      error: (err) => {
        console.error('Failed to start simulation:', err);
        this._status.set('stopped');
      },
    });
  }

  pause() {
    this._status.set('paused');
  }

  stop() {
    this._status.set('stopped');
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  reset() {
    // This /reset call in the backend resets both the layout and the simulation
    this.http.post(`${this.API_BASE}/reset`, {}, { responseType: 'text' }).subscribe({
      next: (data) => {
        this._machines.set([]);
        this._queues.set([]);
        this._connections.set([]);
        this._status.set('stopped');
        this.konvaService.clear();
        console.log('Succefully reset simulation and canvas');
      },
      error: (err) => {
        console.error('Failed to reset canvas.');
        console.error(err);
      },
    });
  }

  handleReplay(index: number) {
    const pastState = this.snapshot.getSnapshot(index);
    if (pastState) {
      this.updateState(pastState.machines, pastState.queues, pastState.connections);
    }
  }

  // private refreshUI() {
  //   this.drawing.clear();

  //   // Draw all machines
  //   this._machines().forEach((machine: any) => {
  //     this.drawing.drawMachine(
  //       machine.id || `machine-${Math.random()}`,
  //       machine.x || 100,
  //       machine.y || 100,
  //       machine.color || '#4A90E2'
  //     );
  //   });

  //   // Draw all queues
  //   this._queues().forEach((queue: any) => {
  //     this.drawing.drawQueue(
  //       queue.id || `queue-${Math.random()}`,
  //       queue.x || 300,
  //       queue.y || 100,
  //       queue.color || '#E8B84A'
  //     );
  //   });

  //   // Draw all connections
  //   this._connections().forEach((connection: any) => {
  //     this.drawing.drawConnection(
  //       connection.id || `connection-${Math.random()}`,
  //       connection.fromX || 0,
  //       connection.fromY || 0,
  //       connection.toX || 100,
  //       connection.toY || 100
  //     );
  //   });
  // }
}
