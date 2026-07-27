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

function cleanLatexField(text) {
  if (!text) return text;
  let s = text;

  // Corregir residuos de de-sustitución previa $1
  s = s.replace(/\$1\$/g, 'v_y');
  s = s.replace(/\$1/g, 'v_y');

  // Limpiar signos de dólares fragmentados dentro de fórmulas
  s = s.replace(/\$(\s*\\approx\s*)\$/g, '$1');
  s = s.replace(/\$(\s*\\sqrt\s*)\$/g, '$1');
  s = s.replace(/\$(\s*\\cdot\s*)\$/g, '$1');
  s = s.replace(/\$(\s*\\text\{[^}]+\}\s*)\$/g, '$1');

  // Corregir expresiones completas en Ejercicio #3
  s = s.replace(/velocidad horizontal permanece constante \([^)]+\)/g, 'velocidad horizontal permanece constante ($v_x = v_0 = 2\\text{ m/s}$)');
  s = s.replace(/aceleración de la gravedad \([^)]+\)/g, 'aceleración de la gravedad ($g \\approx 9,8\\text{ m/s}^2$)');
  s = s.replace(/diferente de cero \([^)]+\)/g, 'diferente de cero ($a_y = g \\neq 0$)');
  s = s.replace(/componente vertical de la velocidad \([^)]+\)/g, 'componente vertical de la velocidad ($v_y$)');
  s = s.replace(/según v_y = g \\cdot t/g, 'según $v_y = g \\cdot t$');
  s = s.replace(/módulo del vector velocidad \([^)]+\)/g, 'módulo del vector velocidad ($v = \\sqrt{v_x^2 + v_y^2}$)');
  s = s.replace(/al crecer [^,]+,/g, 'al crecer $v_y$,');
  s = s.replace(/alcanzar 15\\text\{ m\/s\} en/g, 'alcanzar $15\\text{ m/s}$ en');

  // Corregir en general variables sueltas
  s = s.replace(/(?<!\$)\b(v_x|v_y|v_0|a_y)\b(?!\$)/g, (_m, p1) => `$${p1}$`);
  s = s.replace(/(?<!\$)\b(\d+)\\text\{ m\/s\}(?!\$)/g, (_m, p1) => `$${p1}\\text{ m/s}$`);

  // Limpiar $$$ dobles
  s = s.replace(/\$\$+/g, '$');

  return s;
}

async function main() {
  console.log('--- 🧹 Limpiando scripts/reactivos_fisica.json ---');
  const jsonPath = path.resolve(process.cwd(), 'scripts/reactivos_fisica.json');
  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const cleanedData = data.map(item => {
    const newItem = { ...item };
    for (const key of Object.keys(newItem)) {
      if (typeof newItem[key] === 'string') {
        newItem[key] = cleanLatexField(newItem[key]);
      }
      if (Array.isArray(newItem[key])) {
        newItem[key] = newItem[key].map(obj => {
          if (typeof obj === 'object' && obj !== null) {
            const newObj = { ...obj };
            for (const k of Object.keys(newObj)) {
              if (typeof newObj[k] === 'string') {
                newObj[k] = cleanLatexField(newObj[k]);
              }
            }
            return newObj;
          }
          return obj;
        });
      }
    }
    return newItem;
  });

  fs.writeFileSync(jsonPath, JSON.stringify(cleanedData, null, 2));
  console.log('✅ scripts/reactivos_fisica.json limpiado.');

  console.log('\n--- 🚀 Actualizando registros en InsForge Database ---');
  const { data: dbRecords, error } = await insforge.database.from('reactivos').select('*');
  if (error || !dbRecords) {
    console.error('Error leyendo base de datos InsForge:', error);
    return;
  }

  let updatedCount = 0;
  for (const record of dbRecords) {
    const newEnunciado = cleanLatexField(record.enunciado);
    const newOpcionA = cleanLatexField(record.opcion_a);
    const newOpcionB = cleanLatexField(record.opcion_b);
    const newOpcionC = cleanLatexField(record.opcion_c);
    const newOpcionD = cleanLatexField(record.opcion_d);
    const newExp = cleanLatexField(record.explicacion_correcta);

    if (
      newEnunciado !== record.enunciado ||
      newOpcionA !== record.opcion_a ||
      newOpcionB !== record.opcion_b ||
      newOpcionC !== record.opcion_c ||
      newOpcionD !== record.opcion_d ||
      newExp !== record.explicacion_correcta
    ) {
      updatedCount++;
      console.log(`   [${updatedCount}] Actualizando reactivo ID: ${record.id}`);
      await insforge.database.from('reactivos').update({
        enunciado: newEnunciado,
        opcion_a: newOpcionA,
        opcion_b: newOpcionB,
        opcion_c: newOpcionC,
        opcion_d: newOpcionD,
        explicacion_correcta: newExp,
      }).eq('id', record.id);
    }
  }

  console.log(`\n🎉 ¡Éxito! ${updatedCount} reactivos corregidos en InsForge.`);
}

main().catch(console.error);
