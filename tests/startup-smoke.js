const fs=require('fs');
const vm=require('vm');
(async()=>{
  const events={};
  const A={className:'center',innerHTML:'Veilig laden…',textContent:'Veilig laden…'};
  const context={
    console,Date,Math,JSON,Intl,Promise,setTimeout:(fn)=>{if(String(fn).includes('laden duurde'))return 0;return setTimeout(fn,0)},clearTimeout,
    crypto:{randomUUID:()=>`id-${Math.random()}`},
    C:{supabaseUrl:'https://example.supabase.co',supabaseAnonKey:'public'},A,
    sb:null,user:null,ws:null,route:'desk',
    e:value=>String(value),
    setup(){A.innerHTML='setup';A.textContent='setup'},passwordRecovery(){A.innerHTML='recovery'},auth(){A.innerHTML='login';A.textContent='login'},onboard(){A.innerHTML='onboard'},
    desk(){return'<div>desk</div>'},debrief(){return''},training(){return''},tactics(){return''},video(){return''},identity(){return''},settings(){return''},
    shell:body=>body,save(){},notify(){},go(){},team(){return null},nextMatchLanguage(){return'nl'},
    supabase:{createClient(){return{auth:{onAuthStateChange(){},async getSession(){return{data:{session:null},error:null}}},from(){return{select(){return this},eq(){return this},async maybeSingle(){return{data:null,error:null}}}}}}},
    document:{readyState:'loading',body:{},addEventListener(name,fn){events[name]=fn},querySelector(){return null},createElement(){return{className:'',innerHTML:'',remove(){},closest(){return null}}}},
    navigator:{standalone:false,userAgent:'iPhone',serviceWorker:{register:async()=>{},getRegistrations:async()=>[]}},
    caches:{keys:async()=>[],delete:async()=>{}},
    location:{pathname:'/GPTomgeving/',hash:'',replace(){}},
    MutationObserver:function(){this.observe=()=>{}}
  };
  context.window=context;
  context.window.matchMedia=()=>({matches:true,addEventListener(){}});
  context.window.addEventListener=(name,fn)=>{events[`window:${name}`]=fn};
  context.document.body.appendChild=()=>{};
  vm.createContext(context);
  for(const file of ['assets/boot-v17.js','assets/periodisation-ai-v17.js','assets/weekplanner-migration-v17.js','assets/mobile-v17.js']){
    vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  }
  if(typeof events.DOMContentLoaded!=='function')throw new Error('boot was not deferred');
  await events.DOMContentLoaded();
  await new Promise(resolve=>setTimeout(resolve,5));
  if(A.innerHTML!=='login')throw new Error(`expected login, got ${A.innerHTML}`);
  console.log('Startup smoke test passed');
})().catch(error=>{console.error(error);process.exit(1)});