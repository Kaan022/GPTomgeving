(()=>{
 const mq=window.matchMedia('(max-width:900px)');
 const L=(nl,en)=>(window.nextMatchLanguage?.()||ws?.data?.prefs?.language||'nl')==='nl'?nl:en;
 const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const initials=n=>String(n||'NM').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
 const originalShell=window.shell;
 const originalDesk=window.desk;
 let deferredInstallPrompt=null;
 let lastMobile=mq.matches;
 const icons={
  home:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
  training:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4z"/><path d="M4 9h16M8 3v4M16 3v4"/><path d="m9 14 2 2 4-4"/></svg>',
  more:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>',
  team:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.5M16 14a5 5 0 0 1 4.5 6"/></svg>',
  plan:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>',
  video:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7.6z"/></svg>',
  bulb:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A7 7 0 1 1 15.5 14.5C14.5 15.3 14 16 14 18h-4c0-2-.5-2.7-1.5-3.5z"/></svg>',
  install:'<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>'
 };
 const isMobile=()=>mq.matches;
 const simpleEnabled=()=>ws?.data?.prefs?.simpleMobile!==false;
 const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
 function clubLogo(size='small'){
  const c=ws?.data?.club||{},x=String(c.logoDataUrl||'');
  return x.startsWith('data:image/')?`<span class="club-mark ${size}"><img src="${esc(x)}" alt="${L('Clublogo','Club logo')}"></span>`:`<span class="club-mark ${size} fallback">${esc(initials(c.name||'Club'))}</span>`;
 }
 function mobileNav(){
  const items=[['desk','home',L('Vandaag','Today')],['debrief','mic',L('Wedstrijd','Match')],['training','training',L('Training','Training')]];
  return `${items.map(([r,i,label])=>`<button aria-label="${esc(label)}" class="${route===r?'on':''}" onclick="go('${r}')"><i>${icons[i]}</i><span>${label}</span></button>`).join('')}<button aria-label="${L('Meer','More')}" onclick="toggleMobileMore()"><i>${icons.more}</i><span>${L('Meer','More')}</span></button>`;
 }
 window.shell=function(body){
  if(!isMobile()||!simpleEnabled())return originalShell(body);
  const t=team()||{};
  return `<div class="v12-shell" style="--club-primary:${esc(ws.data.club?.primaryColor||'#16a085')};--club-secondary:${esc(ws.data.club?.secondaryColor||'#d9f24f')}"><main class="v12-main"><header class="v12-top"><div class="v12-top-team">${clubLogo('small')}<div><strong>${esc(t.name||L('Team','Team'))}</strong><span>${esc(t.category||'')}${t.level?' · '+esc(t.level):''}</span></div></div><div class="v12-actions"><button class="v12-btn primary" aria-label="${L('Reflectie inspreken','Record debrief')}" onclick="go('debrief')">${L('Reflectie','Debrief')}</button></div></header><div class="v12-content">${body}</div></main><nav class="v12-mobile-nav">${mobileNav()}</nav></div>`;
 };
 function installCard(){
  if(isStandalone())return'';
  return `<div class="nm-install-card"><img src="assets/nextmatch-mark.svg" alt="NextMatch"><div><b>${L('Zet NextMatch op je beginscherm','Add NextMatch to your Home Screen')}</b><small>${L('Open voortaan als gewone app zonder browserbalk.','Open it like a regular app without browser controls.')}</small></div><button onclick="installNextMatch()">${L('Installeer','Install')}</button></div>`;
 }
 function readableDate(value){
  if(!value)return L('Nog niet gepland','Not scheduled');
  const d=new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat(L('nl-NL','en-GB'),{weekday:'short',day:'numeric',month:'short'}).format(d);
 }
 function mobileDesk(){
  const t=team()||{},review=ws.data.matchReviews?.[t.id]||{},period=ws.data.periodisation?.[t.id]||{},cycle=period.cycles?.[period.activeCycle],plan=window.ensureSessionPlan?.();
  const opponent=review.opponent||t.nextOpponent||L('Nog niet ingevuld','Not entered');
  const matchDate=readableDate(review.date||t.nextMatchDate);
  const weekFocus=period.weekGoal||cycle?.focus||plan?.topic||t.prior?.[0]||L('Kies je weekfocus','Choose your weekly focus');
  const firstName=String(ws.data.profile?.name||'').split(/\s+/)[0]||L('trainer','coach');
  return window.shell(`${installCard()}<div class="nm-mobile-home"><section class="nm-mobile-greeting"><span>${L('Jouw coachdag','Your coaching day')}</span><h1>${L('Wat ga je nu doen','What do you want to do')}, ${esc(firstName)}?</h1><p>${L('Kies één actie. NextMatch bewaart de rest voor later.','Choose one action. NextMatch keeps everything else out of the way.')}</p></section><div class="nm-mobile-actions"><button class="nm-mobile-action primary" onclick="go('debrief')"><span class="nm-mobile-action-icon">${icons.mic}</span><span><b>${L('Wedstrijd nabespreken','Review the match')}</b><small>${L('Spreek in wat goed ging en wat beter moet.','Record what went well and what must improve.')}</small></span><span class="nm-mobile-action-arrow">›</span></button><button class="nm-mobile-action" onclick="go('training')"><span class="nm-mobile-action-icon">${icons.training}</span><span><b>${L('Training voorbereiden','Prepare training')}</b><small>${L('Bewerk blokken, teken vormen en maak de staf-PDF.','Edit blocks, draw exercises and create the staff PDF.')}</small></span><span class="nm-mobile-action-arrow">›</span></button><button class="nm-mobile-action" onclick="go('tactics')"><span class="nm-mobile-action-icon">${icons.team}</span><span><b>${L('Team en speelwijze','Team and game model')}</b><small>${L('Bekijk formaties, principes en teamdocumenten.','View formations, principles and team documents.')}</small></span><span class="nm-mobile-action-arrow">›</span></button></div><div class="nm-mobile-status"><div class="nm-mobile-status-card"><span>${L('Volgende wedstrijd','Next match')}</span><b>${esc(opponent)}<br>${esc(matchDate)}</b></div><div class="nm-mobile-status-card"><span>${L('Focus deze week','Focus this week')}</span><b>${esc(weekFocus)}</b></div></div><div class="nm-mobile-tip">${icons.bulb}<div><b>${L('Zo werkt NextMatch','How NextMatch works')}</b><p>${L('Na de wedstrijd inspreken → training aanpassen → staf-PDF delen. Meer hoeft een trainer niet te onthouden.','Record after the match → adjust training → share the staff PDF. That is all a coach needs to remember.')}</p></div></div></div>`);
 }
 if(originalDesk)window.desk=function(){return isMobile()&&simpleEnabled()?mobileDesk():originalDesk()};
 window.toggleMobileMore=function(){
  const current=document.querySelector('.nm-mobile-more-sheet');if(current){current.remove();return}
  const sheet=document.createElement('div');sheet.className='nm-mobile-more-sheet';sheet.onclick=e=>{if(e.target===sheet)sheet.remove()};
  const menu=[['periodisation','plan',L('Periodisering','Periodisation'),L('Seizoen, cycli en weekdoelen','Season, cycles and weekly goals')],['video','video',L('Videoanalyse','Video analysis'),L('Bekijk video en markeer momenten','Review video and mark moments')],['tactics','team',L('Team','Team'),L('Speelwijze, formaties en documenten','Game model, formations and documents')],['settings','settings',L('Instellingen','Settings'),L('Profiel, club en voorkeuren','Profile, club and preferences')]];
  sheet.innerHTML=`<div class="nm-mobile-more-card"><div class="nm-mobile-sheet-grip"></div><h2>${L('Meer','More')}</h2><div class="nm-mobile-menu">${menu.map(([r,i,title,sub])=>`<button onclick="this.closest('.nm-mobile-more-sheet').remove();go('${r}')">${icons[i]}<b>${title}</b><small>${sub}</small></button>`).join('')}${!isStandalone()?`<button onclick="this.closest('.nm-mobile-more-sheet').remove();installNextMatch()">${icons.install}<b>${L('App installeren','Install app')}</b><small>${L('Zet NextMatch op je beginscherm','Add NextMatch to your Home Screen')}</small></button>`:''}</div><button class="nm-mobile-close" onclick="this.closest('.nm-mobile-more-sheet').remove()">${L('Sluiten','Close')}</button></div>`;
  document.body.appendChild(sheet);
 };
 function installHelp(){
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  const modal=document.createElement('div');modal.className='nm-install-modal';
  const steps=ios?[L('Tik onderaan in Safari op de deelknop.','Tap the Share button in Safari.'),L('Kies Zet op beginscherm.','Choose Add to Home Screen.'),L('Zet Open als webapp aan en tik op Voeg toe.','Enable Open as Web App and tap Add.')]:[L('Open het browsermenu.','Open the browser menu.'),L('Kies App installeren of Toevoegen aan startscherm.','Choose Install app or Add to Home Screen.'),L('Bevestig de installatie.','Confirm installation.')];
  modal.innerHTML=`<div class="nm-install-modal-card"><img src="assets/nextmatch-mark.svg" alt="NextMatch"><h2>${L('NextMatch installeren','Install NextMatch')}</h2><p>${L('Daarna opent NextMatch als een gewone app, zonder adresbalk.','NextMatch will then open like a regular app without the address bar.')}</p><div class="nm-install-steps">${steps.map((s,i)=>`<div class="nm-install-step"><b>${i+1}</b><span>${s}</span></div>`).join('')}</div><button onclick="this.closest('.nm-install-modal').remove()">${L('Begrepen','Got it')}</button></div>`;
  document.body.appendChild(modal);
 }
 window.installNextMatch=async function(){
  if(isStandalone()){notify(L('NextMatch is al als app geopend.','NextMatch is already running as an app.'));return}
  if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;render();return}
  installHelp();
 };
 window.toggleSimpleMobile=function(){ws.data.prefs||={};ws.data.prefs.simpleMobile=ws.data.prefs.simpleMobile===false;save();render()};
 function settingsCard(){
  if(route!=='settings'||!isMobile())return;
  const content=document.querySelector('.v12-content,.elite-content');if(!content||document.querySelector('.nm-simple-settings'))return;
  const card=document.createElement('section');card.className='v12-panel nm-simple-settings';card.innerHTML=`<div class="v12-panel-head"><div><h2>${L('Mobiele weergave','Mobile view')}</h2><span>${L('Voor eenvoudige en snelle bediening langs het veld','For simple, fast use pitch-side')}</span></div></div><div class="v12-panel-body"><button class="v12-btn primary" style="width:100%" onclick="toggleSimpleMobile()">${simpleEnabled()?L('Gebruik geavanceerde weergave','Use advanced view'):L('Gebruik eenvoudige weergave','Use simple view')}</button></div>`;
  content.prepend(card);
 }
 function enhance(){settingsCard();document.querySelectorAll('.help-i').forEach(x=>x.remove())}
 const observer=new MutationObserver(()=>requestAnimationFrame(enhance));observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event;requestAnimationFrame(enhance)});
 window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;notify(L('NextMatch is geïnstalleerd.','NextMatch is installed.'));render()});
 mq.addEventListener?.('change',()=>{if(lastMobile!==mq.matches){lastMobile=mq.matches;render()}});
 if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));
 requestAnimationFrame(()=>{enhance();if(isMobile()&&simpleEnabled()&&route==='desk')render()});
})();
