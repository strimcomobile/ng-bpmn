export enum ModelerActions {
  cut = 'cut',
  copy = 'copy',
  paste = 'paste',
  find = 'find',
  undo = 'undo',
  canUndo = 'canUndo',
  redo = 'redo',
  canRedo = 'canRedo',
  setColor = 'setColor',
  handTool = 'handTool',
  lassoTool = 'lassoTool',
  spaceTool = 'spaceTool',
  globalConnectTool = 'globalConnectTool',
  directEditing = 'directEditing',
  selectElements = 'selectElements',
  removeSelection = 'removeSelection',
  zoom = 'zoom',
  resetZoom = 'resetZoom',
  zoomIn = 'zoomIn',
  zoomOut = 'zoomOut',
  zoomToFit = 'zoomToFit',
  distributeElements = 'distributeElements',
  alignElements = 'alignElements',
  hasSelection = 'hasSelection',
  showMinimap = 'showMinimap',
  hideMinimap = 'hideMinimap',
  moveSelection = 'moveSelection',
  toggleProperties = 'toggleProperties',
  exportImage = 'exportImage',
  exportSvg = 'exportSvg',
  exportXML = 'exportXML',
}

export type ExportImageFormat = 'png' | 'jpeg';

export interface ExportImageOptions {
  format?: ExportImageFormat;
  fileName?: string;
  scale?: number;
  background?: string;
}
