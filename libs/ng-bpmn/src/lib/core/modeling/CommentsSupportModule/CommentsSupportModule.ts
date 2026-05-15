import type { Element } from 'diagram-js/lib/model/Types';

type DiagramElement = Element & {
  businessObject: {
    $instanceOf(type: string): boolean;
    get(name: string): unknown;
    set(name: string, value: unknown): void;
  };
};

type CommentOverlay = {
  html: HTMLElement;
  htmlContainer?: HTMLElement;
  element: DiagramElement;
};

/**
 * Ensures embedded comments UI works with bpmn-js Modeler:
 * - initializes `documentation` before the comments extension writes to it
 * - shows comment controls on selected flow nodes (official example styling)
 * - keeps overlays interactive without collapsing on canvas clicks
 */
class CommentsSupport {
  static $inject = ['eventBus', 'overlays'] as const;

  constructor(
    private readonly eventBus: { on: (event: string, handler: (e: unknown) => void) => void },
    private readonly overlays: {
      get(filter: { element?: DiagramElement; type?: string }): CommentOverlay[];
    }
  ) {
    eventBus.on('shape.added', (event: unknown) => {
      const { element } = event as { element: DiagramElement };
      this.ensureDocumentation(element);
      setTimeout(() => this.wireOverlay(element), 0);
    });

    eventBus.on('selection.changed', (event: unknown) => {
      const { newSelection = [] } = event as { newSelection?: DiagramElement[] };
      this.updateSelectionHighlight(newSelection);
    });
  }

  private ensureDocumentation(element: DiagramElement) {
    const bo = element.businessObject;
    if (!bo?.$instanceOf('bpmn:FlowNode')) {
      return;
    }

    if (!bo.get('documentation')) {
      bo.set('documentation', []);
    }
  }

  private wireOverlay(element: DiagramElement) {
    const overlay = this.overlays.get({ element, type: 'comments' })[0];
    if (!overlay?.htmlContainer) {
      return;
    }

    const stop = (e: Event) => e.stopPropagation();
    overlay.htmlContainer.addEventListener('mousedown', stop);
    overlay.htmlContainer.addEventListener('click', stop);
  }

  private updateSelectionHighlight(selected: DiagramElement[]) {
    this.overlays.get({ type: 'comments' }).forEach((overlay) => {
      overlay.htmlContainer?.classList.remove('selected');
    });

    selected.forEach((element) => {
      const overlay = this.overlays.get({ element, type: 'comments' })[0];
      overlay?.htmlContainer?.classList.add('selected');
    });
  }
}

export default {
  __init__: ['commentsSupport'],
  commentsSupport: ['type', CommentsSupport]
};
