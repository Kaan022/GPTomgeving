(()=>{
  let saveStatus='saved';
  const label=()=>{const nl=(window.nextMatchLanguage?.()||'nl')==='nl';return saveStatus==='saving'?(nl?'Opslaan…':'Saving…'):saveStatus==='error'?(nl?'Opslaan mislukt':'Save failed'):(nl?'Automatisch opgeslagen':'Autosaved')};
  function paintStatus(){document.querySelectorAll('.save-state').forEach(el=>{el.className=`save-state ${saveStatus}`;el.textContent=label()})}
  const nativeSave=save;
  save=function(){
    if(!user||!ws)return;
    clearTimeout(save.t);saveStatus='saving';paintStatus();
    save.t=setTimeout(async()=>{try{const {error}=await sb.from('coach_workspaces').upsert({user_id:user.id,data:ws.data,updated_at:new Date().toISOString()});if(error)throw error;saveStatus='saved'}catch(err){console.error(err);saveStatus='error';notify?.(((window.nextMatchLanguage?.()||'nl')==='nl'?'Opslaan mislukt. Controleer je verbinding.':'Save failed. Check your connection.'),'error')}paintStatus()},500)
  };
  function inject(){
    if(!user||!ws)return;
    const actions=document.querySelector('.elite-top .elite-actions');
    if(actions&&!actions.querySelector('.save-state'))actions.insertAdjacentHTML('afterbegin',`<span class="save-state ${saveStatus}">${label()}</span>`);
    if(!document.querySelector('.mobile-quick-debrief')&&route!=='debrief')document.body.insertAdjacentHTML('beforeend',`<button class="mobile-quick-debrief" onclick="go('debrief')"><i>●</i><span>${(window.nextMatchLanguage?.()||'nl')==='nl'?'Reflectie inspreken':'Record debrief'}</span></button>`);
    if(route==='debrief')document.querySelector('.mobile-quick-debrief')?.remove();
    paintStatus();
  }
  const observer=new MutationObserver(()=>requestAnimationFrame(inject));observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>setTimeout(inject,0));
  requestAnimationFrame(inject);
})();