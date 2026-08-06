# Angular BPMN

Standalone BPMN components for your Angular applications.

## Getting Started

Install the dependency:

```sh
npm i @denizz311/ng-bpmn
```

## BPMN

```html
<ng-bpmn [url]="diagramUrl" />
```

![default](https://github.com/strimcomobile/ng-bpmn/blob/main/libs/ng-bpmn/docs/ng-bpmn-default.png?raw=true)

### Keyboard Hotkeys

```html
<ng-bpmn [url]="diagramUrl" [hotkeys]="true" />
```

Supported hotkeys:

| Keys | MacOS | Action |
| --- | --- | --- |
| `Ctrl`+`a` | `Command`+`a` | select all |
| `e` | `e` | direct editing |
| `h` | `h` | hand tool |
| `l` | `l` | lasso tool |
| `s` | `s` | space tool |
| `c` | `c` | global connect tool |
| `Ctrl`+`=` | `Command`+`=` | zoom in |
| `Ctrl`+`-` | `Command`+`-` | zoom out |
| `Ctrl`+`0` | `Command`+`0` | reset zoom |
| `Ctrl`+`9` | `Command`+`9` | zoom to fit |
| `Ctrl`+`z` | `Command`+`z` | undo |
| `Ctrl`+`Shift`+`z` | `Command`+`Shift`+`z` | redo |
| `Backspace` | `Backspace` | remove selection |
| `Ctrl`+`c` | `Command`+`c` | copy selection |
| `Ctrl`+`v` | `Command`+`v` | paste |
| `Ctrl`+`x` | `Command`+`x` | cut selection |
| `Ctrl`+`f` | `Command`+`f` | find |
| `↑` `↓` `←` `→` | `↑` `↓` `←` `→` | move selection (1px) |
| `Shift`+`↑` `↓` `←` `→` | `Shift`+`↑` `↓` `←` `→` | move selection (10px) |

Requires an element to be selected. With `[hotkeys]="false"`, click the diagram canvas first so it has focus.

### Connection label link

When a sequence flow (or its label) is selected, a dashed line links the external label to the connection:

```html
<ng-bpmn [url]="diagramUrl" [showLabelLink]="true" />
```

This matches the behavior added in [bpmn-js 18.9](https://github.com/bpmn-io/bpmn-js/pull/2328) and is enabled by default.

### Invoking Component API

You can get the reference to the `ng-bpmn` component, and pass to the underlying application code.

> For the sake of simplicity, some of the code was omitted.

`app.component.html`

```html
<ng-bpmn #bpmn [url]="diagramUrl" />
<button (click)="exportSVG(bpmn)">Export SVG</button>
```

`app.component.ts`

```ts
import { saveAs } from 'file-saver';

export class AppComponent {
  exportSVG(bpmnComponent: NgBpmnComponent) {
    bpmnComponent.saveXML().then((content) => {
      if (content) {
        const blob = new Blob([content]);
        saveAs(blob, 'diagram.xml');
      }
    });
  }
}
```

### Properties Panel

```html
<ng-bpmn [url]="diagramUrl" [showProperties]="true" />
```

![properties panel](https://github.com/strimcomobile/ng-bpmn/blob/main/libs/ng-bpmn/docs/ng-bpmn-properties.png?raw=true)

### Minimap

```html
<ng-bpmn [url]="diagramUrl" [showProperties]="true" [showMinimap]="true" />
```

![minimap](https://github.com/strimcomobile/ng-bpmn/blob/main/libs/ng-bpmn/docs/ng-bpmn-minimap.png?raw=true)

### Comments

Embedded comments are stored in the BPMN XML (`bpmn:documentation` with `textFormat="text/x-comments"`) via [bpmn-js-embedded-comments](https://github.com/bpmn-io/bpmn-js-embedded-comments).

```html
<ng-bpmn [url]="diagramUrl" [showComments]="true" />
```

Select a flow node (task, event, gateway), then click the green comment icon on the element. Type your comment and press **Enter** to save (Shift+Enter for a new line). Click elsewhere on the canvas to collapse open comment boxes.

Access the underlying service from a component reference:

```ts
bpmnComponent.comments?.getComments(element);
```

### Task / event resize

Allows resizing tasks (including call activities and sub-processes) and optionally events via [bpmn-js-task-resize](https://www.npmjs.com/package/bpmn-js-task-resize):

```html
<ng-bpmn
  [url]="diagramUrl"
  [taskResizingEnabled]="true"
  [eventResizingEnabled]="true"
/>
```

Select a task or event, then drag a resize handle. Tasks have a minimum size of 100×80; events 36×36.

## DMN

```html
<ng-dmn [url]="diagramUrl" />
```

### Properties Panel

```html
<ng-dmn [url]="diagramUrl" [showProperties]="true" />
```

### Keyboard Hotkeys

```html
<ng-dmn [url]="diagramUrl" [hotkeys]="true" />
```

Supported hotkeys:

| Keys | MacOS | Action |
| --- | --- | --- |
| `Ctrl`+`a` | `Command`+`a` | select all |
| `e` | `e` | direct editing |
| `h` | `h` | hand tool |
| `l` | `l` | lasso tool |
| `Ctrl`+`=` | `Command`+`=` | zoom in |
| `Ctrl`+`-` | `Command`+`-` | zoom out |
| `Ctrl`+`0` | `Command`+`0` | reset zoom |
| `Ctrl`+`9` | `Command`+`9` | zoom to fit |
| `Ctrl`+`z` | `Command`+`z` | undo |
| `Ctrl`+`Shift`+`z` | `Command`+`Shift`+`z` | redo |
| `Backspace` | `Backspace` | remove selection |

## CMMN

```html
<ng-cmmn [url]="diagramUrl" />
```

### Properties Panel

```html
<ng-cmmn [url]="diagramUrl" [showProperties]="true" />
```

### Keyboard Hotkeys

```html
<ng-cmmn [url]="diagramUrl" [hotkeys]="true" />
```

Supported hotkeys:

| Keys | MacOS | Action |
| --- | --- | --- |
| `Ctrl`+`a` | `Command`+`a` | select all |
| `e` | `e` | direct editing |
| `h` | `h` | hand tool |
| `l` | `l` | lasso tool |
| `c` | `c` | global connect tool |
| `Ctrl`+`=` | `Command`+`=` | zoom in |
| `Ctrl`+`-` | `Command`+`-` | zoom out |
| `Ctrl`+`0` | `Command`+`0` | reset zoom |
| `Ctrl`+`9` | `Command`+`9` | zoom to fit |
| `Ctrl`+`z` | `Command`+`z` | undo |
| `Ctrl`+`Shift`+`z` | `Command`+`Shift`+`z` | redo |
| `Backspace` | `Backspace` | remove selection |
| `Ctrl`+`f` | `Command`+`f` | find |
