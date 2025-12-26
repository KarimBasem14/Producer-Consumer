import { Component, OnInit, inject } from '@angular/core';
import { KonvaService } from '../../services/konva-service/konva-service';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.html',
  styleUrl: './canvas.css',
})
export class Canvas implements OnInit {
  private konvaService = inject(KonvaService);

  ngOnInit() {
    this.konvaService.initialize('konva-container');
  }
}
