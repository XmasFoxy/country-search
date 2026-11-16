import {
  copyFile,
  readFile,
  writeFile,
  readdir,
  unlink,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
const files = (await readdir('dist')).filter((file) =>
  /^[a-z]+\.js$/.test(file),
);
const modules = await Promise.all(
  files.map(async (file) => [file, await readFile(`dist/${file}`, 'utf8')]),
);
const revision = createHash('sha256')
  .update(modules.map(([, code]) => code).join(''))
  .digest('hex')
  .slice(0, 12);
for (const old of (await readdir('dist')).filter((file) =>
  /^[a-z]+-[a-f0-9]{12}\.js$/.test(file),
))
  await unlink(`dist/${old}`);
for (const [file, code] of modules) {
  const versioned = code.replace(/\.\/([a-z]+)\.js/g, `./$1-${revision}.js`);
  await writeFile(`dist/${file.replace('.js', `-${revision}.js`)}`, versioned);
}
const html = (await readFile('index.html', 'utf8')).replace(
  './main.js',
  `./main-${revision}.js`,
);
await writeFile('dist/index.html', html);
await copyFile('styles.css', 'dist/styles.css');
