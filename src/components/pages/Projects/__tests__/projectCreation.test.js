import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  emptyProjectForm,
  validateProjectForm,
  buildProjectPayload,
  addCreatedProject,
  nextStepLinks,
  loadProjectSummaries,
} from '../../../../utils/projectCreation';
import { DEFAULT_CRS } from '../../../../domain/geodesy/crsTransform';
import { fieldbooksApi } from '../../../../services/fieldbookApi';
import ProjectCreateForm from '../ProjectCreateForm';
import { ProjectHubEmptyState, ProjectNextSteps } from '../ProjectHubParts';

// QA-01: a Project is created directly from the Project Hub. It needs neither Field Book pilot access nor a workspace.

// react-router-dom (v7) does not resolve under this Jest setup; these components only need <Link>
jest.mock(
  'react-router-dom',
  () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }),
  { virtual: true }
);

const src = (rel) => fs.readFileSync(path.join(__dirname, '..', rel), 'utf8');

describe('empty Project Hub', () => {
  const html = renderToStaticMarkup(<ProjectHubEmptyState language="bg" onCreate={() => {}} />);

  it('shows the primary "Създай проект" call to action (a button, not a link into the pilot flow)', () => {
    expect(html).toMatch(/<button[^>]*>Създай проект<\/button>/);
  });

  it('the old dead end is gone: no "Отвори карнети" CTA; the Field Book link is only a small secondary link', () => {
    expect(html).not.toContain('Отвори карнети');
    expect(html).toContain('href="/fieldbook"');
    expect(html).toContain('Електронни карнети (пилот)');
    expect(html.match(/<button/g)).toHaveLength(1);
  });

  it('the hub page renders it for an empty list and offers "Нов проект" in the toolbar', () => {
    const page = src('ProjectHubPage.js');
    expect(page).toContain('<ProjectHubEmptyState');
    expect(page).toMatch(/'Нов проект'/);
    expect(page).not.toContain('Отвори карнети');
  });

  it('English wording is available too', () => {
    expect(renderToStaticMarkup(<ProjectHubEmptyState language="en" />)).toContain('Create project');
  });
});

describe('the creation form (existing POST /projects contract only)', () => {
  const html = renderToStaticMarkup(
    <ProjectCreateForm language="bg" workspaces={[{ _id: 'w1', name: 'Екип А' }, { _id: 'w2', name: 'Екип Б' }]} onSubmit={() => {}} onCancel={() => {}} />
  );

  it('has name, description, coordinate system and workspace; nothing else is invented', () => {
    expect(html).toContain('Име на проекта *');
    expect(html).toContain('Описание (по избор)');
    expect(html).toContain('Координатна система');
    expect(html).toContain('Работно пространство (по избор)');
    expect(html.match(/<input/g)).toHaveLength(1); // name only
    expect(html.match(/<select/g)).toHaveLength(2); // CRS + workspace
    expect(html.match(/<textarea/g)).toHaveLength(1);
  });

  it('shows the actual default CRS (BGS2005 / CCS2005, EPSG:7801) selected and named', () => {
    expect(DEFAULT_CRS).toBe('EPSG:7801');
    expect(html).toMatch(/<option value="EPSG:7801" selected="">/);
    expect(html).toContain('По подразбиране: BGS2005 / CCS2005 (кадастър)');
  });

  it('the workspace select defaults to a personal project and lists the available workspaces', () => {
    expect(html).toMatch(/<option value="" selected="">Без работно пространство \(личен проект\)<\/option>/);
    expect(html).toContain('Екип А');
    expect(html).toContain('Екип Б');
  });

  it('works with NO workspaces at all (nothing forces creating a workspace first)', () => {
    const none = renderToStaticMarkup(<ProjectCreateForm language="bg" workspaces={[]} onSubmit={() => {}} />);
    expect(none).toContain('Без работно пространство (личен проект)');
    expect(none).toContain('Създай проект');
  });
});

