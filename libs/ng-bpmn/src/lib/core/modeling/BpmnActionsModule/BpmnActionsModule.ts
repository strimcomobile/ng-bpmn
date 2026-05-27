import { Injector } from '../Injector';
import { EditorActions } from '../EditorActions';
import { DiagramSelection } from '../DiagramSelection';
import { DiagramMinimap } from '../DiagramMinimap';
import { ExportImageOptions, ModelerActions } from '../ModelerActions';

interface EventBus {
  fire(event: string, payload?: unknown): unknown;
}

export default class BpmnActionsModule {
  static $inject = ['injector'];

  constructor(injector: Injector) {
    const editorActions = injector.get<EditorActions>('editorActions');
    const selection = injector.get<DiagramSelection>('selection');
    const minimap = injector.get<DiagramMinimap>('minimap');
    const eventBus = injector.get<EventBus>('eventBus');

    if (editorActions) {
      editorActions.register('cut', () => {
        const selected = selection.get();

        if (selected && selected.length > 0) {
          editorActions.trigger('copy');
          editorActions.trigger('removeSelection');
        }
      });

      if (minimap) {
        editorActions.register({
          [ModelerActions.showMinimap]: () => minimap.open(),
          [ModelerActions.hideMinimap]: () => minimap.close(),
        });
      }

      editorActions.register({
        [ModelerActions.toggleProperties]: () => {
          eventBus?.fire('ngBpmn.toggleProperties');
        },
        [ModelerActions.exportImage]: (options: ExportImageOptions = {}) => {
          eventBus?.fire('ngBpmn.exportImage', options);
        },
        [ModelerActions.exportSvg]: () => {
          eventBus?.fire('ngBpmn.exportSvg');
        },
        [ModelerActions.exportXML]: () => {
          eventBus?.fire('ngBpmn.exportXml');
        },
      });
    }
  }
}
