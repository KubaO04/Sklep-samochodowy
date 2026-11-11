export const COVERS = { golf:'assets/volkswagen-golf-sportsvan.jpg', jaguar:'assets/jaguar-e-pace.jpg', peugeot:'assets/peugeot-308-gt.jpg' };
export const CATEGORIES = ['Poradnik','Moja historia','Motoryzacja'];
const encoder = new TextEncoder();
const json = (value,status=200) => new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const issue = (message,status=400) => Object.assign(new Error(message),{status});
const hex = bytes => [...new Uint8Array(bytes)].map(n=>n.toString(16).padStart(2,'0')).join('');
const fromHex = value => Uint8Array.from(value.match(/../g)||[],n=>parseInt(n,16));
async function key(secret){return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
async function signature(secret,text){return hex(await crypto.subtle.sign('HMAC',await key(secret),encoder.encode(text)));}
async function token(secret){const nonce=crypto.randomUUID();const time=Date.now();return `${nonce}.${time}.${await signature(secret,`submit:${nonce}:${time}`)}`;}
async function verifyToken(value,secret){
 if(typeof value!=='string'||value.length>180)throw issue('Odśwież formularz i spróbuj ponownie.',403);
 const [nonce,time,sig]=value.split('.');
 if(!/^[0-9a-f-]{36}$/.test(nonce||'')||!/^\d{13}$/.test(time||'')||!/^[0-9a-f]{64}$/.test(sig||'')||Date.now()-Number(time)>3600000||Number(time)>Date.now()+60000)throw issue('Sesja formularza wygasła. Odśwież stronę.',403);
 if(!await crypto.subtle.verify('HMAC',await key(secret),fromHex(sig),encoder.encode(`submit:${nonce}:${time}`)))throw issue('Nieprawidłowa sesja formularza.',403);
 return nonce;
}
function isAdmin(request,env){
 const id=request.headers.get('oai-authenticated-user-id');
 const email=request.headers.get('oai-authenticated-user-email')?.toLowerCase();
 const allowed=(env.BLOG_ADMIN_EMAIL||'').split(',').map(e=>e.trim().toLowerCase()).filter(Boolean);
 return !!id&&!!email&&allowed.includes(email);
}
function requireAdmin(request,env){if(!request.headers.get('oai-authenticated-user-id'))throw issue('Zaloguj się, aby otworzyć panel redakcji.',401);if(!isAdmin(request,env))throw issue('Ten panel jest dostępny dla właściciela strony.',403);}
function requireOrigin(request){
 if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw issue('Wyślij formularz bezpośrednio z tej strony.',403);
 if(!request.headers.get('content-type')?.toLowerCase().startsWith('application/json'))throw issue('Nieprawidłowy format zgłoszenia.',415);
}
async function readBody(request){
 const reader=request.body?.getReader();if(!reader)throw issue('Brak treści zgłoszenia.');
 let size=0;const chunks=[];
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();throw issue('Wpis jest zbyt długi.',413);}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
 try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw issue('Nieprawidłowa treść zgłoszenia.');}
}
export function validatePost(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw issue('Uzupełnij formularz wpisu.',422);
 const result={};
 for(const[name,min,max,label]of [['title',12,140,'Tytuł'],['excerpt',30,260,'Wprowadzenie'],['content',200,12000,'Treść'],['author',2,60,'Imię lub pseudonim']]){
  if(typeof input[name]!=='string')throw issue(`${label}: uzupełnij pole.`,422);
  result[name]=input[name].trim().replace(/\r\n?/g,'\n');
  if(result[name].length<min||result[name].length>max)throw issue(`${label}: wpisz od ${min} do ${max} znaków.`,422);
 }
 if(!CATEGORIES.includes(input.category))throw issue('Wybierz kategorię wpisu.',422);
 if(!Object.hasOwn(COVERS,input.cover))throw issue('Wybierz zdjęcie okładki.',422);
 result.category=input.category;result.cover=input.cover;
 return result;
}
function serialize(row,full=false){
 const content=row.content||'';
 const post={id:row.id,slug:row.slug,title:row.title,excerpt:row.excerpt,author:row.author,category:row.category,cover:row.cover,status:row.status,createdAt:row.created_at,publishedAt:row.published_at,readingMinutes:Math.max(1,Math.ceil(content.trim().split(/\s+/).length/180))};
 if(full)post.content=content;
 return post;
}
function publicSample(sample,full=false){const post={...sample,readingMinutes:Math.max(1,Math.ceil(sample.content.split(/\s+/).length/180))};if(!full)delete post.content;return post;}
function requireDatabase(env){if(!env.DB)throw issue('Zapisywanie wpisów jest chwilowo niedostępne. Spróbuj ponownie później.',503);}
function requireSecret(env){if(!env.BLOG_TOKEN_SECRET||env.BLOG_TOKEN_SECRET.length<32)throw issue('Formularz jest chwilowo niedostępny. Spróbuj ponownie później.',503);}

