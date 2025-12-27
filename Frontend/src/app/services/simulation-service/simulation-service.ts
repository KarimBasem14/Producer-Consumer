import { Injectable, inject, signal, computed } from '@angular/core';
import { KonvaService } from '../konva-service/konva-service';
import { SnapshotService } from '../snapshot-service/snapshot-service';
import { HttpClient } from '@angular/common/http';
import { UIStateDTO } from '../../models/UIState';
import { Queue } from '../../models/Queue.model';
import { Machine } from '../../models/Machine.model';
import { Connection } from '../../models/Connection.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class SimulationService {
  /*
   *
   */

  private snapshot = inject(SnapshotService);
  private http: HttpClient = inject(HttpClient);
  private konvaService = inject(KonvaService);
  private toastr = inject(ToastrService);

  // Private signals to ensure that no one can edit them from outside
  private _machines = signal<Machine[]>([]);
  private _queues = signal<Queue[]>([]);
  private _connections = signal<Connection[]>([]);
  private _editMode = signal<'select' | 'connect' | 'delete'>('select');
  private _status = signal<'running' | 'paused' | 'stopped'>('stopped');
  public prevSimulationExists = signal<boolean>(false);

  // Read-only signals for the UI
  public machines = this._machines.asReadonly();
  public queues = this._queues.asReadonly();
  public connections = this._connections.asReadonly();
  public editMode = this._editMode.asReadonly();
  public status = this._status.asReadonly();

  private readonly API_BASE = 'http://localhost:8080/simulation';

  private pollingInterval?: any;

  // Derived state for the Sidebar stats
  // public totalProducts = computed(() =>
  //   // this._queues().reduce((acc, q) => acc + (q.products?.length || 0), 0)
  // );

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
      this.http.get<UIStateDTO>(`${this.API_BASE}/state`).subscribe({
        next: (state) => {
          console.log(state);

          this._queues.update((queues) => {
            return queues.map((q) => {
              const newSize = state.queuesSize[q.id];

              if (newSize !== undefined) {
                console.log('new size: ', newSize);
                q.size = newSize;
                this.konvaService.updateQueueText(q.id, newSize);
              }
              return q;
            });
          });

          Object.entries(state.machinesColor).forEach(([machineId, color]) => {
            this.konvaService.updateMachineColor(Number(machineId), color);
          });

          // Check if simulation has finished
          if (state.isFinished && this.status() === 'running') {
            this.handleSimulationComplete();
          }
        },
        error: (err) => console.error('Polling error:', err),
      });
    }, 200);
  }

  private handleSimulationComplete() {
    // Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    // Update status
    this._status.set('stopped');

    // Unlock canvas
    this.konvaService.unlock();

    // Show success notification
    this.toastr.success(
      'All products have been processed successfully!',
      'Simulation Complete! 🎉',
      {
        timeOut: 7000,
        progressBar: true,
        closeButton: true,
      }
    );
  }

  // Coordination logic
  start() {
    this._status.set('running');
    this.prevSimulationExists.set(true);
    this.konvaService.lock(); // Lock canvas during simulation
    this.http.post(`${this.API_BASE}/start`, {}, { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('Simulation started:', response);

        this.startPolling(); // asks the backend for the ui update every 200 ms
      },
      error: (err) => {
        console.error('Failed to start simulation:', err);
        this._status.set('stopped');
        this.konvaService.unlock(); // Unlock if start fails
      },
    });
  }

  pause() {
    this._status.set('paused');
  }

  stop() {
    this._status.set('stopped');
    this.konvaService.unlock(); // Unlock canvas when simulation stops
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  reset() {
    // This /reset call in the backend resets both the layout and the simulation
    this.konvaService.unlock(); // Unlock canvas before reset
    this.http.post(`${this.API_BASE}/reset`, {}, { responseType: 'text' }).subscribe({
      next: (data) => {
        this._machines.set([]);
        this._queues.set([]);
        this._connections.set([]);
        this._status.set('stopped');
        this.konvaService.clear();
        console.log('Successfully reset simulation and canvas');
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
}
