import { Injectable } from '@angular/core';
import Konva from 'konva';

@Injectable({ providedIn: 'root' })
export class KonvaService {
  /*
  * This service is used to deal with drawing things on the canvas.
  * This "drawing" involves actually drawing it using Konva, and sending a request to the backend
  */


  private stage!: Konva.Stage; // Our canvas
  private layer!: Konva.Layer; // A stage/canvas needs a layer to do draw on

  initialize(container: string) {
    /*
    * Initializes the stage for konva.
    *
    */
    this.stage = new Konva.Stage({
      container,
      width: window.innerWidth - 260,
      height: window.innerHeight - 64
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  // Draw a machine (circle)
  drawMachine(id: string, x: number, y: number, color: string) {
    const circle = new Konva.Circle({
      id,
      x,
      y,
      radius: 30,
      fill: color,
      stroke: 'black',
      strokeWidth: 2,
      draggable: true
    });
    this.layer.add(circle);
    this.layer.draw();

  }

  // Draw a queue (rectangle)
  drawQueue(id: string, x: number, y: number, color: string = '#E8B84A') {
    const rect = new Konva.Rect({
      id,
      x,
      y,
      width: 60,
      height: 60,
      fill: color,
      stroke: 'black',
      strokeWidth: 2,
      draggable: true
    });
    this.layer.add(rect);
    this.layer.draw();

    // Should call backend
  }

  // Draw a connection line
  drawConnection(id: string, fromX: number, fromY: number, toX: number, toY: number) {
    const line = new Konva.Line({
      id,
      points: [fromX, fromY, toX, toY],
      stroke: 'black',
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round'
    });
    this.layer.add(line);
    this.layer.draw();

    // Should call backend
  }

  // Clears the stage
  clear() {
    this.layer.destroyChildren();
    this.layer.draw();

    // Should call backend
  }
}
