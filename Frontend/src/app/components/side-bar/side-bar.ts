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
  private konvaService: KonvaService = inject(KonvaService);
  private layoutService: LayoutService = inject(LayoutService);

  private machineCount = 0;

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
    const { x, y } = this.getNextMachinePosition();
    this.layoutService.addMachine(x, y).subscribe(machine => {
      this.konvaService.drawMachine(
      `machine-${machine.id}`,
      machine.x,
      machine.y,
      machine.color
    );
    })
    
  }

  onAddQueue() {
    // TODO: Implement queue addition logic
    // This would update the state through updateState()
  }

  onSetMode(mode: 'select' | 'connect' | 'delete') {
    this.simService.setEditMode(mode);
  }

  private getNextMachinePosition() {
    const COLS = 5;
    const SPACING = 120;
    const START_X = 100;
    const START_Y = 100;

    const col = this.machineCount % COLS;
    const row = Math.floor(this.machineCount / COLS);

    this.machineCount++;

    return {
      x: START_X + col * SPACING,
      y: START_Y + row * SPACING,
    };
  }
}
