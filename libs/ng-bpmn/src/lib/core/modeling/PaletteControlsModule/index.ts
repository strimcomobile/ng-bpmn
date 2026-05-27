import PaletteControlsProvider, { PaletteControlsConfig } from './PaletteControlsProvider';

export type { PaletteControlsConfig };

export default {
  __init__: ['paletteControls'],
  paletteControls: ['type', PaletteControlsProvider],
};
