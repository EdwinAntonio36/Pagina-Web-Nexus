import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = stripTypeScriptTypes(await readFile(new URL('../src/lib/catalogImages.ts', import.meta.url), 'utf8'));
const { validateImage, MAX_IMAGE_BYTES } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const image = (bytes, type, name = 'foto') => new File([new Uint8Array(bytes)], name, { type });

test('acepta firmas de JPG, PNG y WebP y genera extensión por contenido', async () => {
  assert.equal(await validateImage(image([255,216,255,224], 'image/jpeg', 'nombre-raro.exe')), 'jpg');
  assert.equal(await validateImage(image([137,80,78,71,13,10,26,10], 'image/png')), 'png');
  assert.equal(await validateImage(image([82,73,70,70,0,0,0,0,87,69,66,80], 'image/webp')), 'webp');
});
test('rechaza vacío y archivo que supera 5 MB', async () => {
  await assert.rejects(validateImage(image([], 'image/png')));
  await assert.rejects(validateImage(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'grande.png', { type: 'image/png' })));
});
test('rechaza SVG, tipo falso y archivo de texto renombrado', async () => {
  await assert.rejects(validateImage(new File(['<svg/>'], 'foto.svg', { type: 'image/svg+xml' })));
  await assert.rejects(validateImage(image([255,216,255], 'image/png', 'foto.png')));
  await assert.rejects(validateImage(new File(['texto plano'], 'foto.jpg', { type: 'image/jpeg' })));
});
