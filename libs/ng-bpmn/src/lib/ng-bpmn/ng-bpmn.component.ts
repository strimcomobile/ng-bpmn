import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, Subscription, from, map, of, switchMap } from 'rxjs';
import type { ModuleDeclaration } from 'didi';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import Canvas from 'diagram-js/lib/core/Canvas';
import { BpmnPropertiesPanelModule, BpmnPropertiesProviderModule } from 'bpmn-js-properties-panel';
import ColorPickerModule from 'bpmn-js-color-picker';
import CommentsModule from 'bpmn-js-embedded-comments';
import ResizeTaskModule from 'bpmn-js-task-resize/lib';
import MinimapModule from 'diagram-js-minimap';
import CommentsSupportModule from '../core/modeling/CommentsSupportModule';
import LabelLinkModule from '../core/modeling/LabelLinkModule';
import AddExporter from '@bpmn-io/add-exporter';
import { EditorActions } from '../core/modeling/EditorActions';
import { Modeler } from '../core/Modeler';
import { ModelerComponent } from '../core/ModelerComponent';
import { ExportImageOptions, ModelerActions } from '../core/modeling/ModelerActions';
import DiagramActionsModule from '../core/modeling/DiagramActionsModule';
import BpmnActionsModule from '../core/modeling/BpmnActionsModule';
import PaletteControlsModule, {
  PaletteControlsConfig
} from '../core/modeling/PaletteControlsModule';
import { DiagramMinimap } from '../core/modeling/DiagramMinimap';
import { DiagramComments } from '../core/modeling/DiagramComments';
import { debounce } from '../utils/debounce';
import { ImportEvent } from '../core/ImportEvent';
import { exporter } from '../core/exporter';
import { ImportCallback } from '../core/ImportCallback';
import { MOVE_SELECTION_HOTKEYS } from '../core/modeling/ModelerHotkeys';
import { ModelingService } from '../services/ModelingService';

export interface DiagramChangedEvent {
  xml?: string;
  error?: Error;
}

/** Preset for the BPMN color picker (stroke/fill are persisted in diagram XML). */
export interface BpmnColorOption {
  label: string;
  fill?: string;
  stroke?: string;
}

