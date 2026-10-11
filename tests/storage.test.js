const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'),os=require('os'),path=require('path');
const storage=require('../storage');
test('database edits commit atomically, rollback failures, and seed only once',async()=>{
 let saved={properties:[],reviews:[],bookings:[]}, pending, released=0;const commands=[];
 const pool={async query(sql,args){commands.push(sql);if(sql.startsWith('SELECT'))return{rows:[{data:structuredClone(saved)}]};return{rows:[]};},async connect(){return{async query(sql,args){commands.push(sql);if(sql==='BEGIN')pending=structuredClone(saved);if(sql.startsWith('SELECT'))return{rows:[{data:pending}]};if(sql.startsWith('UPDATE'))pending=JSON.parse(args[0]);if(sql==='COMMIT')saved=pending;return{rows:[]};},release(){released++;}}}};
 const store=storage.createStore({pool});await store.edit(d=>d.reviews.push({id:'one'}));assert.equal((await store.read()).reviews.length,1);
 await assert.rejects(store.edit(d=>{d.reviews.push({id:'bad'});throw Error('fail')}));assert.equal((await store.read()).reviews.length,1);assert.equal(released,2);assert(commands.includes('ROLLBACK'));assert(commands.some(s=>s.includes('FOR UPDATE')));assert.equal(commands.filter(s=>s.startsWith('INSERT')).length,1);
});
test('Vercel without database cannot write files',async()=>{await assert.rejects(storage.createStore({connectionString:'',production:true}).edit(()=>{}),/DATABASE_NOT_CONFIGURED/)});
test('review submission, moderation, persistence and failed save responses',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cozy-test-')),file=path.join(dir,'db.json');fs.writeFileSync(file,JSON.stringify({properties:[],reviews:[],bookings:[]}));
 const store=storage.createStore({file,connectionString:'',production:false});let fail=false;
 const original=storage.createStore;storage.createStore=()=>({read:store.read,edit:fn=>fail?Promise.reject(Error('offline')):store.edit(fn)});
 process.env.ADMIN_PASSWORD='test-password';const app=require('../server');storage.createStore=original;const server=app.listen(0);await new Promise(r=>server.once('listening',r));const url='http://127.0.0.1:'+server.address().port;
 const request=(p,method='GET',body,admin=false)=>fetch(url+p,{method,headers:{'Content-Type':'application/json',...(admin?{'x-admin':'test-password'}:{})},body:body?JSON.stringify(body):undefined});
 try{
  assert.equal((await request('/api/reviews','POST',{name:'Test',text:'Test review',rating:2.5})).status,400);
  assert.equal((await request('/api/reviews','POST',{name:'Test',text:'Test review',rating:5})).status,200);
  assert.deepEqual(await(await request('/api/reviews')).json(),[]);
  const saved=await storage.createStore({file,connectionString:'',production:false}).read();assert.equal(saved.reviews.length,1);
  assert.equal((await request('/api/admin/reviews/'+saved.reviews[0].id,'PATCH',{approved:true},true)).status,200);
  assert.equal((await(await request('/api/reviews')).json()).length,1);
  fail=true;const failed=await request('/api/reviews','POST',{name:'Test',text:'Test failure',rating:5});assert.equal(failed.status,503);assert((await failed.json()).error);assert.equal((await store.read()).reviews.length,1);
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));fs.rmSync(dir,{recursive:true,force:true});}
});
