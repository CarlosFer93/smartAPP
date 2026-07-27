import fs from 'fs';
import path from 'path';
import { createClient } from '@insforge/sdk';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value;
    }
  });
}

const insforge = createClient({
  baseUrl: process.env.INSFORGE_URL || 'https://iy9yd7sa.us-east.insforge.app',
  anonKey: process.env.INSFORGE_ANON_KEY || 'ik_6c4aa158a6b88e3fe9c7b30cc2b348a2',
});

function formatLatexString(str) {
  if (!str) return str;
  let s = str;
  
  // Reemplazar (\to \theta) o similar por ($\to \theta$)
  s = s.replace(/\(([^)]*\\[a-zA-Z]+[^)]*)\)/g, (_m, p1) => `($${p1.trim()}$)`);
  
  // Reemplazar grados 30^{\circ} o 30\circ por $30^{\circ}$
  s = s.replace(/(?<!\$)\b(\d+)\s*\^{\s*\\circ\s*}(?!\$)/g, (_m, p1) => `$${p1}^{\\circ}$`);
  s = s.replace(/(?<!\$)\b(\d+)\s*\\circ(?!\$)/g, (_m, p1) => `$${p1}^{\\circ}$`);
  
  // Reemplazar símbolos LaTeX sueltos como \theta, \Sigma, \tan sin $
  s = s.replace(/(?<!\$)\\(theta|alpha|beta|gamma|delta|pi|sigma|Sigma|omega|mu|lambda|to|approx|cdot|frac|sqrt|tan|sin|cos)(?=[^a-zA-Z]|$)(?!\$)/g, (match) => `$${match}$`);

  // Limpiar $$$
  s = s.replace(/\$\$\$+/g, '$');
  return s;
}

async function main() {
  console.log('--- Formateando reactivos_fisica.json ---');
  const jsonPath = path.resolve(process.cwd(), 'scripts/reactivos_fisica.json');
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const cleaned = data.map(item => ({
    ...item,
    enunciado: formatLatexString(item.enunciado),
    opcion_a: formatLatexString(item.opcion_a),
    opcion_b: formatLatexString(item.opcion_b),
    opcion_c: formatLatexString(item.opcion_c),
    opcion_d: formatLatexString(item.opcion_d),
    explicacion_correcta: formatLatexString(item.explicacion_correcta),
    diagnostico_a: formatLatexString(item.diagnostico_a),
    diagnostico_b: formatLatexString(item.diagnostico_b),
    diagnostico_c: formatLatexString(item.diagnostico_c),
    diagnostico_d: formatLatexString(item.diagnostico_d),
  }));

  fs.writeFileSync(jsonPath, JSON.stringify(cleaned, null, 2));
  console.log('✅ reactivos_fisica.json actualizado.');

  console.log('\n--- Actualizando registros en InsForge Database ---');
  const { data: dbRecords, error: fetchErr } = await insforge.database.from('reactivos').select('*');
  if (fetchErr) {
    console.error('Error al consultar DB:', fetchErr);
    return;
  }

  for (const record of dbRecords) {
    const newEnunciado = formatLatexString(record.enunciado);
    const newOpcionA = formatLatexString(record.opcion_a);
    const newOpcionB = formatLatexString(record.opcion_b);
    const newOpcionC = formatLatexString(record.opcion_c);
    const newOpcionD = formatLatexString(record.opcion_d);
    const newExp = formatLatexString(record.explicacion_correcta);

    if (
      newEnunciado !== record.enunciado ||
      newOpcionA !== record.opcion_a ||
      newOpcionB !== record.opcion_b ||
      newOpcionC !== record.opcion_c ||
      newOpcionD !== record.opcion_d ||
      newExp !== record.explicacion_correcta
    ) {
      console.log(`   Updating reactivo ID: ${record.id}...`);
      await insforge.database.from('reactivos').update({
        enunciado: newEnunciado,
        opcion_a: newOpcionA,
        opcion_b: newOpcionB,
        opcion_c: newOpcionC,
        opcion_d: newOpcionD,
        explicacion_correcta: newExp
      }).eq('id', record.id);
    }
  }

  console.log('🎉 Todos los registros en la base de datos fueron corregidos exitosamente.');
}

main().catch(console.error);
