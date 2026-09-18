import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { qrGenerator } from '../src/commands/qrcode.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(PROJECT_ROOT, 'data');

test('qrGenerator blocks path traversal attempts', async () => {
  // We'll use a traversal path that would otherwise go up one level
  const maliciousFileName = '../../../traversal_test.png';
  const expectedSafeName = 'traversal_test.png';
  const expectedSafePath = path.join(DATA_DIR, expectedSafeName);
  
  // Clean up if it already exists
  if (fs.existsSync(expectedSafePath)) {
    fs.unlinkSync(expectedSafePath);
  }
  
  const traversalDestPath = path.join(DATA_DIR, maliciousFileName);
  if (fs.existsSync(traversalDestPath)) {
    fs.unlinkSync(traversalDestPath);
  }
  
  // Call generator
  await qrGenerator('test_text', maliciousFileName);
  
  // Verify it was created in the safe path, NOT the malicious path
  assert.ok(fs.existsSync(expectedSafePath), 'File should be created in the safe data directory with the base name');
  
  // Clean up
  if (fs.existsSync(expectedSafePath)) {
    fs.unlinkSync(expectedSafePath);
  }
});
