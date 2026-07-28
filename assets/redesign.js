(()=>{
  const VERSION='2026.07';
  const safeColor=(value,fallback)=>/^#[0-9a-f]{6}$/i.test(String(value||''))?value:fallback;
  const club=()=>ws?.data?.club||{};
  const initials=(name)=>String(name||'NextMatch').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const safeLogo=(value)=>String(value||'').startsWith('data:image/')?value:'';
  const displayDate=(value)=>{
    if(!value)return 'Nog niet gepland';
    const date=new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())?value:new Intl.DateTimeFormat('nl-NL',{weekday:'short',day:'numeric',month:'short'}).format(date);
  };
  const getTheme=()=>({
    primary:safeColor(club().primaryColor,'#0b6b58'),
    secondary:safeColor(club().secondaryColor,'#d9f24f')
  });
  const clubMark=(size='normal')=>{
    const logo=safeLogo(club().logoDataUrl);
    return logo?`<span class="club-mark ${size}"><img src="${e(logo)}" alt="Clublogo"></span>`:`<span class="club-mark ${size} fallback">${e(initials(club().name))}</span>`;
  };
  const navigation=[
    ['desk','⌂','Vandaag'],
    ['debrief','◉','Wedstrijd'],
    ['training','▤','Trainingsweek'],
    ['tactics','◇','Team'],
    ['video','▶','Video'],
    ['identity','◎','Speelwijze'],
    ['settings','⚙','Instellingen']
  ];
  nav=()=>navigation;
  shell=function(body){
    const t=team()||{},theme=getTheme();
    const primary=navigation.slice(0,4),secondary=navigation.slice(4);
    return `<div class="nm-shell" style="--club-primary:${theme.primary};--club-secondary:${theme.secondary}">
      <aside class="nm-sidebar">
        <div class="nm-brand">${clubMark('large')}<div><strong>${e(club().name||'NextMatch')}</strong><span>Coach workspace</span></div></div>
        <label class="nm-team-switch"><span>Team</span><select onchange="switchTeam(this.value)">${ws.data.teams.map(x=>`<option value="${x.id}" ${x.id===t.id?'selected':''}>${e(x.name)}</option>`).join('')}</select></label>
        <nav class="nm-nav primary">${primary.map(x=>`<button class="${route===x[0]?'on':''}" onclick="go('${x[0]}')"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('')}</nav>
        <div class="nm-nav-label">Meer</div>
        <nav class="nm-nav secondary">${secondary.map(x=>`<button class="${route===x[0]?'on':''}" onclick="go('${x[0]}')"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('')}</nav>
        <div class="nm-user"><div class="nm-avatar">${e(initials(ws.data.profile?.name||user?.email))}</div><div><strong>${e(ws.data.profile?.name||'Trainer')}</strong><span>${e(ws.data.profile?.role||'Coach')}</span></div><button title="Uitloggen" onclick="logout()">↗</button></div>
      </aside>
      <main class="nm-main">
        <header class="nm-topbar">
          <div class="nm-mobile-club">${clubMark('small')}<div><strong>${e(t.name||'Team')}</strong><span>${e(t.category||'')} ${t.level?'· '+e(t.level):''}</span></div></div>
          <div class="nm-context"><strong>${e(t.name||'Team')}</strong><span>${e(t.category||'')} ${t.level?'· '+e(t.level):''}</span></div>
          <div class="nm-top-actions"><button class="nm-quiet" onclick="go('settings')">Aanpassen</button><button class="nm-primary" onclick="go('debrief')">+ Reflectie</button></div>
        </header>
        <div class="nm-content">${body}</div>
      </main>
      <nav class="nm-mobile-nav">${primary.map(x=>`<button class="${route===x[0]?'on':''}" onclick="go('${x[0]}')"><i>${x[1]}</i><span>${x[2]}</span></button>`).join('')}</nav>
    </div>`;
  };

  desk=function(){
    const t=team(),hasDebrief=Boolean(String(ws.data.debrief||'').trim()),hasAnalysis=Boolean(ws.data.analysis);
    const stage=!hasDebrief?0:!hasAnalysis?1:2;
    const actions=[
      {eyebrow:'Na de wedstrijd',title:'Leg vast wat je zag',text:'Spreek twee minuten in. NextMatch helpt je feit, hypothese en interventie uit elkaar te houden.',label:'Start wedstrijdreflectie',route:'debrief'},
      {eyebrow:'Reflectie klaar',title:'Maak er één coachbesluit van',text:'Structureer je observaties en kies het gedrag dat deze week aantoonbaar moet veranderen.',label:'Open reflectie',route:'debrief'},
      {eyebrow:'Coachbesluit staat',title:'Vertaal het naar het veld',text:'Bouw dezelfde bedoeling op in twee trainingen met toenemende weerstand en minder coachafhankelijkheid.',label:'Open trainingsweek',route:'training'}
    ];
    const a=actions[stage],focus=t.prior?.[0]||ws.data.analysis?.action||'Kies in Teaminstellingen één herkenbaar teamgedrag als focus.';
    return shell(`
      <section class="today-head"><div><span class="eyebrow">Vandaag</span><h1>Wat vraagt nu jouw aandacht?</h1><p>NextMatch toont alleen de volgende logische coachactie.</p></div><div class="match-chip"><span>Volgende wedstrijd</span><strong>${e(t.nextOpponent||'Tegenstander instellen')}</strong><small>${displayDate(t.nextMatchDate)}</small></div></section>
      <section class="next-action"><div class="next-action-copy"><span class="eyebrow">${a.eyebrow}</span><h2>${a.title}</h2><p>${a.text}</p><button class="nm-primary large" onclick="go('${a.route}')">${a.label} →</button></div><div class="cycle-visual"><div class="cycle-step ${stage>=0?'done':''}"><b>1</b><span>Reflecteren</span></div><div class="cycle-line ${stage>=1?'done':''}"></div><div class="cycle-step ${stage>=1?'done':''}"><b>2</b><span>Beslissen</span></div><div class="cycle-line ${stage>=2?'done':''}"></div><div class="cycle-step ${stage>=2?'done':''}"><b>3</b><span>Trainen</span></div></div></section>
      <div class="today-grid">
        <section class="simple-card focus-card"><div class="card-kicker">Weekfocus</div><h3>${e(focus)}</h3><p>Maak dit observeerbaar: welke trigger, afstemming en uitkomst wil je terugzien?</p><button class="text-link" onclick="go('identity')">Teamprincipes bekijken →</button></section>
        <section class="simple-card"><div class="card-kicker">Jouw week</div><div class="week-line"><span>Trainingen</span><strong>${e(t.days||'Nog instellen')}</strong></div><div class="week-line"><span>Duur</span><strong>${t.duration||75} min</strong></div><div class="week-line"><span>Selectie</span><strong>${t.squad||16} spelers</strong></div><button class="text-link" onclick="go('training')">Open trainingsweek →</button></section>
        <section class="simple-card"><div class="card-kicker">Teamorganisatie</div><div class="formation-pair"><span>Met bal</span><strong>${e(t.fin||'—')}</strong></div><div class="formation-pair"><span>Zonder bal</span><strong>${e(t.fout||'—')}</strong></div><button class="text-link" onclick="go('tactics')">Bekijk op het veld →</button></section>
      </div>`);
  };

  function logoPreviewMarkup(){return `<div class="logo-editor"><div id="club-logo-preview">${clubMark('xlarge')}</div><div><label class="nm-upload">Logo kiezen<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onchange="uploadClubLogo(this)"></label><button class="nm-quiet danger-text" onclick="removeClubLogo()">Verwijderen</button><small>PNG, JPG, WebP of SVG. De app verkleint het logo automatisch.</small></div></div>`}
  window.uploadClubLogo=async function(input){
    const file=input.files?.[0]; if(!file)return;
    if(file.size>5*1024*1024){nmNotice('Logo is groter dan 5 MB. Kies een kleiner bestand.','error');input.value='';return}
    try{
      const data=await compressLogo(file);ws.data.club.logoDataUrl=data;save();nmNotice('Clublogo opgeslagen.');render();
    }catch(err){nmNotice('Dit logo kon niet worden verwerkt.','error')}
  };
  window.removeClubLogo=function(){ws.data.club.logoDataUrl='';save();render();};
  function compressLogo(file){return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=reject;reader.onload=()=>{
      if(file.type==='image/svg+xml'){resolve(String(reader.result));return}
      const img=new Image();img.onerror=reject;img.onload=()=>{const max=256,scale=Math.min(1,max/Math.max(img.width,img.height)),w=Math.max(1,Math.round(img.width*scale)),h=Math.max(1,Math.round(img.height*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0,w,h);resolve(canvas.toDataURL('image/webp',.86))};img.src=String(reader.result)
    };reader.readAsDataURL(file)
  })}
  window.saveBranding=function(){
    ws.data.club.primaryColor=safeColor(v('club-primary'),'#0b6b58');ws.data.club.secondaryColor=safeColor(v('club-secondary'),'#d9f24f');save();nmNotice('Clubstijl opgeslagen.');render();
  };
  window.saveCoachSettings=function(){
    const t=team(),pr=ws.data.profile,fin=formationDetails(v('sfi')),fout=formationDetails(v('sfo'));
    if(!fin.valid||!fout.valid){nmNotice('Controleer de twee formaties.','error');return}
    Object.assign(pr,{name:v('sn'),role:v('sr'),exp:+v('se'),depth:v('sd')});
    Object.assign(ws.data.club,{name:v('sc'),country:v('sco')});
    Object.assign(t,{name:v('st'),category:v('sca'),level:v('sl'),season:v('ss'),squad:+v('ssq'),duration:+v('sdu'),days:v('sda'),matchday:v('sma'),nextOpponent:v('sop'),nextMatchDate:v('sdate'),field:v('sfield'),staff:v('sstaff'),fin:fin.normalized,fout:fout.normalized,style:v('sst'),prior:lines(v('spr'))});
    save();nmNotice('Instellingen opgeslagen.');render();
  };
  settings=function(){
    const t=team(),pr=ws.data.profile,pf=ws.data.prefs,theme=getTheme();
    return shell(`<section class="page-head"><span class="eyebrow">Instellingen</span><h1>Maak NextMatch van jouw club</h1><p>Begin met identiteit en teamcontext. Geavanceerde opties blijven uit beeld totdat je ze nodig hebt.</p></section>
      <div class="settings-grid">
        <section class="settings-card brand-card"><div class="settings-title"><div><span>Clubidentiteit</span><h2>Logo en kleuren</h2></div>${clubMark('large')}</div>${logoPreviewMarkup()}<div class="color-grid"><label>Primaire kleur<input id="club-primary" type="color" value="${theme.primary}"></label><label>Accentkleur<input id="club-secondary" type="color" value="${theme.secondary}"></label></div><button class="nm-primary" onclick="saveBranding()">Clubstijl opslaan</button></section>
        <section class="settings-card"><div class="settings-title"><div><span>Trainer</span><h2>Jouw profiel</h2></div></div><div class="form-grid"><label>Naam<input id="sn" value="${e(pr.name)}"></label><label>Rol<input id="sr" value="${e(pr.role)}"></label><label>Ervaring in jaren<input id="se" type="number" min="0" value="${pr.exp||0}"></label><label>Gewenste diepgang<select id="sd"><option ${pr.depth==='Praktisch en eenvoudig'?'selected':''}>Praktisch en eenvoudig</option><option ${pr.depth==='Ontwikkelend'?'selected':''}>Ontwikkelend</option><option ${pr.depth==='Gevorderd tactisch'?'selected':''}>Gevorderd tactisch</option><option ${pr.depth==='High performance'?'selected':''}>High performance</option></select></label></div></section>
        <section class="settings-card wide-card"><div class="settings-title"><div><span>Teamcontext</span><h2>${e(t.name)}</h2></div><button class="nm-quiet" onclick="newTeam()">+ Team toevoegen</button></div><div class="form-grid three"><label>Club<input id="sc" value="${e(club().name)}"></label><label>Land<input id="sco" value="${e(club().country||'Nederland')}"></label><label>Team<input id="st" value="${e(t.name)}"></label><label>Categorie<input id="sca" value="${e(t.category)}" placeholder="JO17, senioren, vrouwen"></label><label>Niveau<input id="sl" value="${e(t.level)}"></label><label>Seizoen<input id="ss" value="${e(t.season)}"></label><label>Volgende tegenstander<input id="sop" value="${e(t.nextOpponent||'')}"></label><label>Wedstrijddatum<input id="sdate" type="date" value="${/^\d{4}-\d{2}-\d{2}$/.test(t.nextMatchDate||'')?e(t.nextMatchDate):''}"></label><label>Wedstrijddag<input id="sma" value="${e(t.matchday||'')}"></label><label>Selectiegrootte<input id="ssq" type="number" min="1" value="${t.squad||16}"></label><label>Minuten per training<input id="sdu" type="number" min="30" value="${t.duration||75}"></label><label>Trainingsdagen<input id="sda" value="${e(t.days||'')}"></label><label>Formatie met bal<input id="sfi" value="${e(t.fin||'')}" placeholder="Bijv. 3-2-5"></label><label>Formatie zonder bal<input id="sfo" value="${e(t.fout||'')}" placeholder="Bijv. 4-4-2"></label></div><div class="formation-note">Gebruik streepjes, bijvoorbeeld <b>4-3-3</b>. Ook <b>433</b> en <b>1-4-3-3</b> worden herkend.</div><details><summary>Meer teamcontext</summary><div class="form-grid"><label>Veldruimte<input id="sfield" value="${e(t.field||'')}"></label><label>Staf<input id="sstaff" value="${e(t.staff||'')}"></label><label class="span-2">Speelwijze<textarea id="sst">${e(t.style||'')}</textarea></label><label class="span-2">Coachprioriteiten<textarea id="spr">${e((t.prior||[]).join('\n'))}</textarea></label></div></details><div class="settings-actions"><button class="nm-primary" onclick="saveCoachSettings()">Alles opslaan</button><button class="nm-quiet danger-text" onclick="deleteTeam()">Team verwijderen</button></div></section>
        <section class="settings-card"><div class="settings-title"><div><span>Functies</span><h2>Privacy en hulpmiddelen</h2></div></div><label class="toggle-row"><input id="speech" type="checkbox" ${pf.speech?'checked':''}><span><b>Speech-to-text</b><small>Wedstrijdreflecties inspreken.</small></span></label><label class="toggle-row"><input id="tts" type="checkbox" ${pf.tts?'checked':''}><span><b>Text-to-speech</b><small>Briefings laten voorlezen.</small></span></label><label class="toggle-row"><input id="vc" type="checkbox" ${pf.videoConsent?'checked':''}><span><b>Videotoestemming vastgelegd</b><small>Nodig voordat video wordt geopend.</small></span></label><label>Bewaartermijn in maanden<input id="ret" type="number" min="1" value="${pf.retain||12}"></label><button class="nm-primary" onclick="pf.speech=document.getElementById('speech').checked;pf.tts=document.getElementById('tts').checked;pf.videoConsent=document.getElementById('vc').checked;pf.retain=+v('ret');save();nmNotice('Voorkeuren opgeslagen.');render()">Voorkeuren opslaan</button></section>
        <section class="settings-card danger-card"><div class="settings-title"><div><span>Gevarenzone</span><h2>Account en gegevens</h2></div></div><p>Uitloggen laat je gegevens intact. Verwijderen is permanent.</p><div class="settings-actions"><button class="nm-quiet" onclick="logout()">Uitloggen</button><button class="nm-danger" onclick="deleteAccount()">Account verwijderen</button></div></section>
      </div>`)
  };

  const previousOnboard=onboard;
  onboard=function(){previousOnboard();if(step===2)setTimeout(()=>{const split=document.querySelector('.wizard .split');if(!split)return;split.insertAdjacentHTML('afterend',`<div class="onboard-branding"><div><h3>Maak het herkenbaar</h3><p>Optioneel: voeg je clublogo en kleuren toe. Dit kan later altijd worden gewijzigd.</p></div><div class="onboard-brand-row"><div id="draft-logo-preview">${safeLogo(ws.data.draft?.logoDataUrl)?`<span class="club-mark xlarge"><img src="${e(ws.data.draft.logoDataUrl)}" alt="Logo"></span>`:`<span class="club-mark xlarge fallback">CLUB</span>`}</div><label class="nm-upload">Logo kiezen<input type="file" accept="image/*" onchange="uploadDraftLogo(this)"></label><label>Hoofdkleur<input id="draft-primary" type="color" value="${safeColor(ws.data.draft?.primaryColor,'#0b6b58')}"></label><label>Accent<input id="draft-secondary" type="color" value="${safeColor(ws.data.draft?.secondaryColor,'#d9f24f')}"></label></div></div>`);},0)};
  window.uploadDraftLogo=async function(input){const file=input.files?.[0];if(!file)return;try{ws.data.draft.logoDataUrl=await compressLogo(file);onboard()}catch{nmNotice('Logo kon niet worden verwerkt.','error')}};
  const previousCollect=collect;
  collect=function(){previousCollect();if(step===2){ws.data.draft.primaryColor=document.getElementById('draft-primary')?.value||ws.data.draft.primaryColor;ws.data.draft.secondaryColor=document.getElementById('draft-secondary')?.value||ws.data.draft.secondaryColor}};
  const previousNext=next;
  next=async function(){const finishing=step===5,draft=ws.data.draft;const result=await previousNext();if(finishing&&ws.data?.onboarded){Object.assign(ws.data.club,{logoDataUrl:draft.logoDataUrl||'',primaryColor:safeColor(draft.primaryColor,'#0b6b58'),secondaryColor:safeColor(draft.secondaryColor,'#d9f24f')});await sb.from('coach_workspaces').upsert({user_id:user.id,data:ws.data});render()}return result};

  document.documentElement.dataset.nextmatchVersion=VERSION;
})();