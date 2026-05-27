import type { PaletteEntries, PaletteEntry } from 'diagram-js/lib/features/palette/PaletteProvider';
import { EditorActions } from '../EditorActions';
import { ExportImageOptions, ModelerActions } from '../ModelerActions';
import { ControlIcons } from './icons';

const GROUP = 'controls';
const PRIORITY = 1500;

interface Palette {
  registerProvider(priority: number, provider: { getPaletteEntries(): unknown }): void;
}

interface Translate {
  (template: string, replacements?: Record<string, string>): string;
}

export interface PaletteControlsConfig {
  /** Show copy/cut/paste entries. Defaults to `true`. */
  clipboard?: boolean;
  /** Show undo/redo entries. Defaults to `true`. */
  history?: boolean;
  /** Show zoomIn/zoomOut/zoomToFit entries. Defaults to `true`. */
  zoom?: boolean;
  /** Show the toggle‑properties entry. Defaults to `true`. */
  toggleProperties?: boolean;
  /** Show export entries (PNG/JPG). Defaults to `true`. */
  exportImage?: boolean;
  exportSvg?: boolean;
  exportXML?: boolean;
}

const DEFAULT_CONFIG: Required<PaletteControlsConfig> = {
  clipboard: true,
  history: true,
  zoom: true,
  toggleProperties: true,
  exportImage: true,
  exportSvg: true,
  exportXML: true,
};

/**
 * Provides a `controls` group at the top of the bpmn-js palette with shortcuts
 * for the most common modeler actions (clipboard, history, zoom),
 * a properties panel toggle and PNG/JPG export buttons.
 *
 * The entries delegate to {@link ModelerActions} via `editorActions.trigger`,
 * so hotkeys, toolbar buttons and palette entries stay in sync.
 */
export default class PaletteControlsProvider {
  static $inject = ['palette', 'editorActions', 'translate', 'config.paletteControls'];

  private readonly editorActions: EditorActions;
  private readonly translate: Translate;
  private readonly config: Required<PaletteControlsConfig>;

  constructor(
    palette: Palette,
    editorActions: EditorActions,
    translate: Translate | undefined,
    config: PaletteControlsConfig | undefined
  ) {
    this.editorActions = editorActions;
    this.translate = translate ?? ((template) => template);
    this.config = { ...DEFAULT_CONFIG, ...(config ?? {}) };

    palette.registerProvider(PRIORITY, this);
  }

  getPaletteEntries(): (entries: PaletteEntries) => PaletteEntries {
    return (entries) => ({ ...this.buildEntries(), ...entries });
  }

  private buildEntries(): PaletteEntries {
    const entries: PaletteEntries = {};
    const t = this.translate;
    let separatorIndex = 0;

    const addSeparator = () => {
      entries[`controls.separator-${separatorIndex++}`] = {
        group: GROUP,
        separator: true,
      } as unknown as PaletteEntry;
    };

    if (this.config.clipboard) {
      entries['controls.copy'] = this.entry(ControlIcons.copy, t('Copy'), ModelerActions.copy);
      entries['controls.cut'] = this.entry(ControlIcons.cut, t('Cut'), ModelerActions.cut);
      entries['controls.paste'] = this.entry(ControlIcons.paste, t('Paste'), ModelerActions.paste);
    }

    if (this.config.history) {
      if (this.hasEntries(entries)) {
        addSeparator();
      }
      entries['controls.undo'] = this.entry(ControlIcons.undo, t('Undo'), ModelerActions.undo);
      entries['controls.redo'] = this.entry(ControlIcons.redo, t('Redo'), ModelerActions.redo);
    }

    if (this.config.zoom) {
      if (this.hasEntries(entries)) {
        addSeparator();
      }
      entries['controls.zoom-in'] = this.entry(ControlIcons.zoomIn, t('Zoom in'), ModelerActions.zoomIn);
      entries['controls.zoom-out'] = this.entry(ControlIcons.zoomOut, t('Zoom out'), ModelerActions.zoomOut);
      entries['controls.zoom-to-fit'] = this.entry(
        ControlIcons.zoomToFit,
        t('Zoom to fit'),
        ModelerActions.zoomToFit
      );
    }

    if (this.config.toggleProperties) {
      entries['controls.toggle-properties'] = this.entry(
        ControlIcons.toggleProperties,
        t('Toggle properties panel'),
        ModelerActions.toggleProperties
      );
    }

    if (this.config.exportImage || this.config.exportSvg || this.config.exportXML) {
      if (this.hasEntries(entries)) {
        addSeparator();
      }
      if (this.config.exportImage) {
        entries['controls.export-png'] = this.entry(ControlIcons.exportPng, t('Export as PNG'), ModelerActions.exportImage, { format: 'png' });
        entries['controls.export-jpg'] = this.entry(ControlIcons.exportJpg, t('Export as JPG'), ModelerActions.exportImage, { format: 'jpeg' });
      }
      if (this.config.exportSvg) {
        entries['controls.export-svg'] = this.entry(ControlIcons.exportSvg, t('Export as Svg'), ModelerActions.exportSvg);
      }

      if (this.config.exportXML) {
        entries['controls.export-xml'] = this.entry(ControlIcons.exportXML, t('Export as XML'), ModelerActions.exportXML);
      }
    }

    return entries;
  }

  private hasEntries(entries: PaletteEntries): boolean {
    return Object.keys(entries).length > 0;
  }

  private entry(
    iconSvg: string,
    title: string,
    action: ModelerActions,
    options?: ExportImageOptions
  ): PaletteEntry {
    // bpmn-js palette entries accept either an action function *or* a map of
    // event handlers (`{ click, dragstart }`); the public TS type only models
    // the former, so we cast through `unknown` for the click-only variant.
    return {
      group: GROUP,
      title,
      className: 'ng-bpmn-control',
      html: `<div class="entry ng-bpmn-control" draggable="false">${iconSvg}</div>`,
      action: {
        click: () => {
          this.editorActions.trigger(action, options);
        },
      },
    } as unknown as PaletteEntry;
  }
}
