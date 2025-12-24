import { Injectable, signal, computed } from '@angular/core';
import {Machine} from '../../models/Machine.model';
import {Queue} from '../../models/Queue.model';
import {Connection} from '../../models/Connection.model';


@Injectable({ providedIn: 'root' })
export class SimulationService {

  // Signals to track current state
  private _machines = signal<Machine[]>([]);
  private _queues = signal<Queue[]>([]);
  private _connections = signal<Connection[]>([]);
  private _editMode = signal<'select' | 'connect' | 'delete'>('select');

  // Public Read-Only Signals (For components to use)
  public machines = this._machines.asReadonly();
  public queues = this._queues.asReadonly();
  public connections = this._connections.asReadonly();
  public editMode = this._editMode.asReadonly();

  // Signal to calculate total products automatically
  public totalProducts = computed(() =>
    this._queues().reduce((acc, q) => acc + q.products.length, 0)
  );

  // Update editing mode
  setEditMode(mode: 'select' | 'connect' | 'delete') {
    this._editMode.set(mode);
  }

  addMachine(pos?: { x: number; y: number }) {
    const id = `M${this._machines().length}`;
    const newMachine: Machine = {
      id,
      x: pos?.x ?? (200 + Math.random() * 400),
      y: pos?.y ?? (150 + Math.random() * 300),
      processing: false
    };

    // Using update() to push new state
    this._machines.update(items => [...items, newMachine]);

    // the backend should be called here

  }

  addQueue(pos?: { x: number; y: number }) {
    const id = `Q${this._queues().length}`;
    const newQueue: Queue = {
      id,
      x: pos?.x ?? (200 + Math.random() * 400),
      y: pos?.y ?? (150 + Math.random() * 300),
      products: []
    };

    this._queues.update(items => [...items, newQueue]);

    // the backend should be called here
    console.log(`Backend Notification: Queue ${id} added.`);
  }

  addConnection(fromId: string, toId: string) {
    const newConn: Connection = { fromId, toId };
    this._connections.update(conns => [...conns, newConn]);

    // the backend should be called here
    console.log(`Connection established: ${fromId} -> ${toId}`);
  }

  deleteElement(id: string) {
    if (id.startsWith('M')) {
      this._machines.update(ms => ms.filter(m => m.id !== id));
    } else {
      this._queues.update(qs => qs.filter(q => q.id !== id));
    }
    // Cleanup orphaned connections
    this._connections.update(conns =>
      conns.filter(c => c.fromId !== id && c.toId !== id)
    );

    // the backend should be called here
  }


  // Snapshot stuff

  // Simulation Status
  private _status = signal<'running' | 'paused' | 'stopped'>('stopped');
  public status = this._status.asReadonly();

  // Snapshot Management (Memento Pattern)
  private _snapshots = signal<any[]>([]);
  private _currentIndex = signal<number>(-1);

  public snapshots = this._snapshots.asReadonly();
  public currentSnapshotIndex = this._currentIndex.asReadonly();



  startSimulation() { this._status.set('running'); }
  pauseSimulation() { this._status.set('paused'); }
  stopSimulation() { this._status.set('stopped'); }

  resetSimulation() {
    this.stopSimulation();
    // Logic to clear products from queues [cite: 16]
  }

  // Snapshot Logic
  saveSnapshot() {
    const state = { /* logic to capture current positions and queue counts */ };
    this._snapshots.update(s => [...s, state]);
    this._currentIndex.set(this._snapshots().length - 1);
  }

  loadSnapshot(index: number) {
    if (index >= 0 && index < this._snapshots().length) {
      this._currentIndex.set(index);
      // Logic to restore state from snapshot [cite: 45]
    }
  }
}
