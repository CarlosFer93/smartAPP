import { createClient } from '@insforge/sdk';

const insforge = createClient({
  baseUrl: 'https://iy9yd7sa.us-east.insforge.app',
  anonKey: 'ik_6c4aa158a6b88e3fe9c7b30cc2b348a2',
});

async function main() {
  console.log('--- Probando conexión a InsForge ---');
  
  // 1. Probamos la tabla subjects
  const subjectsRes = await insforge.database.from('subjects').select('*');
  console.log('\n[subjects]:', JSON.stringify(subjectsRes.data || subjectsRes.error, null, 2));

  // 2. Probamos la tabla reactivos
  const reactivosRes = await insforge.database.from('reactivos').select('*').limit(3);
  console.log('\n[reactivos]:', JSON.stringify(reactivosRes.data || reactivosRes.error, null, 2));

  // 3. Probamos la tabla questions
  const questionsRes = await insforge.database.from('questions').select('*').limit(3);
  console.log('\n[questions]:', JSON.stringify(questionsRes.data || questionsRes.error, null, 2));

  // 4. Probamos la tabla lessons
  const lessonsRes = await insforge.database.from('lessons').select('*').limit(3);
  console.log('\n[lessons]:', JSON.stringify(lessonsRes.data || lessonsRes.error, null, 2));
}

main().catch(console.error);
