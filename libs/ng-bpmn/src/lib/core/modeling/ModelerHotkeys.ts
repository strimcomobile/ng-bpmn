import { ModelerActions } from './ModelerActions';

export type ModelerHotkeyBinding =
  | ModelerActions
  | {
      action: ModelerActions;
      options?: unknown;
    };

export type ModelerHotkeyMap = Record<string, ModelerHotkeyBinding>;

/** bpmn-js: arrows move selection; Shift accelerates (10px vs 1px). */
export const MOVE_SELECTION_HOTKEYS: ModelerHotkeyMap = {
  up: { action: ModelerActions.moveSelection, options: { direction: 'up', accelerated: false } },
  down: { action: ModelerActions.moveSelection, options: { direction: 'down', accelerated: false } },
  left: { action: ModelerActions.moveSelection, options: { direction: 'left', accelerated: false } },
  right: { action: ModelerActions.moveSelection, options: { direction: 'right', accelerated: false } },
  'shift+up': { action: ModelerActions.moveSelection, options: { direction: 'up', accelerated: true } },
  'shift+down': { action: ModelerActions.moveSelection, options: { direction: 'down', accelerated: true } },
  'shift+left': { action: ModelerActions.moveSelection, options: { direction: 'left', accelerated: true } },
  'shift+right': { action: ModelerActions.moveSelection, options: { direction: 'right', accelerated: true } }
};
