import { inject, Injectable, Injector, signal } from '@angular/core';
import Konva from 'konva';

import { LayoutService } from '../layout-service/layout-service';
import { Machine } from '../../models/Machine.model';

@Injectable({ providedIn: 'root' })
export class KonvaService {
  private injector = inject(Injector);
  private _editMode = signal<'select' | 'connect' | 'delete'>('select');
  public editMode = this._editMode.asReadonly();
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;

  initialize(container: string) {
    this.stage = new Konva.Stage({
      container,
      width: window.innerWidth - 260,
      height: window.innerHeight - 64,
    });
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
  }

  setEditMode(mode: 'select' | 'connect' | 'delete') {
    this._editMode.set(mode);
  }

  drawMachine(dto: Machine, counter: number) {
    const group = new Konva.Group({
      id: `machine-${dto.id}`,
      x: dto.x,
      y: dto.y,
      draggable: true,
      name: 'machine',
    });

    console.log(`Drawn machine with id: ${dto.id}`);

    const circle = new Konva.Circle({
      radius: 35,
      fill: dto.color || '#f0f0f0',
      stroke: '#444',
      strokeWidth: 2,
    });

    const label = new Konva.Text({
      text: `M${dto.id}`,
      fontSize: 16,
      fontFamily: 'Inter, Arial',
      fontStyle: 'bold',
      fill: '#333',
      align: 'center',
      verticalAlign: 'middle',
    });

    label.offsetX(label.width() / 2);
    label.offsetY(label.height() / 2);
    this.addClickEvents(group, dto.id, 'machine');

    group.on('dragend', () => {
      const layoutService = this.injector.get(LayoutService);
      layoutService.updateMachinePosition(dto.id, group.x(), group.y());
    });

    group.add(circle, label);
    this.layer.add(group);
    this.layer.batchDraw();
  }

  drawQueue(dto: any, counter: number) {
    const group = new Konva.Group({
      id: `queue-${dto.id}`,
      x: dto.x,
      y: dto.y,
      draggable: true,
      name: 'queue',
    });

    console.log(`q${dto.id}`);


    const rect = new Konva.Rect({
      width: 70,
      height: 50,
      cornerRadius: 8,
      fill: '#3b82f6',
      stroke: '#1e40af',
      strokeWidth: 2,
    });

    const text = new Konva.Text({
      text: `Q${dto.id}\n${dto.size} P`,
      fontSize: 14,
      fontFamily: 'Inter, Arial',
      fill: 'white',
      width: 70,
      height: 50,
      align: 'center',
      verticalAlign: 'middle',
      fontStyle: 'bold',
    });

    group.add(rect);
    group.add(text);
    this.addClickEvents(group, dto.id, 'queue');
    group.on('dragend', () => {
      const layoutService = this.injector.get(LayoutService);
      layoutService.updateQueuePosition(dto.id, group.x(), group.y());
    });

    this.layer.add(group);
    this.layer.batchDraw();
  }
  drawConnection(
    backendId: number,
    id: string,
    fromId: number,
    sourceType: 'machine' | 'queue',
    toId: number,
    targetType: 'machine' | 'queue'
  ) {
    // const fromNode = this.stage.find(`.${sourceType}`).find((n) => n.id() === fromId.toString());
    // const toNode = this.stage.find(`.${targetType}`).find((n) => n.id() === toId.toString());
    const fromNode = this.stage.findOne(`#${sourceType}-${fromId}`);
    const toNode = this.stage.findOne(`#${targetType}-${toId}`);

    if (!fromNode || !toNode) return;

    const updatePoints = () => {
      const c1 = this.getCenter(fromNode, sourceType);
      const c2 = this.getCenter(toNode, targetType);

      const start = this.getEdgePoint(c1, c2, sourceType);
      const end = this.getEdgePoint(c2, c1, targetType);

      arrow.points([start.x, start.y, end.x, end.y]);
      this.layer.batchDraw();
    };

    const c1 = this.getCenter(fromNode, sourceType);
    const c2 = this.getCenter(toNode, targetType);
    const start = this.getEdgePoint(c1, c2, sourceType);
    const end = this.getEdgePoint(c2, c1, targetType);

    const arrow = new Konva.Arrow({
      points: [start.x, start.y, end.x, end.y],
      pointerLength: 10,
      pointerWidth: 10,
      fill: '#475569',
      stroke: '#475569',
      strokeWidth: 3,
      id: id,
    });

    arrow.on('click', () => {
      const currentMode = this._editMode();
      if (currentMode === 'delete') {
        const layout = this.injector.get(LayoutService);
        layout.handleInteraction(backendId, currentMode, 'connection');
      }
    });

    fromNode.on('dragmove', updatePoints);
    toNode.on('dragmove', updatePoints);

    this.layer.add(arrow);
    this.layer.batchDraw();
  }

  clear() {
    this.layer.destroyChildren();
    this.layer.batchDraw();
  }

  /// Helpers

  private getCenter(node: Konva.Node, type: string) {
    return type === 'queue' ? { x: node.x() + 35, y: node.y() + 25 } : { x: node.x(), y: node.y() };
  }

  private getEdgePoint(from: { x: number; y: number }, to: { x: number; y: number }, type: string) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);

    if (type === 'machine') {
      const radius = 37;
      return {
        x: from.x + radius * Math.cos(angle),
        y: from.y + radius * Math.sin(angle),
      };
    } else {
      const w = 70 / 2 + 2;
      const h = 50 / 2 + 2;

      const absCos = Math.abs(Math.cos(angle));
      const absSin = Math.abs(Math.sin(angle));

      let distance;
      if (w * absSin <= h * absCos) {
        distance = w / absCos;
      } else {
        distance = h / absSin;
      }

      return {
        x: from.x + distance * Math.cos(angle),
        y: from.y + distance * Math.sin(angle),
      };
    }
  }

  findShapeBySelector(selector: string): any {
    return this.stage.find(selector);
  }

  private addClickEvents(group: Konva.Group, id: number, type: 'machine' | 'queue' | 'connection') {
    group.on('click', () => {
      const currentMode = this._editMode();

      const layout = this.injector.get(LayoutService);
      layout.handleInteraction(id, currentMode, type);
    });
  }

  removeNode(id: string) {
    const node = this.layer.findOne(`#${id}`);
    if (!node) return;

    node.destroy();
    this.layer.batchDraw();
  }

  updateMachineColor(machineId: number, newColor: string) {
    // find group pattern, using the group ID format defined in drawMachine()
    const group = this.stage.findOne(`#machine-${machineId}`) as Konva.Group;

    if (group) {

      // the group contains a circle (the machine) and a label in the circle
      // we want to update the circle's color
      const circle = group.findOne('Circle') as Konva.Circle;

      if (circle) {
        // update color with simple fill
        circle.fill(newColor);

        // redraw
        this.layer.batchDraw();
      }
    }
  }

  updateQueueSize(queueId: number, newSize: number) {
    const group = this.stage.findOne(`#queue-${queueId}`) as Konva.Group;

    if (group) {
      const text = group.findOne('Text') as Konva.Text;

      if (text) {
        // Update text to show new size
        text.text(`Q${queueId}\n${newSize} P`);
        this.layer.batchDraw();
      }
    }
  }
}
