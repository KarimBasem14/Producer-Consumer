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
    sourceType: 'machine' | 'queue' | 'connection',
    toId: number,
    targetType: 'machine' | 'queue' | 'connection'
  ) {
    console.log('drawing connection');

    const fromNode = this.stage.findOne(`.${sourceType}#${fromId.toString()}`);
    const toNode = this.stage.findOne(`.${targetType}#${toId.toString()}`);

    if (!fromNode || !toNode) {
      console.error(`Could not find ${sourceType}#${fromId} or ${targetType}#${toId}`);
      return;
    }

    const arrow = new Konva.Arrow({
      // We use fromNode directly because it is the Group
      points: [fromNode.x(), fromNode.y(), toNode.x(), toNode.y()],
      pointerLength: 8,
      pointerWidth: 8,
      fill: '#475569',
      stroke: '#475569',
      strokeWidth: 2,
      id: `link-${sourceType}-${fromId}-${targetType}-${toId}`,
    });

    const updatePoints = () => {
      arrow.points([fromNode.x(), fromNode.y(), toNode.x(), toNode.y()]);
      this.layer.batchDraw();
    };

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
