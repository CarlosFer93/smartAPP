import fs from 'fs';
import path from 'path';
import { createClient } from '@insforge/sdk';

// Cargar variables de entorno desde .env.local si existe
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

const INSFORGE_URL = process.env.INSFORGE_URL || process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://iy9yd7sa.us-east.insforge.app';
const INSFORGE_ANON_KEY = process.env.INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_6c4aa158a6b88e3fe9c7b30cc2b348a2';

const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_ANON_KEY,
});

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Script de importación de reactivos e imágenes a InsForge
 */
async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help')) {
    console.log(`
Uso del script de importación de reactivos:
  node scripts/import_reactivos.mjs <archivo_json_o_directorio> [opciones]

Opciones:
  --subject <slug_o_id>       Subject ID o slug por defecto si el JSON no lo especifica
  --images-dir <carpeta>      Carpeta con las imágenes (ej: ./imagenes). Si existe, el script subirá
                              las imágenes a InsForge Storage (bucket 'reactivos') y reemplazará
                              etiquetas como [IMAGEN_1] por su sintaxis Markdown de imagen.
    `);
    process.exit(0);
  }

  const targetPath = args[0];
  let defaultSubjectArg = null;
  let imagesDir = null;

  const subjectIndex = args.indexOf('--subject');
  if (subjectIndex !== -1 && args[subjectIndex + 1]) {
    defaultSubjectArg = args[subjectIndex + 1];
  }

  const imagesIndex = args.indexOf('--images-dir');
  if (imagesIndex !== -1 && args[imagesIndex + 1]) {
    imagesDir = path.resolve(process.cwd(), args[imagesIndex + 1]);
  }

  // 1. Cargar la tabla de materias de InsForge para resolver slugs a UUIDs
  console.log('📦 Conectando a InsForge y consultando materias en la base de datos...');
  const { data: subjects, error: subErr } = await insforge.database.from('subjects').select('*');

  if (subErr || !subjects) {
    console.error('❌ Error al consultar la tabla "subjects":', subErr?.message || subErr);
    process.exit(1);
  }

  const subjectMapBySlug = new Map();
  const subjectMapById = new Map();

  subjects.forEach(sub => {
    subjectMapBySlug.set(sub.slug.toLowerCase(), sub.id);
    subjectMapById.set(sub.id, sub.id);
  });

  function resolveSubjectId(rawSubject) {
    if (!rawSubject) return null;
    const str = String(rawSubject).trim().toLowerCase();
    
    if (UUID_REGEX.test(rawSubject) && subjectMapById.has(rawSubject)) {
      return rawSubject;
    }
    
    if (subjectMapBySlug.has(str)) {
      return subjectMapBySlug.get(str);
    }

    if (str.includes('física') || str.includes('fisica')) return subjectMapBySlug.get('fisica');
    if (str.includes('química') || str.includes('quimica')) return subjectMapBySlug.get('quimica');
    if (str.includes('biología') || str.includes('biologia')) return subjectMapBySlug.get('biologia');
    if (str.includes('matemática') || str.includes('matematicas')) return subjectMapBySlug.get('matematicas');
    if (str.includes('lectura') || str.includes('crítica') || str.includes('critica')) return subjectMapBySlug.get('lectura-critica');
    if (str.includes('sociales') || str.includes('ciudadanas')) return subjectMapBySlug.get('sociales');
    if (str.includes('inglés') || str.includes('ingles')) return subjectMapBySlug.get('ingles');

    return null;
  }

  console.log('✅ Materias registradas en InsForge:');
  subjects.forEach(s => console.log(`   • [${s.slug}] ${s.name}`));

  // Asegurar que el bucket "reactivos" existe en InsForge Storage
  try {
    await fetch(`${INSFORGE_URL}/api/storage/buckets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${INSFORGE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bucketName: 'reactivos', public: true })
    });
  } catch (e) {
    // Ignorar si ya existe
  }

  // Caché de imágenes subidas para reutilizar URLs (evita subir duplicados)
  const uploadedImageCache = new Map();

  async function uploadImageToStorage(imageFilename) {
    if (uploadedImageCache.has(imageFilename)) {
      return uploadedImageCache.get(imageFilename);
    }

    if (!imagesDir || !fs.existsSync(imagesDir)) return null;
    
    const localImagePath = path.join(imagesDir, imageFilename);
    if (!fs.existsSync(localImagePath)) {
      console.warn(`   ⚠️ No se encontró el archivo local: ${imageFilename}`);
      return null;
    }

    try {
      console.log(`   📤 Subiendo imagen a InsForge Storage: ${imageFilename}...`);
      const fileBuffer = fs.readFileSync(localImagePath);
      const ext = path.extname(imageFilename).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      if (ext === '.webp') mimeType = 'image/webp';
      if (ext === '.svg') mimeType = 'image/svg+xml';

      const blob = new Blob([fileBuffer], { type: mimeType });
      const { data, error } = await insforge.storage.from('reactivos').uploadAuto(blob, { filename: imageFilename });

      if (error || !data?.url) {
        console.warn(`   ⚠️ Error al subir ${imageFilename}:`, error?.message || error);
        return null;
      }

      console.log(`   ✅ Imagen subida con éxito: ${data.url}`);
      uploadedImageCache.set(imageFilename, data.url);
      return data.url;
    } catch (err) {
      console.warn(`   ⚠️ Excepción al subir ${imageFilename}:`, err.message);
      return null;
    }
  }

  // 2. Obtener lista de archivos JSON a procesar
  const absolutePath = path.resolve(process.cwd(), targetPath);
  let filesToProcess = [];

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ La ruta especificada no existe: ${absolutePath}`);
    process.exit(1);
  }

  const stats = fs.statSync(absolutePath);
  if (stats.isDirectory()) {
    const files = fs.readdirSync(absolutePath);
    filesToProcess = files
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(absolutePath, f));
  } else if (stats.isFile()) {
    filesToProcess = [absolutePath];
  }

  if (filesToProcess.length === 0) {
    console.error('❌ No se encontraron archivos .json para procesar.');
    process.exit(1);
  }

  console.log(`\n📂 Se encontraron ${filesToProcess.length} archivo(s) JSON para procesar.`);

  let totalInsertados = 0;
  let totalErrores = 0;

  for (const filePath of filesToProcess) {
    console.log(`\n📄 Procesando archivo: ${path.basename(filePath)}...`);
    let rawContent;
    try {
      rawContent = fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      console.error(`❌ Error al leer el archivo ${filePath}:`, e.message);
      continue;
    }

    let items;
    try {
      items = JSON.parse(rawContent);
    } catch (e) {
      console.error(`❌ Error al parsear JSON en ${filePath}:`, e.message);
      continue;
    }

    if (!Array.isArray(items)) {
      items = [items];
    }

    const recordsToInsert = [];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      // Determinar subject_id
      const rawSubject = item.subject_id || item.subject_slug || item.subject || defaultSubjectArg;
      const subjectId = resolveSubjectId(rawSubject);

      if (!subjectId) {
        console.error(`⚠️ Reactivo #${index + 1}: Falta subject_id o subject_slug válido (valor recibido: "${rawSubject}").`);
        totalErrores++;
        continue;
      }

      // Normalizar opciones A, B, C, D
      let opcionA = item.opcion_a || item.opcionA || '';
      let opcionB = item.opcion_b || item.opcionB || '';
      let opcionC = item.opcion_c || item.opcionC || '';
      let opcionD = item.opcion_d || item.opcionD || '';

      if (Array.isArray(item.opciones)) {
        item.opciones.forEach(op => {
          const letra = (op.letra || op.key || '').toUpperCase();
          const texto = op.texto || op.text || op.content || '';
          if (letra === 'A') opcionA = texto;
          if (letra === 'B') opcionB = texto;
          if (letra === 'C') opcionC = texto;
          if (letra === 'D') opcionD = texto;
        });
      }

      // Normalizar diagnósticos A, B, C, D
      let diagA = item.diagnostico_a || item.diagnosticoA || null;
      let diagB = item.diagnostico_b || item.diagnosticoB || null;
      let diagC = item.diagnostico_c || item.diagnosticoC || null;
      let diagD = item.diagnostico_d || item.diagnosticoD || null;

      if (Array.isArray(item.distractores)) {
        item.distractores.forEach(dis => {
          const letra = (dis.letra || dis.key || '').toUpperCase();
          const diag = dis.diagnostico || dis.feedback || dis.explicacion || '';
          if (letra === 'A') diagA = diag;
          if (letra === 'B') diagB = diag;
          if (letra === 'C') diagC = diag;
          if (letra === 'D') diagD = diag;
        });
      }

      const respuestaCorrecta = String(item.respuesta_correcta || item.respuestaCorrecta || item.correcta || '').trim().toUpperCase();
      let enunciado = item.enunciado || item.pregunta || item.question || '';
      const explicacionCorrecta = item.explicacion_correcta || item.explicacionCorrecta || item.explicacion || '';

      // Procesar imágenes dentro del enunciado
      const altText = item.descripcion_imagen || 'Imagen del reactivo';

      if (item.imagen_url) {
        const markdownImage = `\n\n![${altText}](${item.imagen_url})\n\n`;
        enunciado = enunciado.replace(/\[IMAGEN_\d+\]/g, markdownImage);
        if (!enunciado.includes(item.imagen_url)) {
          enunciado += markdownImage;
        }
      } else if (imagesDir) {
        const matches = enunciado.match(/\[IMAGEN_(\d+)\]/g);
        if (matches) {
          for (const matchTag of matches) {
            const num = matchTag.replace(/\D/g, '');
            const possibleNames = [`imagen_${num}.png`, `imagen_${num}.jpg`, `imagen_${num}.webp`, `IMAGEN_${num}.png`];
            
            let uploadedUrl = null;
            for (const name of possibleNames) {
              uploadedUrl = await uploadImageToStorage(name);
              if (uploadedUrl) break;
            }

            if (uploadedUrl) {
              enunciado = enunciado.replace(matchTag, `\n\n![${altText}](${uploadedUrl})\n\n`);
            }
          }
        }
      }

      let lessonId = null;
      let topico = item.topico || item.topic || 'General';

      if (item.lesson_id || item.lessonId) {
        const rawLesson = item.lesson_id || item.lessonId;
        if (UUID_REGEX.test(rawLesson)) {
          lessonId = rawLesson;
        } else {
          topico = rawLesson;
        }
      }

      const nivel = item.nivel || item.level || 'medio';

      // Validación de campos obligatorios
      if (!enunciado || !opcionA || !opcionB || !opcionC || !opcionD || !respuestaCorrecta || !explicacionCorrecta) {
        console.error(`⚠️ Reactivo #${index + 1}: Campos obligatorios faltantes.`);
        totalErrores++;
        continue;
      }

      recordsToInsert.push({
        subject_id: subjectId,
        lesson_id: lessonId,
        enunciado,
        opcion_a: opcionA,
        opcion_b: opcionB,
        opcion_c: opcionC,
        opcion_d: opcionD,
        respuesta_correcta: respuestaCorrecta,
        explicacion_correcta: explicacionCorrecta,
        diagnostico_a: diagA,
        diagnostico_b: diagB,
        diagnostico_c: diagC,
        diagnostico_d: diagD,
        topico,
        nivel
      });
    }

    if (recordsToInsert.length > 0) {
      console.log(`\n🚀 Insertando ${recordsToInsert.length} reactivos actualizados con sus imágenes en InsForge...`);
      
      const BATCH_SIZE = 50;
      for (let i = 0; i < recordsToInsert.length; i += BATCH_SIZE) {
        const batch = recordsToInsert.slice(i, i + BATCH_SIZE);
        const { data: inserted, error: insErr } = await insforge.database.from('reactivos').insert(batch);

        if (insErr) {
          console.error(`❌ Error al insertar lote (${i} - ${i + batch.length}):`, insErr.message || insErr);
          totalErrores += batch.length;
        } else {
          totalInsertados += batch.length;
          console.log(`   ✅ Lote insertado exitosamente (${i + batch.length}/${recordsToInsert.length})`);
        }
      }
    }
  }

  console.log('\n========================================');
  console.log(`🎉 Proceso completado:`);
  console.log(`   • Reactivos insertados con imágenes: ${totalInsertados}`);
  console.log(`   • Errores / Reactivos omitidos: ${totalErrores}`);
  console.log('========================================\n');
}

run().catch(err => {
  console.error('❌ Error no controlado durante la ejecución:', err);
  process.exit(1);
});
