/**
 * Inline SVG icons rendered into bpmn-js palette entries.
 *
 * Each icon is `currentColor`‑filled so palette hover/active states keep
 * working without any extra CSS. The strings are designed to be inlined
 * inside an `<div class="entry">` host element via the palette `html` field.
 */

const SVG_ATTRS =
  'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ' +
  'width="22" height="22" fill="none" stroke="currentColor" ' +
  'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
  'aria-hidden="true"';

function svg(body: string): string {
  return `<svg ${SVG_ATTRS}>${body}</svg>`;
}

export const ControlIcons = {
  copy: svg(
    '<rect x="9" y="9" width="13" height="13" rx="2"/>' +
      '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'
  ),
  cut: svg(
    '<circle cx="6" cy="6" r="3"/>' +
      '<circle cx="6" cy="18" r="3"/>' +
      '<line x1="20" y1="4" x2="8.12" y2="15.88"/>' +
      '<line x1="14.47" y1="14.48" x2="20" y2="20"/>' +
      '<line x1="8.12" y1="8.12" x2="12" y2="12"/>'
  ),
  paste: svg(
    '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>' +
      '<rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>'
  ),
  undo: svg('<path d="M3 7v6h6"/>' + '<path d="M21 17a9 9 0 0 0-15-6.7L3 13"/>'),
  redo: svg('<path d="M21 7v6h-6"/>' + '<path d="M3 17a9 9 0 0 1 15-6.7l3 2.7"/>'),
  zoomIn: svg(
    '<circle cx="11" cy="11" r="7"/>' +
      '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
      '<line x1="11" y1="8" x2="11" y2="14"/>' +
      '<line x1="8" y1="11" x2="14" y2="11"/>'
  ),
  zoomOut: svg(
    '<circle cx="11" cy="11" r="7"/>' +
      '<line x1="21" y1="21" x2="16.65" y2="16.65"/>' +
      '<line x1="8" y1="11" x2="14" y2="11"/>'
  ),
  zoomToFit: svg(
    '<path d="M3 9V5a2 2 0 0 1 2-2h4"/>' +
      '<path d="M21 9V5a2 2 0 0 0-2-2h-4"/>' +
      '<path d="M3 15v4a2 2 0 0 0 2 2h4"/>' +
      '<path d="M21 15v4a2 2 0 0 1-2 2h-4"/>'
  ),
  toggleProperties: svg(
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
      '<line x1="15" y1="3" x2="15" y2="21"/>' +
      '<line x1="18" y1="8" x2="18.01" y2="8"/>' +
      '<line x1="18" y1="12" x2="18.01" y2="12"/>' +
      '<line x1="18" y1="16" x2="18.01" y2="16"/>'
  ),
  exportPng: svg(
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
      '<circle cx="9" cy="9" r="1.5"/>' +
      '<path d="M21 15l-5-5L5 21"/>'
  ),
  exportJpg: svg(
    '<rect x="3" y="3" width="18" height="18" rx="2"/>' +
      '<path d="M3 17l5-5 4 4 3-3 6 6"/>' +
      '<circle cx="8" cy="8" r="1.5"/>'
  ),
  exportSvg: svg(
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<path d="M8 18c0-1 .8-1.5 1.7-1.5s1.6.6 1.6 1.5-.7 1.4-1.6 1.5c-.9 0-1.7.4-1.7 1.3"/>' +
      '<path d="M13.5 16.5l1.2 4 1.2-4"/>'
  ),
  exportXML: svg(
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<polyline points="10 13 8 15.5 10 18"/>' +
      '<polyline points="14 13 16 15.5 14 18"/>'
  ),
} as const;
