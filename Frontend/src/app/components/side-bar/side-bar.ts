import { Component, inject } from '@angular/core';
import { SimulationService } from '../../services/simulation-service/simulation-service';
import { KonvaService } from '../../services/konva-service/konva-service';
import { LayoutService } from '../../services/layout-service/layout-service';
import {
  Circle,
  Square,
  MousePointer,
  Link,
  Trash2,
  Plus,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-side-bar',
  imports: [LucideAngularModule],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar {
  // Injecting the service using the newest inject() function
  private simService: SimulationService = inject(SimulationService);
  private layoutService: LayoutService = inject(LayoutService);

  // Exposing the service signals to the template
  public editMode = this.simService.editMode;
  public machines = this.simService.machines;
  public queues = this.simService.queues;
  public connections = this.simService.connections;
  public totalProducts = this.simService.totalProducts;

  // Icons mapping
  readonly Circle = Circle;
  readonly Square = Square;
  readonly MousePointer = MousePointer;
  readonly Link = Link;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;

  onAddMachine() {
    this.layoutService.addMachine();
  }

  onAddQueue() {
    this.layoutService.addQueue();
  }

  onSetMode(mode: 'select' | 'connect' | 'delete') {
    this.simService.setEditMode(mode);
  }
}
