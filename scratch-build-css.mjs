import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';
import fs from 'fs';

const css = fs.readFileSync('styles/styles.css', 'utf8');
const result = await postcss([tailwindcss({ base: process.cwd() })]).process(css, {
  from: 'styles/styles.css',
  to: 'scratch-out.css',
});
fs.writeFileSync('scratch-out.css', result.css);
console.log('done', result.css.length);
