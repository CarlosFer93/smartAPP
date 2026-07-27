export function autoFormatLatex(text) {
  if (!text) return '';

  const blocks = [];
  // 1. Proteger todos los bloques KaTeX existentes: $$ ... $$ o $ ... $
  const placeholderText = text.replace(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+\$)/g, (match) => {
    blocks.push(match);
    return `___MATH_BLOCK_${blocks.length - 1}___`;
  });

  let formatted = placeholderText;

  // 2. Solo sobre el texto FUERA de bloques $, formatear expresiones no delimitadas
  // Convertir ( \to \theta ) -> ($ \to \theta $)
  formatted = formatted.replace(/\(([^)]*\\[a-zA-Z]+[^)]*)\)/g, (_m, p1) => `($${p1.trim()}$)`);
  // Convertir 30^{\circ} -> $30^{\circ}$
  formatted = formatted.replace(/\b(\d+)\s*\^{\s*\\circ\s*}/g, (_m, p1) => `$${p1}^{\\circ}$`);
  formatted = formatted.replace(/\b(\d+)\s*\\circ/g, (_m, p1) => `$${p1}^{\\circ}$`);

  // 3. Restaurar los bloques $ ... $ intactos
  formatted = formatted.replace(/___MATH_BLOCK_(\d+)___/g, (_m, id) => blocks[parseInt(id)]);

  return formatted;
}

const testMixed = `Ángulo (\to \theta) a 30^{\circ} con aceleración ($g \approx 9,8\\text{ m/s}^2$) y rapidez ($v = \\sqrt{v_x^2 + v_y^2}$).`;
console.log('--- ENTRADA MIXTA ---');
console.log(testMixed);
console.log('\n--- SALIDA MIXTA ---');
console.log(autoFormatLatex(testMixed));