describe('payload and validation', () => {
  it('personal project: name/notes/crs only, no workspace key; the default CRS is explicit, never silently another', () => {
    expect(buildProjectPayload({ ...emptyProjectForm(), name: '  Проект 1  ', notes: ' бележка ' })).toEqual({
      name: 'Проект 1', notes: 'бележка', crs: 'EPSG:7801',
    });
  });

  it('a chosen CRS and workspace are sent exactly', () => {
    expect(buildProjectPayload({ name: 'P', notes: '', crs: 'EPSG:7799', workspaceId: 'w1' })).toEqual({
      name: 'P', notes: '', crs: 'EPSG:7799', workspaceId: 'w1',
    });
  });

  it('validation: name required; unsupported CRS refused; Bulgarian messages', () => {
    expect(validateProjectForm({ ...emptyProjectForm(), name: '   ' }, 'bg')).toBe('Въведете име на проекта.');
    expect(validateProjectForm({ ...emptyProjectForm(), name: 'ok', crs: 'EPSG:9999' }, 'bg')).toMatch(/поддържана/);
    expect(validateProjectForm({ ...emptyProjectForm(), name: 'ok' }, 'bg')).toBe('');
    expect(validateProjectForm({ ...emptyProjectForm(), name: 'x'.repeat(121) }, 'bg')).toMatch(/твърде дълго/);
  });
});

describe('creating a project through the real API helper (no Field Book pilot involved)', () => {
  const realFetch = global.fetch;
  afterEach(() => { global.fetch = realFetch; });

  it('POSTs to /fieldbooks/projects with the payload and never touches the pilot endpoints', async () => {
    const calls = [];
    global.fetch = jest.fn(async (url, options) => {
      calls.push({ url, options });
      return { ok: true, status: 201, json: async () => ({ success: true, data: { _id: 'p-new', ...JSON.parse(options.body) } }) };
    });
    const payload = buildProjectPayload({ name: 'Нов', notes: '', crs: 'EPSG:7801', workspaceId: '' });
    const res = await fieldbooksApi.createProject(payload);
    expect(res.data.crs).toBe('EPSG:7801'); // CRS persisted as sent
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toMatch(/\/fieldbooks\/projects$/);
    expect(calls[0].options.method).toBe('POST');
    expect(calls.some((c) => /fieldbook-pilot/.test(c.url))).toBe(false);
    expect(JSON.parse(calls[0].options.body)).toEqual({ name: 'Нов', notes: '', crs: 'EPSG:7801' });
  });

  it('a workspace refusal (403) surfaces as an error the form can show', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 403, json: async () => ({ success: false, message: 'Нямате права за този workspace.' }) }));
    await expect(fieldbooksApi.createProject({ name: 'P', workspaceId: 'forged' })).rejects.toThrow(/права/);
  });
});

describe('after creation', () => {
  it('the new project appears immediately at the top of the list (no duplicate on reload)', () => {
    const existing = [{ _id: 'a', name: 'A' }, { _id: 'b', name: 'B' }];
    const created = { _id: 'c', name: 'C', crs: 'EPSG:7801' };
    expect(addCreatedProject(existing, created).map((p) => p._id)).toEqual(['c', 'a', 'b']);
    expect(addCreatedProject([created, ...existing], created).map((p) => p._id)).toEqual(['c', 'a', 'b']);
    expect(addCreatedProject(undefined, created)).toEqual([created]);
  });

  it('the hub adds it to state, selects it, and shows the next steps', () => {
    const page = src('ProjectHubPage.js');
    expect(page).toContain('fieldbooksApi.createProject(payload)');
    expect(page).toContain('setProjects((prev) => addCreatedProject(prev, created))');
    expect(page).toContain('setCreatedId(String(created._id))');
    expect(page).toContain('<ProjectNextSteps');
  });

  it('the FIRST next action is "Добави точки" (to the Points Library of this project), not Field Books', () => {
    const links = nextStepLinks('p123', 'bg');
    expect(links[0]).toMatchObject({ key: 'points', primary: true, label: 'Добави точки', to: '/points?projectId=p123' });
    expect(links.filter((l) => l.primary)).toHaveLength(1);
    expect(links.map((l) => l.key)).toEqual(expect.arrayContaining(['calculations', 'map', 'fieldbooks']));
    expect(links.find((l) => l.key === 'fieldbooks').label).toMatch(/пилот/);
    const html = renderToStaticMarkup(<ProjectNextSteps project={{ _id: 'p123', name: 'Мой проект' }} language="bg" />);
    expect(html).toContain('Проектът „Мой проект“ е създаден');
    expect(html.indexOf('Добави точки')).toBeLessThan(html.indexOf('Изчисления'));
    expect(html).toContain('href="/points?projectId=p123"');
  });
});

