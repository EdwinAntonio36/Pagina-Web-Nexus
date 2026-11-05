import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';

const moduleFrom = async (relative) => {
  const text = stripTypeScriptTypes(await readFile(new URL(relative, import.meta.url), 'utf8'));
  return import(`data:text/javascript;base64,${Buffer.from(text).toString('base64')}`);
};
const validation = await moduleFrom('../supabase/functions/_shared/portalValidation.ts');
const http = await moduleFrom('../supabase/functions/_shared/http.ts');
async function handler(name, clients) {
  const source = stripTypeScriptTypes(await readFile(new URL(`../supabase/functions/${name}/index.ts`, import.meta.url), 'utf8'))
    .replace(/^import .+;\s*$/gm, '');
  let serve;
  const env = { SUPABASE_URL: 'https://project.example', SUPABASE_SERVICE_ROLE_KEY: 'test-server-secret', SUPABASE_ANON_KEY: 'test-public', PORTAL_SITE_URL: 'https://site.example' };
  const deno = { env: { get: (key) => env[key] }, serve: (fn) => { serve = fn; } };
  new Function('Deno', 'createClient', 'cors', 'json', 'clientInput', 'normalizeRfc', 'validRfc', source)(
    deno, (_url, key) => clients(key), http.cors, http.json, validation.clientInput, validation.normalizeRfc, validation.validRfc,
  );
  return serve;
}
const request = (body, authorized = true) => new Request('https://edge.example', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: 'Bearer test-user-token' } : {}) }, body: JSON.stringify(body),
});
const queryResult = (result) => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => result });
const input = { rfc: 'AAA010101AAA', nombre: 'Prueba', email: 'cliente@example.com', password: 'Password-prueba-12345' };

test('alta sin sesión se rechaza antes de tocar Auth Admin', async () => {
  const run = await handler('admin-create-client', () => ({}));
  assert.equal((await run(request(input, false))).status, 401);
});
test('cuenta autenticada sin rol admin no puede crear clientes', async () => {
  const run = await handler('admin-create-client', () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'cliente' } } }) },
    from: () => queryResult({ data: null }),
  }));
  assert.equal((await run(request(input))).status, 403);
});
test('RFC duplicado no crea otra cuenta Auth', async () => {
  const run = await handler('admin-create-client', () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
    from: (table) => queryResult({ data: table === 'administradores' ? { user_id: 'owner' } : { id: 'existente' } }),
  }));
  assert.equal((await run(request(input))).status, 409);
});
test('fallo de perfil revierte la cuenta Auth recién creada', async () => {
  let removed;
  const run = await handler('admin-create-client', () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }), admin: {
      createUser: async () => ({ data: { user: { id: 'new-id' } } }),
      deleteUser: async (id) => { removed = id; return {}; },
    } },
    from: (table) => table === 'administradores' ? queryResult({ data: { user_id: 'owner' } })
      : { ...queryResult({ data: null }), insert: async () => ({ error: { code: 'duplicate' } }) },
  }));
  assert.equal((await run(request(input))).status, 500);
  assert.equal(removed, 'new-id');
});
test('rate limit bloquea antes de buscar RFC o autenticar', async () => {
  const run = await handler('portal-access', () => ({ rpc: async () => ({ data: false }) }));
  assert.equal((await run(request({ ...input, action: 'login' }))).status, 429);
});
test('login devuelve solo tokens y usa el correo del servidor', async () => {
  let credentials;
  const run = await handler('portal-access', (key) => key === 'test-server-secret' ? {
    rpc: async () => ({ data: true }),
    from: () => queryResult({ data: { id: 'customer-id', email: input.email, active: true } }),
  } : { auth: { signInWithPassword: async (values) => {
    credentials = values;
    return { data: { user: { id: 'customer-id' }, session: { access_token: 'access', refresh_token: 'refresh', private_email: input.email } } };
  } } });
  const response = await run(request({ ...input, email: 'otro@example.com', action: 'login' }));
  assert.equal(response.status, 200);
  assert.equal(credentials.email, input.email);
  assert.deepEqual(await response.json(), { access_token: 'access', refresh_token: 'refresh' });
});
