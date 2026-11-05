import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
const source = stripTypeScriptTypes(await readFile(new URL('../supabase/functions/_shared/portalValidation.ts', import.meta.url), 'utf8'));
const { normalizeRfc, validRfc, clientInput } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const valid = { nombre: 'Cliente Prueba', rfc: 'AAA010101AAA', email: 'cliente@example.com', password: 'Una-clave-de-prueba-123' };
test('RFC de persona y empresa: normaliza y conserva Ñ y &', () => {
  assert.equal(normalizeRfc(' aaa010101aaa '), 'AAA010101AAA');
  for (const rfc of ['AAA010101AAA', 'AAAA010101AAA', 'A&Ñ010101AAA']) assert.ok(validRfc(rfc));
  for (const rfc of ['', 'AAA', 'AAA010101', 'AAA010101AAA-extra', 'AAA-010101-AAA']) assert.ok(!validRfc(rfc));
});
test('alta rechaza contraseña corta, email inválido y datos incompletos', () => {
  for (const patch of [{ password: '1234' }, { email: 'sin-correo' }, { rfc: '123' }, { nombre: '' }, { password: 'x'.repeat(129) }]) {
    assert.throws(() => clientInput({ ...valid, ...patch }));
  }
});
test('alta limita el payload y no acepta privilegios del navegador', () => {
  const data = clientInput({ ...valid, rfc: ' aaa010101aaa ', email: ' CLIENTE@EXAMPLE.COM ', role: 'admin', active: true, id: 'inventado' });
  assert.deepEqual(Object.keys(data).sort(), ['email','nombre','password','rfc']);
  assert.equal(data.email, 'cliente@example.com');
  assert.equal(data.rfc, 'AAA010101AAA');
});
