import { parseGnssCsv } from '../parseGnssImport';

describe('parseGnssCsv', () => {
  test('Name,Northing,Easting,Elevation → X=northing, Y=easting', () => {
    const csv = 'Name,Northing,Easting,Elevation\nP1,5000000,300000,550.1\n';
    const points = parseGnssCsv(csv);
    expect(points).toHaveLength(1);
    expect(points[0].name).toBe('P1');
    expect(points[0].x).toBe(5000000);
    expect(points[0].y).toBe(300000);
    expect(points[0].h).toBe(550.1);
  });

  test('Name,Y,X,H не губи X заради substring', () => {
    const csv = 'Name,Y,X,H\nA,100,200,10\n';
    const points = parseGnssCsv(csv);
    expect(points[0].name).toBe('A');
    expect(points[0].y).toBe(100);
    expect(points[0].x).toBe(200);
    expect(points[0].h).toBe(10);
  });

  test('Y,X,H без Name', () => {
    const csv = 'Y,X,H\n1,2,3\n';
    const points = parseGnssCsv(csv);
    expect(points[0].y).toBe(1);
    expect(points[0].x).toBe(2);
    expect(points[0].h).toBe(3);
  });
});
