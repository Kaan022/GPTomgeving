(()=>{
  'use strict';
  const originalToggle=window.toggleMobileMore;
  const L=(nl,en)=>(window.nextMatchLanguage?.()||ws?.data?.prefs?.language||'nl')==='en'?en:nl;
  const icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V7l8-4 8 4v13"/><path d="M8 20v-5h8v5M8 9h2M14 9h2"/></svg>';
  if(typeof originalToggle==='function')window.toggleMobileMore=function(){
    originalToggle();
    requestAnimationFrame(()=>{
      const menu=document.querySelector('.nm-mobile-menu');
      if(!menu||menu.querySelector('[data-ci-mobile]'))return;
      const button=document.createElement('button');
      button.dataset.ciMobile='1';
      button.onclick=()=>{document.querySelector('.nm-mobile-more-sheet')?.remove();go('club')};
      button.innerHTML=`${icon}<b>${L('Club Intelligence','Club Intelligence')}</b><small>${L('Technische staf, teams, alignment en clubbeleid','Technical staff, teams, alignment and club policy')}</small>`;
      menu.prepend(button);
    });
  };
})();