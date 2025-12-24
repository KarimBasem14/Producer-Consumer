import { Component, inject } from '@angular/core';
import {SimulationService} from '../../services/simulation-service/simulation-service';
import {Circle, Square, MousePointer, Link, Trash2, Plus, LucideAngularModule} from 'lucide-angular';



@Component({
  selector: 'app-side-bar',
  imports: [
    LucideAngularModule
  ],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  // Injecting the service using the newest inject() function
  private simService: SimulationService = inject(SimulationService);

  // Exposing the service signals to the template
  public editMode = this.simService.editMode;
  public machines = this.simService.machines;
  public queues = this.simService.queues;
  public connections = this.simService.connections;

  // Icons mapping
  readonly Circle = Circle;
  readonly Square = Square;
  readonly MousePointer = MousePointer;
  readonly Link = Link;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;

  onAddMachine() {
    this.simService.addMachine();
  }

  onAddQueue() {
    this.simService.addQueue();
  }

  onSetMode(mode: 'select' | 'connect' | 'delete') {
    this.simService.setEditMode(mode);
  }

  // Computed value logic for total products
  get totalProducts(): number {
    return this.queues().reduce((acc, q) => acc + (q.products?.length || 0), 0);
  }
}