describe('the pilot restriction does not break the hub (existing projects keep loading)', () => {
  const list = [{ _id: 'a' }, { _id: 'b' }];
  const pilotRefused = () => Promise.reject(Object.assign(new Error('Нямате достъп до пилотната версия'), { status: 403 }));

  it('field books refused (403): point and calculation counts are still loaded; books are flagged unavailable', async () => {
    const s = await loadProjectSummaries(list, {
      listPoints: async (id) => ({ data: id === 'a' ? [1, 2, 3] : [1] }),
      listBooks: pilotRefused,
      getCalcHistory: async () => ({ pagination: { totalItems: 4 } }),
    });
    expect(s.pointCounts).toEqual({ a: 3, b: 1 });
    expect(s.calcCounts).toEqual({ a: 4, b: 4 });
    expect(s.bookCounts).toEqual({ a: 0, b: 0 });
    expect(s.booksAvailable).toBe(false);
  });

  it('with pilot access everything is counted as before', async () => {
    const s = await loadProjectSummaries(list, {
      listPoints: async () => ({ data: [1, 2] }),
      listBooks: async () => ({ data: [1] }),
      getCalcHistory: async () => ({ pagination: { totalItems: 7 } }),
    });
    expect(s).toEqual({ pointCounts: { a: 2, b: 2 }, bookCounts: { a: 1, b: 1 }, calcCounts: { a: 7, b: 7 }, booksAvailable: true });
  });

  it('an empty list and failing individual sources never throw', async () => {
    expect(await loadProjectSummaries([], {})).toMatchObject({ booksAvailable: true });
    const s = await loadProjectSummaries([{ _id: 'a' }], { listPoints: pilotRefused, listBooks: pilotRefused, getCalcHistory: pilotRefused });
    expect(s.pointCounts).toEqual({ a: 0 });
  });

  it('client package / PDF export treat field books as optional', () => {
    const page = src('ProjectHubPage.js');
    expect(page.match(/listBooks\(project\._id\)\.catch\(\(\) => \(\{ data: \[\] \}\)\)/g)).toHaveLength(2);
  });
});

describe('Project Hub terminology', () => {
  it('uses "Проект(и)" consistently on the screen; the stat card is no longer "Обекти"; "Работно пространство" replaces mixed English', () => {
    const page = src('ProjectHubPage.js');
    expect(page).toContain("'Проекти'");
    expect(page).not.toContain("'Обекти'");
    expect(page).toContain("'Работно пространство'");
    expect(page).not.toContain("'Без workspace'");
    const docs = fs.readFileSync(path.join(__dirname, '..', '..', '..', '..', 'config', 'moduleDocs.js'), 'utf8');
    expect(docs).toContain('1. Създай проект');
    expect(docs).toContain("title: { bg: 'Проекти', en: 'Projects' }");
  });
});

describe('Points Library entry point', () => {
  it('the project filter has a visible way to create a project (links to the Project Hub)', () => {
    const points = fs.readFileSync(path.join(__dirname, '..', '..', 'Points', 'PointsPage.js'), 'utf8');
    expect(points).toContain("bg ? '+ Нов проект' : '+ New project'");
    expect(points).toMatch(/to="\/projects"[\s\S]{0,300}Нов проект/);
  });
});
