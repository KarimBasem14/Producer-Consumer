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
      id: dto.id.toString(),
      x: dto.x,
      y: dto.y,
      draggable: true,
      name: 'machine',
    });

    const circle = new Konva.Circle({
      radius: 35,
      fillRadialGradientStartPoint: { x: -10, y: -10 },
      fillRadialGradientStartRadius: 0,
      fillRadialGradientEndPoint: { x: -10, y: -10 },
      fillRadialGradientEndRadius: 60,
      fillRadialGradientColorStops: [0, 'white', 1, dto.color || '#f0f0f0'],
      stroke: '#444',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: { x: 5, y: 5 },
      shadowOpacity: 0.2,
    });

    const label = new Konva.Text({
      text: `M${counter}`,
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
      layoutService.updateMachinePosition(group.id(), group.x(), group.y());
    });

    group.add(circle, label);
    this.layer.add(group);
    this.layer.draw();
  }

  drawQueue(dto: any, counter: number) {
    const group = new Konva.Group({
      id: dto.id.toString(),
      x: dto.x,
      y: dto.y,
      draggable: true,
      name: 'queue',
    });

    const rect = new Konva.Rect({
      width: 70,
      height: 50,
      cornerRadius: 8,
      fillLinearGradientStartPoint: { x: 0, y: 0 },
      fillLinearGradientEndPoint: { x: 0, y: 50 },
      fillLinearGradientColorStops: [0, '#3b82f6', 1, '#1d4ed8'],
      stroke: '#1e40af',
      strokeWidth: 2,
      shadowColor: 'black',
      shadowBlur: 8,
      shadowOffset: { x: 3, y: 3 },
      shadowOpacity: 0.3,
    });

    const text = new Konva.Text({
      text: `Q${counter}\n${dto.size} P`,
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
      layoutService.updateQueuePosition(group.id(), group.x(), group.y());
    });

    this.layer.add(group);
    this.layer.draw();
  }

  drawConnection(
    fromId: number,
    sourceType: 'machine' | 'queue',
    toId: number,
    targetType: 'machine' | 'queue'
  ) {
    // 1. Find the nodes using the safer find() method to handle ID collisions
    const fromNode = this.stage.find(`.${sourceType}`).find((n) => n.id() === fromId.toString());
    const toNode = this.stage.find(`.${targetType}`).find((n) => n.id() === toId.toString());

    if (!fromNode || !toNode) return;

    // 2. Helper to get the center of a node based on its type
    const getCenter = (node: Konva.Node, type: string) => {
      if (type === 'queue') {
        // Queues are 70x50 Rects, so add half width/height to top-left (x,y)
        return { x: node.x() + 35, y: node.y() + 25 };
      }
      // Machines are Circles centered at their own (x,y)
      return { x: node.x(), y: node.y() };
    };

    const updatePoints = () => {
      const start = getCenter(fromNode, sourceType);
      const end = getCenter(toNode, targetType);

      // Points order: [startX, startY, endX, endY]
      // The arrow head automatically renders at (endX, endY)
      arrow.points([start.x, start.y, end.x, end.y]);
      this.layer.batchDraw();
    };

    const startPos = getCenter(fromNode, sourceType);
    const endPos = getCenter(toNode, targetType);

    const arrow = new Konva.Arrow({
      points: [startPos.x, startPos.y, endPos.x, endPos.y],
      pointerLength: 10,
      pointerWidth: 10,
      fill: '#475569',
      stroke: '#475569',
      strokeWidth: 3,
      id: `link-${sourceType}-${fromId}-${targetType}-${toId}`,
    });

    fromNode.on('dragmove', updatePoints);
    toNode.on('dragmove', updatePoints);

    this.layer.add(arrow);
    arrow.moveToBottom();
    this.layer.draw();
  }
  private addClickEvents(group: Konva.Group, id: number, type: 'machine' | 'queue' | 'connection') {
    group.on('click', () => {
      const currentMode = this._editMode();

      const layout = this.injector.get(LayoutService);
      layout.handleInteraction(id, currentMode, type);
    });
  }

  clear() {
    this.layer.destroyChildren();
    this.layer.draw();
  }
}
