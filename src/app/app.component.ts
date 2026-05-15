import { Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { AppToolbarComponent } from './toolbar/toolbar.component';
import { ImportEvent, NgBpmnComponent, NgCmmnComponent, NgDmnComponent } from '@denizz311/ng-bpmn';

@Component({
  standalone: true,
  imports: [RouterOutlet, NgBpmnComponent, AppToolbarComponent, NgDmnComponent, NgCmmnComponent, MatTabsModule],
  selector: 'ng-bpmn-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'ng-bpmn-app';
  importError?: Error;

  handleImported(event: ImportEvent) {
    const { type, error, warnings } = event;

    if (type === 'success') {
      console.log(`Rendered diagram (%s warnings)`, warnings?.length);
    }

    if (type === 'error') {
      console.error('Failed to render diagram', error);
    }

    this.importError = error;
  }

  onChanged() {
    // Diagram change events available when wiring persistence.
  }
}
