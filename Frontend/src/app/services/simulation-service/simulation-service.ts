import { Injectable, inject, signal, computed } from '@angular/core';
import { KonvaService } from '../konva-service/konva-service';
import { SnapshotService } from '../snapshot-service/snapshot-service';
import { HttpClient } from '@angular/common/http';
import { UIStateDTO } from '../../models/UIState';
import { Queue } from '../../models/Queue.model';
import { Machine } from '../../models/Machine.model';
import { Connection } from '../../models/Connection.model';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from '../layout-service/layout-service';

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
  private _speed = signal<number>(1);

  // Read-only signals for the UI
  public machines = this._machines.asReadonly();
  public queues = this._queues.asReadonly();
  public connections = this._connections.asReadonly();
  public editMode = this._editMode.asReadonly();
  public status = this._status.asReadonly();
  public speed = this._speed.asReadonly();

  private lastMachineColor = new Map<number, string>();

  private readonly API_BASE = 'http://localhost:8080/simulation';

  private pollingInterval?: any;

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

  setSpeed(speed: number) {
    this._speed.set(speed);
    this.http.post(`${this.API_BASE}/speed?multiplier=${speed}`, {}, { responseType: 'text' })
      .subscribe({
        next: () => console.log('Speed set to ' + speed + 'x'),
        error: (err) => console.error('Failed to set speed:', err)
      });
  }

  // updates the ui every 200ms
  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.http.get<UIStateDTO>(`${this.API_BASE}/state`).subscribe({
        next: (state) => {
          console.log(state);

          // Debug: Log when isFinished changes
          if (state.isFinished) {
            console.log('🎉 SIMULATION FINISHED DETECTED!', state);
          }

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
            const machineIdInt = Number(machineId);
            const prevColor = this.lastMachineColor.get(machineIdInt) || 'white';
            this.konvaService.updateMachineColor(machineIdInt, color);

            if (prevColor !== 'white' && color === 'white') {
              this.konvaService.flashMachine(machineIdInt);
            }
            this.lastMachineColor.set(machineIdInt, color);
          });

          // Check if simulation has finished
          if (state.isFinished && this.status() === 'running') {
            console.log('🚀 Calling handleSimulationComplete()');
            this.handleSimulationComplete();
          }
        },
        error: (err) => console.error('Polling error:', err),
      });
    }, 200);
  }

  private handleSimulationComplete() {
    console.log('✅ handleSimulationComplete() called');

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
    console.log('📢 Showing toast notification...');
    this.toastr.success(
      'All products have been processed successfully!',
      'Simulation Complete! 🎉',
      {
        timeOut: 7000,
        progressBar: true,
        closeButton: true,
      }
    );
    console.log('Toast should be visible now');
  }




  // Coordination logic
  start() {
    this._status.set('running');
    this.prevSimulationExists.set(true);
    this.lastMachineColor.clear();
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
        this.prevSimulationExists.set(false); // Disable replay button
        this.konvaService.clear();
        console.log('Successfully reset simulation and canvas');
        this.toastr.success('Simulation reset successfully', 'Reset Complete');
      },
      error: (err) => {
        console.error('Failed to reset canvas.');
        this.toastr.error('Failed to reset simulation', 'Reset Failed');
        console.error(err);
      },
    });
  }

  handleReplay() {
    if (!this.prevSimulationExists()) {
      this.toastr.warning('No previous simulation to replay');
      return;
    }

    // Stop any existing polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = undefined;
    }

    this.konvaService.lock();

    this._status.set('running');

    // Reset last known colors flashhhhing
    this.lastMachineColor.clear();

    this.startPolling();

    this.http.post(`${this.API_BASE}/replay`, {}, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          console.log('Replay started:', res);
        },
        error: (err) => {
          console.error('Replay failed', err);
          this.toastr.error('Replay failed');
          this._status.set('stopped');
          this.konvaService.unlock();
        }
      });
  }
}