@Component({
  selector: 'ng-bpmn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ng-bpmn.component.html',
  styleUrls: ['./ng-bpmn.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NgBpmnComponent extends ModelerComponent implements Modeler, OnInit, OnChanges, OnDestroy {
  private bpmnJS?: BpmnModeler;

  @Input({ required: true }) url?: string;
  @Input() showProperties = false;
  @Input() showMinimap = false;
  @Input() autoOpenMinimap = false;
  /** When true, enables embedded comments on flow nodes (bpmn-js-embedded-comments). */
  @Input() showComments = false;
  /** When true, shows a dashed line between a sequence flow and its external label when selected. */
  @Input() showLabelLink = true;
  @Input() hotkeys = false;
  /** When true, adds a “Set color” entry to the context pad (bpmn-js-color-picker). */
  @Input() colorPicker = true;
  /** Optional palette; defaults to the built‑in presets from bpmn-js-color-picker. */
  @Input() colorPalette?: BpmnColorOption[];
  /**
   * When true, adds a `controls` group to the bpmn-js palette with shortcuts
   * for clipboard, history, zoom, the properties panel toggle and PNG/JPG
   * export. Pass an object to enable/disable individual entries.
   */
  @Input() paletteControls: boolean | PaletteControlsConfig = false;
  /**
   * When true, allows resizing tasks, call activities and sub-processes
   * (bpmn-js-task-resize).
   */
  @Input() taskResizingEnabled = false;
  /**
   * When true, allows resizing events (bpmn-js-task-resize).
   * Requires the resize module — enabled automatically when this or
   * `taskResizingEnabled` is true.
   */
  @Input() eventResizingEnabled = false;

  @ViewChild('canvas', { static: true })
  private canvas?: ElementRef;

  @ViewChild('properties', { static: true })
  private properties?: ElementRef;

  @Output()
  importDone = new EventEmitter<ImportEvent>();

  @Output()
  changed = new EventEmitter<DiagramChangedEvent>();

  private readonly http = inject(HttpClient);
  private readonly modelingService = inject(ModelingService);
  private readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    super();
  }

  get editorActions(): EditorActions | undefined {
    return this.bpmnJS?.get<EditorActions>('editorActions');
  }

  get comments(): DiagramComments | undefined {
    return this.showComments ? this.bpmnJS?.get<DiagramComments>('comments') : undefined;
  }

  ngOnInit(): void {
    const additionalModules: ModuleDeclaration[] = [
      AddExporter,
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      DiagramActionsModule,
      BpmnActionsModule
    ];

    if (this.showMinimap) {
      additionalModules.push(MinimapModule);
    }

    if (this.showComments) {
      additionalModules.push(CommentsModule, CommentsSupportModule);
    }

    if (this.showLabelLink) {
      additionalModules.push(LabelLinkModule);
    }

    if (this.colorPicker) {
      additionalModules.push(ColorPickerModule);
    }

    if (this.paletteControls) {
      additionalModules.push(PaletteControlsModule);
    }

    if (this.taskResizingEnabled || this.eventResizingEnabled) {
      additionalModules.push(ResizeTaskModule);
    }

    const canvasElement = this.canvas?.nativeElement;

    const paletteControlsConfig =
      typeof this.paletteControls === 'object' && this.paletteControls !== null
        ? this.paletteControls
        : undefined;

    const modelerOptions = {
      exporter,
      container: canvasElement,
      propertiesPanel: {
        parent: this.properties?.nativeElement
      },
      additionalModules,
      // diagram-js keyboard (arrows, tools) — only when not using hotkeys-js globally
      ...(!this.hotkeys && canvasElement ? { keyboard: { bindTo: canvasElement } } : {}),
      ...(this.colorPicker && this.colorPalette?.length ? { colorPicker: { colors: this.colorPalette } } : {}),
      ...(paletteControlsConfig ? { paletteControls: paletteControlsConfig } : {}),
      ...(this.taskResizingEnabled ? { taskResizingEnabled: true } : {}),
      ...(this.eventResizingEnabled ? { eventResizingEnabled: true } : {})
    } as ConstructorParameters<typeof BpmnModeler>[0];

    const modeler = new BpmnModeler(modelerOptions);

    if (this.showMinimap && this.autoOpenMinimap) {
      modeler.get<DiagramMinimap>('minimap').open();
    }

    modeler.on('import.done', ({ error }: ImportCallback) => {
      if (!error && this.bpmnJS) {
        const canvas = this.bpmnJS.get<Canvas>('canvas');
        canvas.zoom('fit-viewport');
      }
    });

    const onChanged = debounce(async () => {
      try {
        const content = await this.bpmnJS?.saveXML();
        if (content) {
          this.changed.next(content);
        }
      } catch (err) {
        console.error(err);
      }
    });
    if (this.showComments) {
      modeler.on('comments.updated', onChanged);
      modeler.on('canvas.click', () => {
        modeler.get<DiagramComments>('comments')?.collapseAll();
      });
    }

    modeler.on('commandStack.changed', onChanged);
    modeler.on('import.done', onChanged);

    modeler.on('ngBpmn.toggleProperties', () => {
      this.toggleProperties();
    });
    modeler.on('ngBpmn.exportImage', (event: { format?: 'png' | 'jpeg' } & ExportImageOptions) => {
      void this.exportImage(event);
    });
    modeler.on('ngBpmn.exportSvg', () => {
      void this.modelingService.downloadSVG(this);
    });
    modeler.on('ngBpmn.exportXml', () => {
      void this.modelingService.downloadXML(this);
    });

    this.bpmnJS = modeler;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['url']) {
      this.loadUrl(changes['url'].currentValue);
    }
  }

  ngOnDestroy(): void {
    if (this.hotkeys) {
      this.unbindHotkeys();
    }
    this.bpmnJS?.destroy();
  }

  private onLoad() {
    this.canvas?.nativeElement?.focus();

    if (this.hotkeys) {
      this.bindHotkeys();
    }
  }

  toggleProperties() {
    this.showProperties = !this.showProperties;
    this.cdr.detectChanges();
  }

  loadUrl(url: string): Subscription {
    return this.http
      .get(url, { responseType: 'text' })
      .pipe(
        switchMap((xml: string) => this.importDiagram(xml)),
        map((result) => result.warnings)
      )
      .subscribe({
        next: (warnings) => {
          this.importDone.emit({
            type: 'success',
            warnings
          });

          this.onLoad();
        },
        error: (err: HttpErrorResponse) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      });
  }

  async saveXML(): Promise<string | undefined> {
    if (this.bpmnJS) {
      const { xml } = await this.bpmnJS.saveXML({ format: true });
      return xml;
    } else {
      return Promise.reject('Modeler not initialized');
    }
  }

  async saveSVG(): Promise<string | undefined> {
    if (this.bpmnJS) {
      const { svg } = await this.bpmnJS.saveSVG();
      return svg;
    } else {
      return Promise.reject('Modeler not initialized');
    }
  }

  /**
   * Rasterise the current diagram and trigger a file download.
   * Defaults to PNG; pass `{ format: 'jpeg' }` for a JPG export.
   */
  async exportImage(options: ExportImageOptions = {}): Promise<void> {
    if (!this.bpmnJS) {
      return Promise.reject('Modeler not initialized');
    }

    await this.modelingService.downloadImage(this, options);
  }

  private importDiagram(xml: string): Observable<{ warnings: Array<string> }> {
    if (this.bpmnJS) {
      return from(this.bpmnJS.importXML(xml));
    } else {
      return of({ warnings: [] });
    }
  }

  protected override bindHotkeys() {
    console.log('Binding BPMN hotkeys');

    super.bindHotkeys({
      'ctrl+a, command+a': ModelerActions.selectElements,
      e: ModelerActions.directEditing,
      h: ModelerActions.handTool,
      l: ModelerActions.lassoTool,
      s: ModelerActions.spaceTool,
      'ctrl+=, command+=': ModelerActions.zoomIn,
      'ctrl+-, command+-': ModelerActions.zoomOut,
      'ctrl+0, command+0': ModelerActions.resetZoom,
      'ctrl+9, command+9': ModelerActions.zoomToFit,
      'ctrl+z, command+z': ModelerActions.undo,
      'ctrl+shift+z, command+shift+z': ModelerActions.redo,
      Backspace: ModelerActions.removeSelection,
      'ctrl+c, command+c': ModelerActions.copy,
      c: ModelerActions.globalConnectTool,
      'ctrl+v, command+v': ModelerActions.paste,
      'ctrl+x, command+x': ModelerActions.cut,
      'ctrl+f, command+f': ModelerActions.find,
      ...MOVE_SELECTION_HOTKEYS
    });
  }

  protected override unbindHotkeys() {
    console.log('Unbinding BPMN hotkeys');
    super.unbindHotkeys();
  }
}
