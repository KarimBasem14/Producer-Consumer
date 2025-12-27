import { Component, inject } from '@angular/core';
import { SimulationService } from '../../services/simulation-service/simulation-service';
import { SnapshotService } from '../../services/snapshot-service/snapshot-service';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Play,
  Pause,
  Square,
  RotateCcw,
  Save,
  History,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';
import { LayoutService } from '../../services/layout-service/layout-service';

@Component({
  selector: 'app-top-bar',
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  public simService = inject(SimulationService);
  private snapshotService = inject(SnapshotService);
  private layoutService = inject(LayoutService);

  // Icon Mappings
  readonly Play = Play;
  readonly Pause = Pause;
  readonly Square = Square;
  readonly RotateCcw = RotateCcw;
  readonly Save = Save;
  readonly History = History;
  readonly Plus = Plus;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  // Expose snapshot signals to template
  public snapshots = this.snapshotService.history;
  public currentSnapshotIndex = this.snapshotService.currentIndex;

  startSimulation() {
    this.simService.start();
  }

  pauseSimulation() {
    this.simService.pause();
  }

  stopSimulation() {
    this.simService.stop();
  }

  resetSimulation() {
    this.simService.reset();
  }

  replaySimulation() {}

  loadSnapshot(index: number) {
    this.simService.handleReplay(index);
  }

  handleAddProducts() {
    this.layoutService.incProductsNumber();
  }

  resetLayout() {}
}
