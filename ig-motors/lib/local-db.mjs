import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
export function createLocalDatabase(filename=':memory:'){
 const db=new DatabaseSync(filename);
 db.exec('CREATE TABLE IF NOT EXISTS __ig_local_migrations (name TEXT PRIMARY KEY)');
 const directory=path.resolve(import.meta.dirname,'../drizzle');
 for(const file of fs.readdirSync(directory).filter(name=>name.endsWith('.sql')).sort()){
  if(!db.prepare('SELECT name FROM __ig_local_migrations WHERE name=?').get(file)){
   db.exec(fs.readFileSync(path.join(directory,file),'utf8'));
   db.prepare('INSERT INTO __ig_local_migrations(name) VALUES (?)').run(file);
  }
 }
 const binding={prepare(sql){const statement=db.prepare(sql);const create=(values=[])=>({bind(...args){return create(args);},async first(column){const row=statement.get(...values);return row?(column?row[column]:row):null;},async all(){return{results:statement.all(...values),success:true};},async run(){const result=statement.run(...values);return{success:true,meta:{changes:Number(result.changes),last_row_id:Number(result.lastInsertRowid)}};}});return create();}};
 return{binding,close:()=>db.close(),database:db};
}
