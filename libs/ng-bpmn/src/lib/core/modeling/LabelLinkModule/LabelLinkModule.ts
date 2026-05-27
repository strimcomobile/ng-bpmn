import { append as svgAppend, remove as svgRemove } from 'tiny-svg';
import { createLine, updateLine } from 'diagram-js/lib/util/RenderUtil';
import { getMid, getElementLineIntersection } from 'diagram-js/lib/layout/LayoutUtil';
import { getDistancePointPoint } from 'diagram-js/lib/features/bendpoints/GeometricUtil';
import { isLabel } from 'diagram-js/lib/util/ModelUtil';
import { isAny } from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DiagramElement = any;

const ALLOWED_ELEMENTS = ['bpmn:SequenceFlow', 'bpmn:Event', 'bpmn:Gateway'];

const LINE_STYLE = {
  class: 'bjs-label-link',
  stroke: 'var(--element-selected-outline-secondary-stroke-color, #73bbff)',
  strokeDasharray: '5, 5',
  fill: 'none'
};

const DISTANCE_THRESHOLD = 15;

/**
 * Draws a dashed line between an external connection label and its sequence flow
 * when either is selected (same UX as bpmn-js >= 18.9 label-link).
 */
class LabelLink {
  static $inject = ['eventBus', 'canvas', 'graphicsFactory', 'selection'] as const;

  private readonly layer: Element;

  constructor(
    private readonly eventBus: { on: (event: string, handler: (e: unknown) => void) => void },
    canvas: { getLayer(name: string): Element },
    private readonly graphicsFactory: { getShapePath(element: DiagramElement): string },
    private readonly selection: { get(): DiagramElement[] }
  ) {
    this.layer = canvas.getLayer('overlays');

    const cleanUp = () => this.cleanUp();
    eventBus.on('selection.changed', cleanUp);
    eventBus.on('shape.changed', cleanUp);

    eventBus.on('selection.changed', (event: unknown) => {
      const { newSelection = [] } = event as { newSelection?: DiagramElement[] };
      const allowed = newSelection.filter((el) => isAny(el, ALLOWED_ELEMENTS));

      if (allowed.length === 1) {
        const element = allowed[0];
        if (isLabel(element)) {
          this.createLink(element, element.labelTarget!);
        } else if (element.labels?.length) {
          this.createLink(element.labels[0], element);
        }
      }

      if (allowed.length === 2) {
        const label = allowed.find((el) => isLabel(el));
        const target = allowed.find((el) => el.labels?.includes(label!));
        if (label && target) {
          this.createLink(label, target);
        }
      }
    });

    eventBus.on('shape.changed', (event: unknown) => {
      const { element } = event as { element: DiagramElement };
      if (!isAny(element, ALLOWED_ELEMENTS) || !this.isElementSelected(element)) {
        return;
      }

      if (isLabel(element)) {
        this.createLink(element, element.labelTarget!);
      } else if (element.labels?.length) {
        this.createLink(element.labels[0], element);
      }
    });
  }

  private createLink(label: DiagramElement, target: DiagramElement) {
    const line = createLine([getMid(target), getMid(label)], LINE_STYLE);
    const linePath = line.getAttribute('d');
    if (!linePath) {
      return;
    }

    const labelPath = this.graphicsFactory.getShapePath(label);
    const labelInter = getElementLineIntersection(labelPath, linePath, false);
    if (!labelInter) {
      return;
    }

    const targetPath = this.graphicsFactory.getShapePath(target);
    const targetInter = getElementLineIntersection(targetPath, linePath, true) || getMid(target);

    if (getDistancePointPoint(targetInter, labelInter) < DISTANCE_THRESHOLD) {
      return;
    }

    updateLine(line, [targetInter, labelInter]);
    svgAppend(this.layer, line);
  }

  private cleanUp() {
    this.layer.querySelectorAll(`.${LINE_STYLE.class}`).forEach((node) => svgRemove(node));
  }

  private isElementSelected(element: DiagramElement) {
    return this.selection.get().includes(element);
  }
}

export default {
  __init__: ['labelLink'],
  labelLink: ['type', LabelLink]
};
