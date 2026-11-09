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
// --mobile: iOS uygulaması için app/index.html (yazı tipleri dosyanın içine gömülü, internet gerekmez)
if (process.argv.includes('--mobile')) {
  const fcss = [['barlow',[400,500,600]],['barlow-condensed',[500,600,700,800]]].flatMap(([f,ws])=>ws.map(wt=>{
    const dir=resolve(root,'node_modules/@fontsource',f);
    return readFileSync(resolve(dir,wt+'.css'),'utf8').replace(/\/\*[^*]*\*\//g,'').replace(/url\(\.\/files\/([^)]+)\) format\('woff2'\),\s*url\([^)]+\) format\('woff'\)/g,(m,fn)=>`url(data:font/woff2;base64,${readFileSync(resolve(dir,'files',fn)).toString('base64')}) format('woff2')`);
  })).join('\n').replace(/\n?@font-face \{[^}]*?-(?:cyrillic|greek|vietnamese)[^}]*\}/g,'');
  const mob = body.replace(/<link rel="preconnect"[^>]*>\n<link rel="stylesheet"[^>]*>/, `<style>${fcss}</style>`).replace('<meta name="claude:viewport-fit-sides" content="cover">\n','');
  mkdirSync(resolve(root,'app'),{recursive:true});
  writeFileSync(resolve(root,'app/index.html'), `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover"><meta name="format-detection" content="telephone=no">${mob}</body></html>`.replace('<canvas','</head><body><canvas'));
  console.log('mobile', mob.length); process.exit(0);
}
mkdirSync(resolve(root,'dist'),{recursive:true});
if (ai>=0) { writeFileSync(resolve(root,process.argv[ai+1]), body); console.log('artifact', body.length); }
else { writeFileSync(resolve(root,'dist/index.html'), `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">${body}</body></html>`.replace('<canvas','</head><body><canvas')); console.log('index', body.length); }
