let nmBootStarted=false;
let nmBootCompleted=false;

function fatalScreen(error){
  console.error('NextMatch startup error',error);
  const message=String(error?.message||error||'Onbekende fout');
  A.className='center';
  A.innerHTML=`<div class="card"><div class="logo"><b>NM</b>NextMatch</div><h1>NextMatch kon niet starten</h1><p class="mut">De app heeft zichzelf veilig gestopt. Probeer opnieuw; je teamdata blijft bewaard.</p><div class="alert">${e(message)}</div><button class="btn primary" style="width:100%" onclick="location.replace(location.pathname+'?refresh='+Date.now()+location.hash)">Opnieuw laden</button><button class="btn" style="width:100%;margin-top:8px" onclick="resetNextMatchCache()">Cache herstellen</button></div>`;
}

async function resetNextMatchCache(){
  try{
    if('serviceWorker' in navigator){const registrations=await navigator.serviceWorker.getRegistrations();await Promise.all(registrations.map(item=>item.unregister()))}
    if('caches' in window){const keys=await caches.keys();await Promise.all(keys.map(key=>caches.delete(key)))}
  }catch(error){console.warn('Cache reset',error)}
  location.replace(location.pathname+'?refresh='+Date.now()+location.hash);
}

function render(){
  try{
    if(!C.supabaseUrl||!C.supabaseAnonKey){setup();nmBootCompleted=true;return}
    if(window.NM_PASSWORD_RECOVERY){passwordRecovery();nmBootCompleted=true;return}
    if(!user){auth();nmBootCompleted=true;return}
    if(!ws?.data?.onboarded){onboard();nmBootCompleted=true;return}
    const views={desk,debrief,training,periodisation,club:clubIntelligence,tactics,video,identity,settings};
    A.className='';
    A.innerHTML=(views[route]||desk)();
    nmBootCompleted=true;
  }catch(error){fatalScreen(error)}
}

async function boot(){
  if(nmBootStarted)return;
  nmBootStarted=true;
  try{
    if(!C.supabaseUrl||!C.supabaseAnonKey){render();return}
    if(typeof supabase==='undefined')throw new Error('De beveiligde databasebibliotheek kon niet worden geladen.');
    sb=supabase.createClient(C.supabaseUrl,C.supabaseAnonKey,{auth:{persistSession:true,detectSessionInUrl:true,autoRefreshToken:true}});
    sb.auth.onAuthStateChange((event,session)=>{
      if(event==='PASSWORD_RECOVERY')window.NM_PASSWORD_RECOVERY=true;
      load(session?.user).catch(fatalScreen);
    });
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    await load(data.session?.user);
  }catch(error){fatalScreen(error)}
}

async function load(nextUser){
  user=nextUser;
  if(!nextUser){ws=null;render();return}
  const {data,error}=await sb.from('coach_workspaces').select('*').eq('user_id',nextUser.id).maybeSingle();
  if(error)throw error;
  ws=data||{user_id:nextUser.id,data:{onboarded:false,draft:{}}};
  render();
}

window.addEventListener('error',event=>{if(!nmBootCompleted)fatalScreen(event.error||event.message)});
window.addEventListener('unhandledrejection',event=>{if(!nmBootCompleted)fatalScreen(event.reason)});
setTimeout(()=>{if(!nmBootCompleted&&A.textContent.includes('Veilig laden'))fatalScreen(new Error('Het laden duurde te lang.'))},12000);

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();