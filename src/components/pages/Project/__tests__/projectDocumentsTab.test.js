import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectDocumentsTab from '../ProjectDocumentsTab';
import { reportsApi } from '../../../../services/reportsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../../services/reportsApi', () => ({
  reportsApi: { listReports: jest.fn(), createReport: jest.fn(), getReport: jest.fn(), getFileObjectUrl: jest.fn() },
}));

const polarReport = () => ({
  id: 'report1', projectId: 'proj1', reportType: 'POLAR_PROCESSING_REPORT', title: 'Отчет за полярна обработка',
  documentNumber: null, sourceType: 'field-processing-run', sourceId: 'run1', templateVersion: 'report-engine-2.5.0.0',
  generatedAt: '2026-09-22T10:00:00Z', generatedBy: { id: 'user1', name: 'Иван Иванов' }, fileSize: 15234, fileMime: 'application/pdf',
});
const coordListReport = () => ({
  id: 'report2', projectId: 'proj1', reportType: 'PROJECT_COORDINATE_LIST', title: 'Координатен регистър',
  documentNumber: null, sourceType: 'project-points-snapshot', sourceId: null, templateVersion: 'report-engine-2.5.0.0',
  generatedAt: '2026-09-23T09:00:00Z', generatedBy: { id: 'user1', name: 'Иван Иванов' }, fileSize: 8000, fileMime: 'application/pdf',
});

let root;
let container;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectDocumentsTab projectId="proj1" bg />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const qa = (testid) => [...container.querySelectorAll(`[data-testid="${testid}"]`)];
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('ProjectDocumentsTab: lists generated reports in professional Bulgarian', () => {
  it('shows an empty state when there are no reports yet', async () => {
    reportsApi.listReports.mockResolvedValue([]);
    await mount();
    await flush();
    expect(reportsApi.listReports).toHaveBeenCalledWith('proj1');
    expect(q('project-documents-empty')).toBeTruthy();
  });

  it('lists mixed report types with translated labels, never a raw enum string', async () => {
    reportsApi.listReports.mockResolvedValue([coordListReport(), polarReport()]);
    await mount();
    await flush();
    const rows = qa('document-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Координатен регистър');
    expect(rows[0].textContent).not.toContain('PROJECT_COORDINATE_LIST');
    expect(rows[1].textContent).toContain('Отчет за полярна обработка');
    expect(rows[1].textContent).not.toContain('POLAR_PROCESSING_REPORT');
    expect(rows[1].textContent).not.toContain('field-processing-run');
    expect(rows[1].textContent).toContain('Иван Иванов');
  });

  it('also renders mobile cards with the same data', async () => {
    reportsApi.listReports.mockResolvedValue([polarReport()]);
    await mount();
    await flush();
    expect(qa('document-card')).toHaveLength(1);
  });
});

describe('generating a coordinate list directly from Documents', () => {
  it('calls createReport with PROJECT_COORDINATE_LIST and prepends the new report to the list', async () => {
    reportsApi.listReports.mockResolvedValue([]);
    reportsApi.createReport.mockResolvedValue(coordListReport());
    await mount();
    await flush();
    await click(q('documents-generate-coordinate-list'));
    await flush();
    expect(reportsApi.createReport).toHaveBeenCalledWith({ reportType: 'PROJECT_COORDINATE_LIST', projectId: 'proj1' });
    expect(qa('document-row')).toHaveLength(1);
  });

  it('generating again creates ANOTHER entry, never replaces the first', async () => {
    reportsApi.listReports.mockResolvedValue([coordListReport()]);
    reportsApi.createReport.mockResolvedValue({ ...coordListReport(), id: 'report3' });
    await mount();
    await flush();
    await click(q('documents-generate-coordinate-list'));
    await flush();
    expect(qa('document-row')).toHaveLength(2);
  });

  it('a failed generation shows the error without losing the existing list', async () => {
    reportsApi.listReports.mockResolvedValue([polarReport()]);
    reportsApi.createReport.mockRejectedValue({ message: 'Грешка при заявката.' });
    await mount();
    await flush();
    await click(q('documents-generate-coordinate-list'));
    await flush();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Грешка при заявката.');
    expect(qa('document-row')).toHaveLength(1);
  });
});

describe('downloading a report', () => {
  it('fetches an object URL and triggers a download without navigating away', async () => {
    reportsApi.listReports.mockResolvedValue([polarReport()]);
    reportsApi.getFileObjectUrl.mockResolvedValue('blob:http://localhost/fake-pdf');
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    await mount();
    await flush();
    await click(q('document-download'));
    await flush();
    expect(reportsApi.getFileObjectUrl).toHaveBeenCalledWith('report1');
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
