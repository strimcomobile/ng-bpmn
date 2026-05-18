import hotkeys from 'hotkeys-js';
import { EditorActions } from './modeling/EditorActions';
import { ModelerActions } from './modeling/ModelerActions';
import { ModelerHotkeyBinding, ModelerHotkeyMap } from './modeling/ModelerHotkeys';

export abstract class ModelerComponent {
  private hotkeyBindings: string[] = [];

  abstract get editorActions(): EditorActions | undefined;

  supportsAction(action: string): boolean {
    if (action && this.editorActions) {
      return this.editorActions.isRegistered(action);
    }
    return false;
  }

  triggerAction(action: string, params?: any): any {
    if (action) {
      return this.editorActions?.trigger(action, params);
    }
    return undefined;
  }

  protected bindHotkeys(actions: ModelerHotkeyMap) {
    for (const key of Object.keys(actions)) {
      const binding: ModelerHotkeyBinding = actions[key];
      const action = typeof binding === 'string' ? binding : binding.action;
      const options = typeof binding === 'string' ? undefined : binding.options;

      if (this.supportsAction(action)) {
        hotkeys(key, (event) => {
          event.preventDefault();
          this.triggerAction(action, options);
        });
        this.hotkeyBindings.push(key);
      } else {
        console.log('Action not supported', action);
      }
    }
  }

  protected unbindHotkeys() {
    for (const key of this.hotkeyBindings) {
      hotkeys.unbind(key);
    }

    this.hotkeyBindings = [];
  }
}
