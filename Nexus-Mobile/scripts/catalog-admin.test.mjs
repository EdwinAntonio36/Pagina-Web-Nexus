import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';

const source = stripTypeScriptTypes(await readFile(new URL('../src/lib/catalogAdmin.ts', import.meta.url), 'utf8'));
const { emptyProduct, prepareProduct, productPayload } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const valid = () => ({ ...emptyProduct(), id: 'equipo-prueba', name: 'Equipo', brand: 'Marca', price: '$12,999.00', image: '/equipo.png' });

test('crear oculto y completar galería con imagen principal', () => {
  const product = prepareProduct(valid());
  assert.equal(product.active, false);
  assert.deepEqual(product.gallery, ['/equipo.png']);
});
test('rechazar precios, IDs y rutas inválidas', () => {
  for (const patch of [{ id: 'Equipo Prueba' }, { price: 'gratis' }, { price: '$1,2,3' }, { image: 'javascript:alert(1)' }, { image: '//otro.test/foto.png' }, { sort_order: -1 }]) {
    assert.throws(() => prepareProduct({ ...valid(), ...patch }));
  }
});
test('rechazar variantes ambiguas o incompletas', () => {
  assert.throws(() => prepareProduct({ ...valid(), capacities: [{ label: '256 GB' }, { label: '256 gb' }] }));
  assert.throws(() => prepareProduct({ ...valid(), colors: [{ name: 'Negro', hex: 'negro' }] }));
  assert.throws(() => prepareProduct({ ...valid(), specs: [{ icon: 'signal', label: 'Red', value: '' }] }));
});
test('editar permite borrar opcionales sin enviar metadatos de la base', () => {
  const payload = productPayload(prepareProduct({ ...valid(), created_at: 'fecha', tag: '', oldPrice: '', monthlyPayment: '' }));
  assert.equal(payload.tag, null);
  assert.equal(payload.oldPrice, null);
  assert.equal(payload.monthlyPayment, null);
  assert.ok(!('created_at' in payload));
});
test('preservar variantes y limpiar líneas vacías', () => {
  const product = prepareProduct({ ...valid(), simTypes: ['SIM física', '', ' eSIM '],
    colors: [{ name: 'Azul', hex: '#123456', images: ['https://example.com/azul.jpg', ''] }],
    capacities: [{ label: '512 GB', price: '$15,999.00', monthlyPayment: '13 pagos' }] });
  assert.deepEqual(product.simTypes, ['SIM física', 'eSIM']);
  assert.deepEqual(product.colors[0].images, ['https://example.com/azul.jpg']);
  assert.equal(product.capacities[0].price, '$15,999.00');
});
test('los 14 productos migrados pueden volver a guardarse', async () => {
  const products = JSON.parse(await readFile(new URL('../supabase/catalogo-snapshot.json', import.meta.url), 'utf8'));
  for (const [sort_order, product] of products.entries()) {
    assert.doesNotThrow(() => prepareProduct({ ...product, active: true, sort_order }), product.id);
  }
});
