import { build } from 'esbuild';
const out='node_modules/.cache/simreport.mjs';
await build({entryPoints:['tools/simreport.ts'],bundle:true,format:'esm',platform:'node',outfile:out,logLevel:'error'});
await import('../'+out+'?'+Date.now());
