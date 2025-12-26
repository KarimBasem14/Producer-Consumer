import {Injectable, inject, signal, computed} from '@angular/core';
import {KonvaService} from '../konva-service/konva-service';
import {SnapshotService} from '../snapshot-service/snapshot-service';


@Injectable({ providedIn: 'root' })
export class SimulationService {
  /*
  *
  */



  private snapshot = inject(SnapshotService);
  private drawing = inject(KonvaService);

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

  // Derived state for the Sidebar stats
  public totalProducts = computed(() =>
    this._queues().reduce((acc, q) => acc + (q.products?.length || 0), 0)
  );

  updateState(machines: any[], queues: any[], connections: any[]) {
    this._machines.set(machines);
    this._queues.set(queues);
    this._connections.set(connections);
    this.refreshUI();
  }

  setEditMode(mode: 'select' | 'connect' | 'delete') {
    this._editMode.set(mode);
  }

  // Coordination logic
  start() {
    this._status.set('running');
    // Call backend to start Java threads [cite: 32]
  }

  pause() {
    this._status.set('paused');
  }

  stop() {
    this._status.set('stopped');
  }

  reset() {
    this._machines.set([]);
    this._queues.set([]);
    this._connections.set([]);
    this._status.set('stopped');
    this.refreshUI();
  }

  handleReplay(index: number) {
    const pastState = this.snapshot.getSnapshot(index);
    if (pastState) {
      this.updateState(pastState.machines, pastState.queues, pastState.connections);
    }
  }

  private refreshUI() {
    this.drawing.clear();

    // Draw all machines
    this._machines().forEach((machine: any) => {
      this.drawing.drawMachine(
        machine.id || `machine-${Math.random()}`,
        machine.x || 100,
        machine.y || 100,
        machine.color || '#4A90E2'
      );
    });

    // Draw all queues
    this._queues().forEach((queue: any) => {
      this.drawing.drawQueue(
        queue.id || `queue-${Math.random()}`,
        queue.x || 300,
        queue.y || 100,
        queue.color || '#E8B84A'
      );
    });

    // Draw all connections
    this._connections().forEach((connection: any) => {
      this.drawing.drawConnection(
        connection.id || `connection-${Math.random()}`,
        connection.fromX || 0,
        connection.fromY || 0,
        connection.toX || 100,
        connection.toY || 100
      );
    });
  }
}
