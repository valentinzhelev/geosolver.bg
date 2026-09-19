import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * CROSS-REPOSITORY CONTRACT DRIFT CHECK (review-time, not network-level).
 *
 * The calculation contract fixtures exist in two repos with no shared package:
 *   GEOSOLVER.BG/src/domain/geodesy/__fixtures__/   and   geosolver-backend/engines/fixtures/
 * This test recomputes the SHA-256 of THIS repo's copies (line endings normalized) and compares them
 * with the recorded manifest, and pins the combined hash below. The backend has the identical test
 * (engines/__tests__/fixtureIntegrity.test.js) with the identical constant. Editing a fixture in one
 * repo only makes that repo's test fail; a deliberate change means editing both copies, regenerating
 * both manifests, and updating BOTH pinned constants. The hash protects the fixture SOURCE files —
 * never calculated floating-point output.
 */

// Recorded shared expectation. MUST be identical in geosolver-backend/engines/__tests__/fixtureIntegrity.test.js.
const EXPECTED_COMBINED_HASH = 'c3bd52dec679e63887a06594b61af52368f6d709295c7237cfdb5e45b1767d9a';

const DIR = path.join(__dirname, '..', '__fixtures__');
const sha = (text) => crypto.createHash('sha256').update(text).digest('hex');
const normalized = (file) => fs.readFileSync(path.join(DIR, file), 'utf8').replace(/\r\n/g, '\n');
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'fixtures.manifest.json'), 'utf8'));

describe('calculation contract fixtures — SHA-256 integrity', () => {
  it('the manifest lists exactly the six contract fixtures', () => {
    expect(Object.keys(manifest.files).sort()).toEqual([
      'areaCalculation.shipped.vectors.json',
      'orthogonalOffset.v1.legacy.vectors.json',
      'persistedContracts.json',
      'persistedVectors.json',
      'resection.v1.legacy.vectors.json',
      'secondTask.shipped.vectors.json',
    ]);
  });

  it.each(Object.entries(manifest.files))('%s matches its recorded hash', (file, hash) => {
    expect(sha(normalized(file))).toBe(hash);
  });

  it('the combined hash equals the shared recorded expectation (identical constant in the backend repo)', () => {
    const combined = sha(Object.entries(manifest.files).map(([k, v]) => `${k}:${v}`).join('\n') + '\n');
    expect(manifest.combined).toBe(combined);
    expect(combined).toBe(EXPECTED_COMBINED_HASH);
  });

  it('no unlisted JSON fixture sits next to the manifest (a new contract fixture must be added deliberately)', () => {
    const onDisk = fs.readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'fixtures.manifest.json').sort();
    expect(onDisk).toEqual(Object.keys(manifest.files).sort());
  });
});
