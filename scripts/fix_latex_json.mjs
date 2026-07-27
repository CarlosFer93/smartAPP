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

function repairMathBlocks(text) {
  if (!text) return text;
  let s = text;

  // Reparar fragmentaciones por $ extra como $approx$, $\sqrt$, etc.
  s = s.replace(/\$\s*\\approx\s*\$/g, '\\approx');
  s = s.replace(/\$\s*\\sqrt\s*\$/g, '\\sqrt');
  s = s.replace(/\$\s*\\text\s*\$/g, '\\text');

  // Asegurar que expresiones completas tengan su bloque $ ... $ intacto
  s = s.replace(/\(v_x = v_0 = 2\\text\{ m\/s\}\)/g, '($v_x = v_0 = 2\\text{ m/s}$)');
  s = s.replace(/\(g \\approx 9,8\\text\{ m\/s\}\^2\)/g, '($g \\approx 9,8\\text{ m/s}^2$)');
  s = s.replace(/\(a_y = g \\neq 0\)/g, '($a_y = g \\neq 0$)');
  s = s.replace(/\(v = \\sqrt\{v_x\^2 \+ v_y\^2\}\)/g, '($v = \\sqrt{v_x^2 + v_y^2}$)');
  s = s.replace(/\(v_y = g \\cdot t\)/g, '($v_y = g \\cdot t$)');
  s = s.replace(/15\\text\{ m\/s\}/g, '$15\\text{ m/s}$');
  s = s.replace(/\(\\to \\theta\)/g, '($\\to \\theta$)');
  s = s.replace(/(?<!\$)\\theta(?!\$)/g, '$\\theta$');
  s = s.replace(/(?<!\$)\b(\d+)\s*\^{\s*\\circ\s*}(?!\$)/g, '$$1^{\\circ}$');

  return s;
}

async function main() {
  console.log('--- Reparando y normalizando reactivos en InsForge DB ---');
  const { data: records, error } = await insforge.database.from('reactivos').select('*');
  
  if (error || !records) {
    console.error('Error al consultar DB:', error);
    return;
  }

  let count = 0;
  for (const r of records) {
    const newEnunciado = repairMathBlocks(r.enunciado);
    const newOpcionA = repairMathBlocks(r.opcion_a);
    const newOpcionB = repairMathBlocks(r.opcion_b);
    const newOpcionC = repairMathBlocks(r.opcion_c);
    const newOpcionD = repairMathBlocks(r.opcion_d);
    const newExp = repairMathBlocks(r.explicacion_correcta);

    if (
      newEnunciado !== r.enunciado ||
      newOpcionA !== r.opcion_a ||
      newOpcionB !== r.opcion_b ||
      newOpcionC !== r.opcion_c ||
      newOpcionD !== r.opcion_d ||
      newExp !== r.explicacion_correcta
    ) {
      count++;
      console.log(`   Reparando reactivo ID: ${r.id}...`);
      await insforge.database.from('reactivos').update({
        enunciado: newEnunciado,
        opcion_a: newOpcionA,
        opcion_b: newOpcionB,
        opcion_c: newOpcionC,
        opcion_d: newOpcionD,
        explicacion_correcta: newExp
      }).eq('id', r.id);
    }
  }

  console.log(`🎉 Proceso completado. ${count} registros actualizados en InsForge.`);
}

main().catch(console.error);
