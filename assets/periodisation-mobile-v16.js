(()=>{
 const L=(nl,en)=>(window.nextMatchLanguage?.()||ws?.data?.prefs?.language||'nl')==='nl'?nl:en;
 const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const pad=n=>String(n).padStart(2,'0');
 const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 const weekKey=d=>{const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return iso(x)};
 const calendarIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h3v3H8z"/></svg>';
 function plan(){return ws?.data?.smartPeriodisation?.[team()?.id]?.weeks?.[weekKey(new Date())]}
 function enhanceNav(){
  const nav=document.querySelector('.v12-mobile-nav');if(nav){const buttons=[...nav.querySelectorAll('button')];if(buttons[2]){buttons[2].setAttribute('onclick',"go('periodisation')");buttons[2].setAttribute('aria-label',L('Weekplan','Week plan'));const i=buttons[2].querySelector('i'),span=buttons[2].querySelector('span');if(i)i.innerHTML=calendarIcon;if(span)span.textContent=L('Weekplan','Week plan');buttons[2].classList.toggle('on',route==='periodisation')}}
  const actions=[...document.querySelectorAll('.nm-mobile-actions .nm-mobile-action')];if(actions[1]&&!actions[1].dataset.weekplan){actions[1].dataset.weekplan='1';actions[1].setAttribute('onclick',"go('periodisation')");const icon=actions[1].querySelector('.nm-mobile-action-icon'),b=actions[1].querySelector('b'),small=actions[1].querySelector('small');if(icon)icon.innerHTML=calendarIcon;if(b)b.textContent=L('Week plannen','Plan the week');if(small)small.textContent=L('Bekijk het AI-thema, tegenhangend thema en de trainingen in de kalender.','View the AI theme, counter theme and sessions in the calendar.')}
  document.querySelectorAll('.nm-mobile-menu button').forEach(btn=>{if(btn.getAttribute('onclick')?.includes("periodisation")){const b=btn.querySelector('b'),small=btn.querySelector('small');if(b)b.textContent=L('Weekplanning','Weekly planning');if(small)small.textContent=L('AI-thema, kalender en trainingssessies','AI theme, calendar and sessions')}})
 }
 function todayCard(){const home=document.querySelector('.nm-mobile-home'),p=plan();if(!home||!p||document.querySelector('.nm-mobile-today-session'))return;const today=iso(new Date()),session=p.sessions?.find(x=>x.date===today);if(!session)return;const status=home.querySelector('.nm-mobile-status');const card=document.createElement('button');card.className='nm-mobile-today-session';card.onclick=()=>window.openPlannedSession?.(p.weekStart,session.id);card.innerHTML=`<span class="nm-mobile-today-icon">${calendarIcon}</span><span><small>${L('Training vandaag','Training today')} · ${esc(session.start)}</small><b>${esc(session.title)}</b><em>${esc(session.focus)}</em></span><strong>›</strong>`;status?.before(card)
 }
 function apply(){enhanceNav();todayCard()}
 const oldRender=window.render;window.render=function(){const r=oldRender();requestAnimationFrame(apply);return r};
 new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true});
 requestAnimationFrame(apply);
})();