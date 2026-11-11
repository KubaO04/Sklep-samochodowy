import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';
import { createLocalDatabase } from './lib/local-db.mjs';
import { handleBlog } from './worker/blog-api.js';

const root = fileURLToPath(new URL('./public/', import.meta.url));
const local=path.resolve(root,'../.local');fs.mkdirSync(local,{recursive:true});
const database=createLocalDatabase(path.join(local,'blog.sqlite'));
const sample=JSON.parse(fs.readFileSync(path.resolve(root,'../content/blog-example.json'),'utf8'));
const env={DB:database.binding,BLOG_ADMIN_EMAIL:process.env.BLOG_ADMIN_EMAIL||'owner@localhost.test',BLOG_TOKEN_SECRET:process.env.BLOG_TOKEN_SECRET||randomBytes(32).toString('hex')};
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
createServer(async (req, res) => {
  try {
    const url=new URL(req.url,'http://'+req.headers.host);
    if(!['localhost','127.0.0.1','[::1]'].includes(url.hostname)){res.writeHead(403);res.end('Podgląd lokalny');return;}
    if(url.pathname==='/signin-with-chatgpt'||url.pathname==='/signout-with-chatgpt'){
      const returnTo=url.searchParams.get('return_to');const safe=returnTo?.startsWith('/')&&!returnTo.startsWith('//')?returnTo:'/blog.html';
      res.writeHead(302,{'Location':safe,'Set-Cookie':url.pathname.startsWith('/signin')?'ig_blog_local_auth=1; Path=/; HttpOnly; SameSite=Lax':'ig_blog_local_auth=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0','Cache-Control':'no-store'});res.end();return;
    }
    if(url.pathname.startsWith('/api/blog/')){
      const headers=new Headers();for(const[name,value]of Object.entries(req.headers))if(value&&!name.startsWith('oai-authenticated-user-'))headers.set(name,Array.isArray(value)?value.join(','):value);
      headers.set('cf-connecting-ip',req.socket.remoteAddress||'127.0.0.1');
      if((req.headers.cookie||'').split(';').some(cookie=>cookie.trim()==='ig_blog_local_auth=1')){headers.set('oai-authenticated-user-id','local-owner');headers.set('oai-authenticated-user-email',env.BLOG_ADMIN_EMAIL.split(',')[0]);}
      const options={method:req.method,headers};if(!['GET','HEAD'].includes(req.method)){options.body=Readable.toWeb(req);options.duplex='half';}
      const response=await handleBlog(new Request(url,options),env,sample);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
    }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !(await stat(target)).isFile()) {
      res.writeHead(404); res.end('Nie znaleziono'); return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(await readFile(target));
  } catch { res.writeHead(404); res.end('Nie znaleziono'); }
}).listen(4173, '127.0.0.1', () => console.log('IG Motors: http://localhost:4173'));
