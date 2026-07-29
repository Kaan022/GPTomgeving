(()=>{
  'use strict';
  const mq=window.matchMedia('(max-width:900px)');
  const originalShell=window.shell;
  const originalDesk=window.desk;
  let deferredInstallPrompt=null;

  const language=()=>window.nextMatchLanguage?.()||ws?.data?.prefs?.language||'nl';
  const L=(nl,en)=>language()==='en'?en:nl;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[ch]));
  const initials=value=>String(value||'NM').split(/\s+/).filter(Boolean).slice(0,2).map(item=>item[0]).join('').toUpperCase();
  const isMobile=()=>mq.matches;
  const simpleEnabled=()=>ws?.data?.prefs?.simpleMobile!==false;
  const isStandalone=()=>window.matchMedia('(display-mode:standalone)').matches||window.navigator.standalone===true;
  const currentTeam=()=>typeof team==='function'?team():null;
  const pad=value=>String(value).padStart(2,'0');
  const iso=date=>`${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const weekKey=date=>{const copy=new Date(date);copy.setHours(12,0,0,0);copy.setDate(copy.getDate()-((copy.getDay()+6)%7));return iso(copy)};

  const icons={
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.8 12 3l9 7.8"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>',
    mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="3" width="8" height="12" rx="4"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h3v3H8z"/></svg>',
    team:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a3 3 0 0 1 0 5.5M16 14a5 5 0 0 1 4.5 6"/></svg>',
    more:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
    training:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v14H4z"/><path d="M4 9h16M8 3v4M16 3v4"/><path d="m9 14 2 2 4-4"/></svg>',
    video:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 4-2v8l-4-2z"/></svg>',
    settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
    install:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>'
  };

  function clubLogo(size='small'){
    const club=ws?.data?.club||{},src=String(club.logoDataUrl||'');
    return src.startsWith('data:image/')?`<span class="club-mark ${size}"><img src="${esc(src)}" alt="${L('Clublogo','Club logo')}"></span>`:`<span class="club-mark ${size} fallback">${esc(initials(club.name||'Club'))}</span>`;
  }

  function mobileNav(){
    const items=[['desk','home',L('Vandaag','Today')],['debrief','mic',L('Wedstrijd','Match')],['periodisation','calendar',L('Weekplan','Week plan')]];
    return`${items.map(([target,icon,label])=>`<button aria-label="${esc(label)}" class="${route===target?'on':''}" onclick="go('${target}')"><i>${icons[icon]}</i><span>${esc(label)}</span></button>`).join('')}<button aria-label="${L('Meer','More')}" onclick="toggleMobileMore()"><i>${icons.more}</i><span>${L('Meer','More')}</span></button>`;
  }

  if(typeof originalShell==='function')window.shell=function(body){
    if(!isMobile()||!simpleEnabled())return originalShell(body);
    const t=currentTeam()||{};
    return`<div class="v12-shell" style="--club-primary:${esc(ws.data.club?.primaryColor||'#16a085')};--club-secondary:${esc(ws.data.club?.secondaryColor||'#d9f24f')}"><main class="v12-main"><header class="v12-top"><div class="v12-top-team">${clubLogo('small')}<div><strong>${esc(t.name||L('Team','Team'))}</strong><span>${esc(t.category||'')}${t.level?' · '+esc(t.level):''}</span></div></div><button class="v12-btn primary" onclick="go('debrief')">${L('Inspreken','Record')}</button></header><div class="v12-content">${body}</div></main><nav class="v12-mobile-nav">${mobileNav()}</nav></div>`;
  };

  function readableDate(value){if(!value)return L('Nog niet gepland','Not scheduled');const date=new Date(`${value}T12:00:00`);return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat(language()==='en'?'en-GB':'nl-NL',{weekday:'short',day:'numeric',month:'short'}).format(date)}
  function currentWeekPlan(){const t=currentTeam();return ws?.data?.smartPeriodisation?.[t?.id]?.weeks?.[weekKey(new Date())]}
  function installCard(){if(isStandalone())return'';return`<div class="nm-install-card"><img src="assets/nextmatch-mark.svg" alt="NextMatch"><div><b>${L('Zet NextMatch op je beginscherm','Add NextMatch to your Home Screen')}</b><small>${L('Open voortaan zonder browserbalk.','Open without browser controls.')}</small></div><button onclick="installNextMatch()">${L('Installeer','Install')}</button></div>`}

  function mobileDesk(){
    const t=currentTeam()||{},review=ws.data.matchReviews?.[t.id]||{},period=ws.data.periodisation?.[t.id]||{},cycle=period.cycles?.[period.activeCycle],plan=currentWeekPlan();
    const firstName=String(ws.data.profile?.name||'').split(/\s+/)[0]||L('trainer','coach');
    const opponent=review.opponent||t.nextOpponent||L('Nog niet ingevuld','Not entered');
    const focus=plan?((language()==='en'?plan.theme?.titleEn:plan.theme?.titleNl)||plan.sessions?.[0]?.focus):period.weekGoal||cycle?.focus||t.prior?.[0]||L('Kies je weekfocus','Choose your weekly focus');
    const today=iso(new Date()),todaySession=plan?.sessions?.find(item=>item.date===today);
    const todayCard=todaySession?`<button class="nm-mobile-today-session" onclick="openPlannedSession('${plan.weekStart}','${todaySession.id}')"><span class="nm-mobile-today-icon">${icons.calendar}</span><span><small>${L('Training vandaag','Training today')} · ${esc(todaySession.start)}</small><b>${esc(todaySession.title)}</b><em>${esc(todaySession.focus)}</em></span><strong>›</strong></button>`:'';
    return window.shell(`${installCard()}<div class="nm-mobile-home"><section class="nm-mobile-greeting"><span>${L('Jouw coachdag','Your coaching day')}</span><h1>${L('Wat ga je nu doen','What do you want to do')}, ${esc(firstName)}?</h1><p>${L('Kies één actie. De rest blijft uit beeld.','Choose one action. Everything else stays out of the way.')}</p></section>${todayCard}<div class="nm-mobile-actions"><button class="nm-mobile-action primary" onclick="go('debrief')"><span class="nm-mobile-action-icon">${icons.mic}</span><span><b>${L('Wedstrijd nabespreken','Review the match')}</b><small>${L('Spreek in wat je zag en wat beter moet.','Record what you saw and what must improve.')}</small></span><span class="nm-mobile-action-arrow">›</span></button><button class="nm-mobile-action" onclick="go('periodisation')"><span class="nm-mobile-action-icon">${icons.calendar}</span><span><b>${L('Week plannen','Plan the week')}</b><small>${L('Bekijk thema, tegenhangend thema en trainingen.','View theme, counter theme and sessions.')}</small></span><span class="nm-mobile-action-arrow">›</span></button><button class="nm-mobile-action" onclick="go('tactics')"><span class="nm-mobile-action-icon">${icons.team}</span><span><b>${L('Team en speelwijze','Team and game model')}</b><small>${L('Bekijk formaties, principes en documenten.','View formations, principles and documents.')}</small></span><span class="nm-mobile-action-arrow">›</span></button></div><div class="nm-mobile-status"><div class="nm-mobile-status-card"><span>${L('Volgende wedstrijd','Next match')}</span><b>${esc(opponent)}<br>${esc(readableDate(review.date||t.nextMatchDate))}</b></div><div class="nm-mobile-status-card"><span>${L('Focus deze week','Focus this week')}</span><b>${esc(focus)}</b></div></div></div>`);
  }
  if(typeof originalDesk==='function')window.desk=()=>isMobile()&&simpleEnabled()?mobileDesk():originalDesk();

  window.toggleMobileMore=()=>{
    document.querySelector('.nm-mobile-more-sheet')?.remove();
    const sheet=document.createElement('div');sheet.className='nm-mobile-more-sheet';sheet.onclick=event=>{if(event.target===sheet)sheet.remove()};
    const menu=[['training','training',L('Actieve training','Active session'),L('Bewerk blokken, teken vormen en maak PDF','Edit blocks, draw exercises and create PDF')],['video','video',L('Videoanalyse','Video analysis'),L('Bekijk video en markeer momenten','Review video and mark moments')],['tactics','team',L('Team','Team'),L('Speelwijze, formaties en documenten','Game model, formations and documents')],['settings','settings',L('Instellingen','Settings'),L('Profiel, club en voorkeuren','Profile, club and preferences')]];
    sheet.innerHTML=`<div class="nm-mobile-more-card"><div class="nm-mobile-sheet-grip"></div><h2>${L('Meer','More')}</h2><div class="nm-mobile-menu">${menu.map(([target,icon,title,sub])=>`<button onclick="this.closest('.nm-mobile-more-sheet').remove();go('${target}')">${icons[icon]}<b>${title}</b><small>${sub}</small></button>`).join('')}${!isStandalone()?`<button onclick="this.closest('.nm-mobile-more-sheet').remove();installNextMatch()">${icons.install}<b>${L('App installeren','Install app')}</b><small>${L('Zet NextMatch op je beginscherm','Add NextMatch to your Home Screen')}</small></button>`:''}</div><button class="nm-mobile-close" onclick="this.closest('.nm-mobile-more-sheet').remove()">${L('Sluiten','Close')}</button></div>`;
    document.body.appendChild(sheet);
  };

  function installHelp(){const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);const steps=ios?[L('Tik in Safari op delen.','Tap Share in Safari.'),L('Kies Zet op beginscherm.','Choose Add to Home Screen.'),L('Bevestig met Voeg toe.','Confirm with Add.')]:[L('Open het browsermenu.','Open the browser menu.'),L('Kies App installeren.','Choose Install app.'),L('Bevestig de installatie.','Confirm installation.')];const modal=document.createElement('div');modal.className='nm-install-modal';modal.innerHTML=`<div class="nm-install-modal-card"><img src="assets/nextmatch-mark.svg" alt="NextMatch"><h2>${L('NextMatch installeren','Install NextMatch')}</h2><div class="nm-install-steps">${steps.map((step,index)=>`<div class="nm-install-step"><b>${index+1}</b><span>${step}</span></div>`).join('')}</div><button onclick="this.closest('.nm-install-modal').remove()">${L('Begrepen','Got it')}</button></div>`;document.body.appendChild(modal)}
  window.installNextMatch=async()=>{if(isStandalone())return;if(deferredInstallPrompt){deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;return}installHelp()};
  window.toggleSimpleMobile=()=>{ws.data.prefs||={};ws.data.prefs.simpleMobile=ws.data.prefs.simpleMobile===false;save();render()};
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstallPrompt=event});
  window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null});
  mq.addEventListener?.('change',()=>typeof render==='function'&&render());
  if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(error=>console.error('Service worker',error)),{once:true});
})();