// Her şeyi tek dosyalık oyuna paketler: dist/index.html, --artifact ile dist/artifact.html
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const res = await build({ entryPoints:[resolve(root,'src/main.ts')], bundle:true, format:'iife', target:'es2020', minify:true, write:false, legalComments:'none' });
const js = res.outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
const css = readFileSync(resolve(root,'src/ui/styles.css'),'utf8');
const body = `<title>Soy ve Beton</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.gstatic.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap">
<style>${css}</style>
<canvas id="city" aria-hidden="true"></canvas>
<div id="app"></div>
<script>${js}</script>`;
const ai = process.argv.indexOf('--artifact');
mkdirSync(resolve(root,'dist'),{recursive:true});
if (ai>=0) { writeFileSync(resolve(root,process.argv[ai+1]), body); console.log('artifact', body.length); }
else { writeFileSync(resolve(root,'dist/index.html'), `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${body}</body></html>`.replace('<canvas','</head><body><canvas')); console.log('index', body.length); }
