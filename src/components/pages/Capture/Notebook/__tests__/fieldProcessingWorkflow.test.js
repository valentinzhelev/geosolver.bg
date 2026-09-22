import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FieldProcessingWorkflow from '../FieldProcessingWorkflow';
import { fieldProcessingApi } from '../../../../../services/fieldProcessingApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../../services/fieldProcessingApi', () => ({
  fieldProcessingApi: { listRuns: jest.fn(), createRun: jest.fn(), createTraverseRun: jest.fn(), getRun: jest.fn(), createPoints: jest.fn() },
}));

let root;
let container;
async function mount() {
  fieldProcessingApi.listRuns.mockResolvedValue([]);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<FieldProcessingWorkflow fieldObservationSetId="fos1" projectId="proj1" bg />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const click = (el) => act(async () => { el.click(); });

describe('FieldProcessingWorkflow: offers a choice between polar and traverse processing', () => {
  it('defaults to the polar workflow', async () => {
    await mount();
    expect(q('field-processing-mode-polar').getAttribute('aria-selected')).toBe('true');
    expect(q('field-processing-start')).toBeTruthy(); // FieldProcessingResults idle screen
    expect(fieldProcessingApi.listRuns).toHaveBeenCalledWith('fos1');
  });

  it('switching to the traverse tab mounts TraverseProcessingResults instead', async () => {
    await mount();
    await click(q('field-processing-mode-traverse'));
    expect(q('field-processing-mode-traverse').getAttribute('aria-selected')).toBe('true');
    expect(q('traverse-start')).toBeTruthy();
    expect(q('field-processing-start')).toBeFalsy();
  });

  it('switching back to polar restores that workflow', async () => {
    await mount();
    await click(q('field-processing-mode-traverse'));
    await click(q('field-processing-mode-polar'));
    expect(q('field-processing-start')).toBeTruthy();
    expect(q('traverse-start')).toBeFalsy();
  });
});
