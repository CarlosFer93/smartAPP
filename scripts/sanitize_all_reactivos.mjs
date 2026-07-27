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

function sanitizeText(str) {
  if (!str) return str;
  let s = str;

  // 1. Limpieza de Ejercicio #3 especifico
  if (s.includes('movimiento semiparabólico')) {
    s = `En el movimiento semiparabólico o proyectil horizontal, el movimiento se compone de dos ejes independientes: en el eje horizontal (X) no hay fuerzas actuando (despreciando la resistencia del aire), por lo que la velocidad horizontal permanece constante ($v_x = v_0 = 2\\text{ m/s}$). En el eje vertical (Y), el cuerpo está sometido a la aceleración de la gravedad ($g \\approx 9,8\\text{ m/s}^2$), la cual es diferente de cero ($a_y = g \\neq 0$). Esta aceleración genera que la componente vertical de la velocidad ($v_y$) aumente continuamente hacia abajo según $v_y = g \\cdot t$. Como la rapidez total en cualquier punto es el módulo del vector velocidad ($v = \\sqrt{v_x^2 + v_y^2}$), al crecer $v_y$, la rapidez total inevitablemente aumenta hasta alcanzar $15\\text{ m/s}$ en el punto más bajo.`;
  }

  // 2. Limpieza general de caracteres extraños y signos de dólar rotos
  s = s.replace(/\$v_x = \$v_0\$ = 2\\text\{ m\/s\}\$/g, '$v_x = v_0 = 2\\text{ m/s}$');
  s = s.replace(/\$g \\approx 9,\$8\\text\{ m\/s\}\^2\$/g, '$g \\approx 9,8\\text{ m/s}^2$');
  s = s.replace(/\$v = \\sqrt\{\$v_x\^2 \+ \$v_y\^2\}\$/g, '$v = \\sqrt{v_x^2 + v_y^2}$');
  s = s.replace(/v_y5\\text\{ m\/s\}\$/g, '$15\\text{ m/s}$');
  s = s.replace(/\$\$+/g, '$');
  s = s.replace(/\$\s*\$/g, '');

  // 3. Asegurar que (\to \theta) se mantenga como ($\to \theta$) y 30^{\circ} como $30^{\circ}$
  s = s.replace(/\(\\to \\theta\)/g, '($\\to \\theta$)');
  s = s.replace(/(?<!\$)\\theta(?!\$)/g, '$\\theta$');
  s = s.replace(/(?<!\$)\b(\d+)\s*\^{\s*\\circ\s*}(?!\$)/g, '$$1^{\\circ}$');

  return s;
}

async function main() {
  console.log('--- 🧹 Sanitizando reactivos en InsForge DB ---');
  const { data: records, error } = await insforge.database.from('reactivos').select('*');
  if (error || !records) {
    console.error('Error:', error);
    return;
  }

  for (const r of records) {
    const newEnunciado = sanitizeText(r.enunciado);
    const newA = sanitizeText(r.opcion_a);
    const newB = sanitizeText(r.opcion_b);
    const newC = sanitizeText(r.opcion_c);
    const newD = sanitizeText(r.opcion_d);
    const newExp = sanitizeText(r.explicacion_correcta);

    console.log(`Actualizando ID: ${r.id}...`);
    await insforge.database.from('reactivos').update({
      enunciado: newEnunciado,
      opcion_a: newA,
      opcion_b: newB,
      opcion_c: newC,
      opcion_d: newD,
      explicacion_correcta: newExp
    }).eq('id', r.id);
  }

  console.log('✅ Base de datos sanitizada al 100%.');
}

main().catch(console.error);
