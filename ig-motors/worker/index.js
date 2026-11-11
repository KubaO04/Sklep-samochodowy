import { handleBlog } from './blog-api.js';
// The build replaces the placeholders with trusted project content.
const SAMPLE = __BLOG_SAMPLE__;
const STATIC_TEXT = __STATIC_TEXT__;
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname.startsWith('/api/blog/'))return handleBlog(request,env,SAMPLE);
  if(!['GET','HEAD'].includes(request.method))return new Response('Niedozwolona metoda',{status:405});
  if(env.ASSETS)return env.ASSETS.fetch(request);
  let name=url.pathname==='/'?'/index.html':url.pathname;
  if(!name.split('/').at(-1).includes('.'))name+='.html';
  const asset=STATIC_TEXT[name];
  if(asset)return new Response(request.method==='HEAD'?null:asset.body,{headers:{'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
  return new Response('Nie znaleziono',{status:404});
 }
};
