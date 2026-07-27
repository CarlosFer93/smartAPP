import fs from 'fs';
import path from 'path';

const file = path.resolve(process.cwd(), 'scripts/reactivos_matematicas.json');
let raw = fs.readFileSync(file, 'utf8');

// Reemplazar \$ invalido de JSON por $
raw = raw.replace(/\\(\$)/g, '$1');

try {
  const parsed = JSON.parse(raw);
  fs.writeFileSync(file, JSON.stringify(parsed, null, 2));
  console.log('✅ JSON validado y formateado correctamente.');
} catch (err) {
  console.error('Error parseando JSON:', err.message);
}
