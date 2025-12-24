import {Component, inject} from '@angular/core';
import {SimulationService} from '../../services/simulation-service/simulation-service';
import {
  LucideAngularModule, Play, Pause, Square, RotateCcw,
  Save, History, Plus, ChevronLeft, ChevronRight
} from 'lucide-angular';

@Component({
  selector: 'app-top-bar',
  imports: [LucideAngularModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  public simService = inject(SimulationService);

  // Icon Mappings
  readonly Play = Play; readonly Pause = Pause; readonly Square = Square;
  readonly RotateCcw = RotateCcw; readonly Save = Save; readonly History = History;
  readonly Plus = Plus; readonly ChevronLeft = ChevronLeft; readonly ChevronRight = ChevronRight;

  handleAddProducts() {
    // Logic to trigger random product arrival at Q0
  }
}
