import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();
jest.mock('bpmn-js/lib/Modeler', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        attachTo: jest.fn(),
        destroy: jest.fn()
      };
    })
  };
});

jest.mock('bpmn-js-properties-panel', () => {
  return {
    default: jest.fn()
  };
});

jest.mock('@bpmn-io/add-exporter', () => {
  return {
    default: jest.fn()
  };
});

jest.mock('bpmn-js-native-copy-paste', () => {
  return {
    default: {
      __init__: ['nativeCopyPaste'],
      nativeCopyPaste: ['type', class NativeCopyPaste {}]
    }
  };
});

jest.mock('dmn-js/lib/Modeler', () => {
  return {
    default: jest.fn()
  };
});

jest.mock('dmn-js-properties-panel', () => {
  return {
    default: jest.fn()
  };
});

jest.mock('cmmn-js/lib/Modeler', () => {
  return {
    default: jest.fn().mockImplementation(() => {
      return {
        on: jest.fn(),
        destroy: jest.fn()
      };
    })
  };
});

jest.mock('cmmn-js-properties-panel', () => {
  return {
    default: jest.fn()
  };
});

jest.mock('cmmn-js-properties-panel/lib/provider/cmmn', () => {
  return {
    default: jest.fn()
  };
});