export async function handleBlog(request,env,sample){
 const url=new URL(request.url);const path=url.pathname.replace(/\/$/,'');
 try{
  if(path==='/api/blog/context'&&request.method==='GET'){
   requireDatabase(env);requireSecret(env);
   return json({canSubmit:true,canModerate:isAdmin(request,env),signedIn:!!request.headers.get('oai-authenticated-user-id'),submissionToken:await token(env.BLOG_TOKEN_SECRET)});
  }
  if(path==='/api/blog/posts'&&request.method==='GET'){
   requireDatabase(env);
   const {results}=await env.DB.prepare("SELECT * FROM blog_posts WHERE status='published' ORDER BY published_at DESC LIMIT 100").all();
   const q=(url.searchParams.get('q')||'').slice(0,100).toLocaleLowerCase('pl');const category=url.searchParams.get('category')||'';
   const posts=[publicSample(sample),...results.map(row=>serialize(row))].filter(post=>(!category||post.category===category)&&(!q||`${post.title} ${post.excerpt} ${post.author}`.toLocaleLowerCase('pl').includes(q))).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt));
   return json({posts});
  }
  if(path.startsWith('/api/blog/posts/')&&request.method==='GET'){
   const id=decodeURIComponent(path.slice('/api/blog/posts/'.length));
   if(id===sample.id||id===sample.slug)return json({post:publicSample(sample,true)});
   requireDatabase(env);const row=await env.DB.prepare("SELECT * FROM blog_posts WHERE (id=? OR slug=?) AND status='published'").bind(id,id).first();
   if(!row)throw issue('Nie znaleziono opublikowanego wpisu.',404);
   return json({post:serialize(row,true)});
  }
  if(path==='/api/blog/submissions'&&request.method==='POST'){
   requireOrigin(request);requireDatabase(env);requireSecret(env);
   const input=await readBody(request);if(input.website)throw issue('Nie udało się przyjąć zgłoszenia.',403);
   if(input.consent!==true)throw issue('Potwierdź autorstwo i zgodę na publikację wpisu.',422);
   const post=validatePost(input);const id=await verifyToken(input.submissionToken,env.BLOG_TOKEN_SECRET);
   const submissionKey=await signature(env.BLOG_TOKEN_SECRET,`receipt:${id}`);
   const existing=await env.DB.prepare('SELECT id FROM blog_posts WHERE submission_key=?').bind(submissionKey).first();
   if(existing)return json({id:existing.id,status:'pending',message:'Zgłoszenie zostało już zapisane. Dziękujemy!'},201);
   const now=new Date().toISOString();const day=now.slice(0,10);
   const client=request.headers.get('cf-connecting-ip')||request.headers.get('oai-authenticated-user-id')||'shared-visitor';
   const rateKey=await signature(env.BLOG_TOKEN_SECRET,`rate:${day}:${client}`);
   const rate=await env.DB.prepare('INSERT INTO blog_rate_limits(rate_key,requests,day) VALUES (?,1,?) ON CONFLICT(rate_key) DO UPDATE SET requests=requests+1 WHERE requests<5 RETURNING requests').bind(rateKey,day).first();
   if(!rate)throw issue('Dzienny limit zgłoszeń został wykorzystany. Spróbuj ponownie jutro.',429);
   const slug=post.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)+'-'+id.slice(0,8);
   await env.DB.prepare("INSERT INTO blog_posts(id,slug,title,excerpt,content,author,category,cover,status,created_at,submission_key) VALUES (?,?,?,?,?,?,?,?,'pending',?,?)").bind(id,slug,post.title,post.excerpt,post.content,post.author,post.category,post.cover,now,submissionKey).run();
   await env.DB.prepare('DELETE FROM blog_rate_limits WHERE day<?').bind(new Date(Date.now()-172800000).toISOString().slice(0,10)).run();
   return json({id,status:'pending',message:'Wpis został zapisany i trafił do redakcji. Pojawi się na blogu po zatwierdzeniu.'},201);
  }
  if(path==='/api/blog/admin/posts'&&request.method==='GET'){
   requireAdmin(request,env);requireDatabase(env);
   const requested=url.searchParams.get('status')||'pending';const status=['pending','published','rejected'].includes(requested)?requested:'pending';
   const {results}=await env.DB.prepare('SELECT * FROM blog_posts WHERE status=? ORDER BY created_at DESC LIMIT 100').bind(status).all();
   const {results:counts}=await env.DB.prepare('SELECT status,COUNT(*) AS total FROM blog_posts GROUP BY status').all();
   return json({posts:results.map(row=>serialize(row,true)),counts:Object.fromEntries(counts.map(row=>[row.status,row.total]))});
  }
  if(path.startsWith('/api/blog/admin/posts/')&&request.method==='PATCH'){
   requireAdmin(request,env);requireOrigin(request);requireDatabase(env);requireSecret(env);
   const input=await readBody(request);await verifyToken(input.submissionToken,env.BLOG_TOKEN_SECRET);
   if(!['pending','published','rejected'].includes(input.status))throw issue('Nieprawidłowy status wpisu.',422);
   const id=decodeURIComponent(path.slice('/api/blog/admin/posts/'.length));
   const existing=await env.DB.prepare('SELECT id FROM blog_posts WHERE id=?').bind(id).first();if(!existing)throw issue('Nie znaleziono zgłoszenia.',404);
   const now=new Date().toISOString();
   await env.DB.prepare("UPDATE blog_posts SET status=?,moderated_at=?,moderated_by=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,?) ELSE published_at END WHERE id=?").bind(input.status,now,request.headers.get('oai-authenticated-user-id'),input.status,now,id).run();
   return json({id,status:input.status});
  }
  return json({error:'Nie znaleziono takiej operacji.'},404);
 }catch(error){return json({error:error.status?error.message:'Nie udało się wykonać operacji. Spróbuj ponownie później.'},error.status||503);}
}
