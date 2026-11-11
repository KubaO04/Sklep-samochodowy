import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
execFileSync(process.execPath,[path.join(root,'scripts/build-pages.mjs')],{stdio:'inherit'});
const source=path.join(root,'public');const dist=path.join(root,'dist');
fs.mkdirSync(path.join(dist,'server'),{recursive:true});
fs.cpSync(source,path.join(dist,'client'),{recursive:true});
const sample=JSON.parse(fs.readFileSync(path.join(root,'content/blog-example.json'),'utf8'));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const text={};for(const file of fs.readdirSync(source)){const ext=path.extname(file);if(types[ext])text['/'+file]={body:fs.readFileSync(path.join(source,file),'utf8'),type:types[ext]};}
let api=fs.readFileSync(path.join(root,'worker/blog-api.js'),'utf8').replace(/^export /gm,'');
let worker=fs.readFileSync(path.join(root,'worker/index.js'),'utf8').replace(/^import .*\n/,'').replace('__BLOG_SAMPLE__',JSON.stringify(sample)).replace('__STATIC_TEXT__',JSON.stringify(text));
fs.writeFileSync(path.join(dist,'server/index.js'),api+'\n'+worker);
fs.writeFileSync(path.join(dist,'server/wrangler.json'),JSON.stringify({name:'ig-motors',main:'index.js',compatibility_date:'2026-11-11',assets:{directory:'../client',binding:'ASSETS',run_worker_first:['/api/*']},d1_databases:[{binding:'DB',database_name:'site-creator-d1',database_id:'00000000-0000-4000-8000-000000000000'}]},null,2));
fs.mkdirSync(path.join(dist,'.openai'),{recursive:true});
fs.copyFileSync(path.join(root,'.openai/hosting.json'),path.join(dist,'.openai/hosting.json'));
console.log('Built Worker API, client assets and D1 migration.');
