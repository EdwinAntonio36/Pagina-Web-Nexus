import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import Papa from 'papaparse';

const root = fileURLToPath(new URL('../', import.meta.url));
const converterSource = await readFile(resolve(root, 'scripts/sheet-product.ts'), 'utf8');
const fallbackSource = stripTypeScriptTypes(await readFile(resolve(root, 'src/data/products.ts'), 'utf8'));
const fallbackModule = `data:text/javascript;base64,${Buffer.from(fallbackSource).toString('base64')}`;
const converter = stripTypeScriptTypes(converterSource).replace('"../src/data/products.ts"', JSON.stringify(fallbackModule));
const { rowToProduct, SHEET_CSV_URL } = await import(`data:text/javascript;base64,${Buffer.from(converter).toString('base64')}`);

const response = await fetch(SHEET_CSV_URL, { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Google Sheets respondió ${response.status}`);
const csv = await response.text();
const parsed = Papa.parse(csv, { header: true, skipEmptyLines: 'greedy' });
if (parsed.errors.length) throw new Error(JSON.stringify(parsed.errors));
const products = parsed.data.map(rowToProduct).filter((product) => product.name);
if (!products.length) throw new Error('La hoja no contiene productos válidos.');
const ids = new Set();
for (const product of products) {
  if (!product.id || ids.has(product.id)) throw new Error(`ID vacío o duplicado: ${product.id}`);
  if (!product.price || !product.image) throw new Error(`Falta precio o imagen: ${product.id}`);
  ids.add(product.id);
}

const quote = (value) => value == null ? 'null' : `'${String(value).replaceAll("'", "''")}'`;
const rows = products.map((p, index) => `(${[
  p.id, p.brand, p.model, p.name, p.tag, p.description, p.price,
  p.oldPrice, p.monthlyPayment, p.image,
].map(quote).join(', ')}, ${[p.gallery, p.capacities, p.colors, p.simTypes, p.specs].map((v) => `${quote(JSON.stringify(v))}::jsonb`).join(', ')}, ${index})`);
const sql = `-- Importación desde Google Sheets. ${products.length} productos.
-- Conserva IDs, precios, variantes, imágenes y orden del catálogo actual.
-- Al repetirlo, solo agrega IDs que todavía no existan; no sobrescribe cambios.
begin;
insert into public.productos
(id, brand, model, name, tag, description, price, "oldPrice", "monthlyPayment", image,
 gallery, capacities, colors, "simTypes", specs, sort_order)
values
${rows.join(',\n')}
on conflict (id) do nothing;
commit;
`;
await writeFile(resolve(root, 'supabase/02-importar-catalogo.sql'), sql);
await writeFile(resolve(root, 'supabase/catalogo-snapshot.json'), JSON.stringify(products, null, 2) + '\n');
console.log(`Importación preparada: ${products.length} productos con IDs únicos.`);
