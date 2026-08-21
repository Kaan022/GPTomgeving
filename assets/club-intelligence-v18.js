(()=>{
  'use strict';
  const baseShell=window.shell;
  const L=(nl,en)=>(window.nextMatchLanguage?.()||ws?.data?.prefs?.language||'nl')==='en'?en:nl;
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const clean=value=>String(value||'').trim();
  const lines=value=>String(value||'').split(/\n|;/).map(x=>x.trim()).filter(Boolean);
  const today=()=>new Date();
  const pad=n=>String(n).padStart(2,'0');
  const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const monday=input=>{const d=new Date(input);d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d};
  const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
  const weekKey=d=>iso(monday(d));
  const dateLabel=value=>{if(!value)return'—';const d=typeof value==='string'?new Date(`${value}T12:00:00`):new Date(value);return Number.isNaN(d.getTime())?String(value):new Intl.DateTimeFormat(L('nl-NL','en-GB'),{weekday:'short',day:'numeric',month:'short'}).format(d)};
  const currentClub=()=>ws?.data?.club||{};
  const teams=()=>Array.isArray(ws?.data?.teams)?ws.data.teams:[];
  const getTeam=id=>teams().find(t=>t.id===id);
  const initials=value=>String(value||'NM').split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  const clubLogo=()=>{const c=currentClub(),src=String(c.logoDataUrl||'');return src.startsWith('data:image/')?`<img src="${esc(src)}" alt="${L('Clublogo','Club logo')}">`:`<span>${esc(initials(c.name||'Club'))}</span>`};

  function store(){
    ws.data.clubIntelligence||={
      philosophy:'',
      gameModel:'',
      principles:[],
      methodology:'',
      standards:{review24h:true,weekPlan:true,themePair:true,sessionReady:true,staffPdf:false},
      documents:[],
      integrations:{sportlink:{status:'not_connected',lastImport:null,mode:'manual'}},
      brief:null
    };
    const s=ws.data.clubIntelligence;
    s.principles=Array.isArray(s.principles)?s.principles:[];
    s.documents=Array.isArray(s.documents)?s.documents:[];
    s.standards=s.standards||{};
    s.integrations=s.integrations||{sportlink:{status:'not_connected',lastImport:null,mode:'manual'}};
    return s;
  }

  function normalise(text){return String(text||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9+ ]/g,' ')}
  function words(text){return new Set(normalise(text).split(/\s+/).filter(x=>x.length>3))}
  function overlap(a,b){const A=words(a),B=words(b);if(!A.size||!B.size)return 0;let hits=0;A.forEach(x=>{if(B.has(x))hits++});return hits/Math.max(1,Math.min(A.size,B.size))}
  function weekPlan(t){return ws.data.smartPeriodisation?.[t.id]?.weeks?.[weekKey(today())]||null}
  function review(t){return ws.data.matchReviews?.[t.id]||null}
  function activePeriod(t){const p=ws.data.periodisation?.[t.id];return p?.cycles?.[p.activeCycle]||null}
  function session(t){return ws.data.sessionPlans?.[t.id]||null}
  function principleText(t){return [...(t.principles||[]),t.style||'',activePeriod(t)?.focus||''].join(' ')}
  function clubText(){const s=store();return [s.gameModel,s.philosophy,s.methodology,...s.principles].join(' ')}
  function alignment(t){
    const s=store(),teamText=principleText(t),base=clubText();
    if(!clean(base))return 65;
    const semantic=Math.round(overlap(base,teamText)*55);
    const principleHits=s.principles.filter(p=>overlap(p,teamText)>.18).length;
    const principleScore=s.principles.length?Math.round((principleHits/s.principles.length)*30):20;
    const planning=weekPlan(t)?10:0;
    const reviewScore=review(t)?.debrief||review(t)?.facts?5:0;
    return Math.min(100,Math.max(15,semantic+principleScore+planning+reviewScore));
  }
  function readiness(t){
    let score=0;
    if(review(t)?.debrief||review(t)?.facts)score+=25;
    const p=weekPlan(t);if(p)score+=25;if(p?.theme&&p?.counterTheme)score+=15;
    const s=session(t);if(s?.blocks?.length)score+=25;if(s?.blocks?.some(b=>(b.drawingObjects||[]).length||b.drawingDataUrl))score+=10;
    return Math.min(100,score);
  }
  function signalFor(t){
    const a=alignment(t),r=readiness(t),p=weekPlan(t),rv=review(t);
    if(!rv?.debrief&&!rv?.facts)return{level:'high',text:L('Nog geen recente wedstrijdreflectie','No recent match review')};
    if(!p)return{level:'high',text:L('Geen weekplan voor deze week','No weekly plan for this week')};
    if(a<50)return{level:'medium',text:L('Teamplan wijkt sterk af van clubprincipes','Team plan deviates from club principles')};
    if(r<65)return{level:'medium',text:L('Trainingsweek is nog niet uitvoeringsgereed','Training week is not execution-ready')};
    return{level:'good',text:L('Op koers','On track')};
  }
  function teamMetrics(){return teams().map(t=>({t,alignment:alignment(t),readiness:readiness(t),plan:weekPlan(t),review:review(t),signal:signalFor(t)}))}
  function avg(items,key){return items.length?Math.round(items.reduce((sum,x)=>sum+x[key],0)/items.length):0}

  if(typeof baseShell==='function')window.shell=function(body){
    let html=baseShell(body);
    if(!html.includes("go('club')")){
      const label=L('Club','Club');
      const button=`<button class="${route==='club'?'on':''}" onclick="go('club')"><i>◫</i><span>${label}</span></button>`;
      html=html.replace('<nav class="v12-nav">',`<nav class="v12-nav">${button}`);
    }
    return html;
  };

  window.saveClubFramework=function(){
    const s=store();
    s.philosophy=document.getElementById('ci-philosophy')?.value.trim()||'';
    s.gameModel=document.getElementById('ci-game-model')?.value.trim()||'';
    s.methodology=document.getElementById('ci-methodology')?.value.trim()||'';
    s.principles=lines(document.getElementById('ci-principles')?.value||'').slice(0,12);
    save();notify(L('Clubkader opgeslagen.','Club framework saved.'));render();
  };

  window.propagateClubPrinciples=function(){
    const s=store();
    if(!s.principles.length){notify(L('Voeg eerst clubprincipes toe.','Add club principles first.'),'error');return}
    teams().forEach(t=>{t.principles=Array.from(new Set([...(t.principles||[]),...s.principles]))});
    save();notify(L('Clubprincipes zijn toegevoegd aan alle teams zonder teamspecifieke principes te verwijderen.','Club principles were added to all teams without removing team-specific principles.'));render();
  };

  window.openClubTeam=function(id,target='periodisation'){
    if(!getTeam(id))return;
    ws.data.activeTeam=id;save();go(target);
  };

  function buildBrief(){
    const items=teamMetrics(),risks=items.filter(x=>x.signal.level!=='good').sort((a,b)=>a.readiness-b.readiness);
    const top=risks.slice(0,4).map(x=>`${x.t.name}: ${x.signal.text}. ${L('Alignment','Alignment')} ${x.alignment}%, ${L('gereed','ready')} ${x.readiness}%.`);
    const strongest=[...items].sort((a,b)=>b.alignment-a.alignment)[0];
    const s=store();
    s.brief={createdAt:new Date().toISOString(),summary:top.length?top.join('\n'):L('Alle teams zijn deze week op koers.','All teams are on track this week.'),strongest:strongest?.t?.name||'',teamCount:items.length};
    save();return s.brief;
  }
  window.generateClubBrief=function(){buildBrief();notify(L('Nieuwe technische clubbrief gemaakt.','New technical club brief created.'));render()};

  async function extractFile(file){
    const name=file.name.toLowerCase();
    if(name.endsWith('.txt')||name.endsWith('.md')||name.endsWith('.csv')||name.endsWith('.json'))return await file.text();
    if(name.endsWith('.docx')&&window.mammoth){const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});return result.value||''}
    if(name.endsWith('.pdf')&&window.pdfjsLib){const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;let text='';for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i),content=await page.getTextContent();text+=content.items.map(x=>x.str).join(' ')+'\n'}return text}
    throw new Error(L('Dit bestandstype wordt nog niet ondersteund.','This file type is not supported yet.'));
  }
  window.importClubDocument=async function(input){
    const file=input?.files?.[0];if(!file)return;
    try{
      const text=(await extractFile(file)).slice(0,80000);
      const s=store();s.documents.unshift({id:crypto.randomUUID(),name:file.name,type:file.type||file.name.split('.').pop(),addedAt:new Date().toISOString(),text});s.documents=s.documents.slice(0,20);
      save();notify(L('Clubdocument verwerkt en beschikbaar als technische context.','Club document processed and available as technical context.'));render();
    }catch(error){notify(error.message||String(error),'error')}
  };
  window.removeClubDocument=function(id){const s=store();s.documents=s.documents.filter(d=>d.id!==id);save();render()};

  function parseDelimited(text){
    const rows=String(text||'').trim().split(/\r?\n/).filter(Boolean);if(rows.length<2)return[];
    const sep=rows[0].includes(';')?';':',';const headers=rows[0].split(sep).map(x=>normalise(x.trim()).replace(/ /g,'_'));
    return rows.slice(1).map(row=>{const vals=row.split(sep);return Object.fromEntries(headers.map((h,i)=>[h,(vals[i]||'').trim()]))});
  }
  window.importSportlinkExport=async function(input){
    const file=input?.files?.[0];if(!file)return;
    try{
      const text=await file.text();let rows=[];
      if(file.name.toLowerCase().endsWith('.json')){const parsed=JSON.parse(text);rows=Array.isArray(parsed)?parsed:(parsed.teams||parsed.rows||[])}else rows=parseDelimited(text);
      let updated=0,created=0;
      rows.forEach(row=>{
        const name=clean(row.team||row.teamnaam||row.naam||row.name);if(!name)return;
        let t=teams().find(x=>normalise(x.name)===normalise(name));
        if(!t){t={id:crypto.randomUUID(),name,category:row.categorie||row.category||'',level:row.niveau||row.level||'',season:row.seizoen||row.season||'',squad:Number(row.selectie||row.squad)||16,days:'',duration:75,matchday:'Zaterdag',field:'',staff:'',fin:'',fout:'',style:'',prior:[],principles:[]};ws.data.teams.push(t);created++}else updated++;
        t.nextOpponent=row.tegenstander||row.opponent||t.nextOpponent||'';
        t.nextMatchDate=row.datum||row.date||t.nextMatchDate||'';
        t.staff=row.trainer||row.coach||t.staff||'';
      });
      const s=store();s.integrations.sportlink={status:'manual_import',lastImport:new Date().toISOString(),mode:'manual',rows:rows.length};
      save();notify(`${L('Import voltooid','Import completed')}: ${created} ${L('teams toegevoegd','teams added')}, ${updated} ${L('bijgewerkt','updated')}.`);render();
    }catch(error){notify(L('Import mislukt: ','Import failed: ')+(error.message||error),'error')}
  };

  function kpi(label,value,sub,kind=''){return`<div class="ci-kpi ${kind}"><span>${esc(label)}</span><b>${esc(value)}</b><small>${esc(sub)}</small></div>`}
  function teamRow(x){
    const t=x.t,theme=x.plan?.theme?.titleNl||x.plan?.theme?.titleEn||x.plan?.theme?.title||x.plan?.sessions?.[0]?.focus||activePeriod(t)?.focus||'—';
    const counter=x.plan?.counterTheme?.titleNl||x.plan?.counterTheme?.titleEn||x.plan?.counterTheme?.title||'—';
    return`<tr><td><button class="ci-team-link" onclick="openClubTeam('${t.id}','periodisation')"><b>${esc(t.name)}</b><small>${esc(t.category||'')} ${t.level?'· '+esc(t.level):''}</small></button></td><td>${esc(t.staff||L('Niet ingevuld','Not entered'))}</td><td><div class="ci-focus"><b>${esc(theme)}</b><small>${esc(counter)}</small></div></td><td><div class="ci-score"><span style="--score:${x.alignment}%"></span><b>${x.alignment}%</b></div></td><td><div class="ci-score"><span style="--score:${x.readiness}%"></span><b>${x.readiness}%</b></div></td><td><span class="ci-status ${x.signal.level}">${esc(x.signal.text)}</span></td><td><button class="v12-btn" onclick="openClubTeam('${t.id}','debrief')">${L('Open','Open')}</button></td></tr>`
  }

  function calendar(items){
    const start=monday(today());
    return`<div class="ci-week">${Array.from({length:7},(_,i)=>{const d=addDays(start,i),ds=iso(d);let cards=[];items.forEach(x=>{const p=x.plan;if(p?.sessions)cards.push(...p.sessions.filter(s=>s.date===ds).map(s=>`<button onclick="openClubTeam('${x.t.id}','periodisation')"><b>${esc(x.t.name)}</b><span>${esc(s.start)} · ${esc(s.title)}</span></button>`));const rv=x.review;if(rv?.date===ds)cards.push(`<button class="match" onclick="openClubTeam('${x.t.id}','debrief')"><b>${esc(x.t.name)}</b><span>${esc(rv.opponent||L('Wedstrijd','Match'))}</span></button>`)});return`<article class="ci-day ${iso(today())===ds?'today':''}"><header><span>${dateLabel(d)}</span></header>${cards.length?cards.join(''):`<em>${L('Geen activiteit','No activity')}</em>`}</article>`}).join('')}</div>`
  }

  window.clubIntelligence=function(){
    const s=store(),items=teamMetrics(),avgAlign=avg(items,'alignment'),avgReady=avg(items,'readiness'),planned=items.filter(x=>x.plan).length,reviewed=items.filter(x=>x.review?.debrief||x.review?.facts).length,signals=items.filter(x=>x.signal.level!=='good').sort((a,b)=>a.readiness-b.readiness),brief=s.brief;
    const docs=s.documents.map(d=>`<div class="ci-doc"><div><b>${esc(d.name)}</b><small>${dateLabel(d.addedAt.slice(0,10))} · ${Math.round((d.text||'').length/1000)}k ${L('tekens','chars')}</small></div><button onclick="removeClubDocument('${d.id}')">×</button></div>`).join('');
    const signalHtml=signals.length?signals.slice(0,6).map((x,i)=>`<button class="ci-signal ${x.signal.level}" onclick="openClubTeam('${x.t.id}','periodisation')"><strong>${i+1}</strong><span><b>${esc(x.t.name)}</b><small>${esc(x.signal.text)}</small></span><em>›</em></button>`).join(''):`<div class="ci-empty"><b>${L('Geen urgente signalen','No urgent signals')}</b><p>${L('Alle teams hebben een bruikbaar plan voor deze week.','All teams have a usable plan for this week.')}</p></div>`;
    const sport=s.integrations.sportlink||{};
    return shell(`<section class="v12-page-head ci-head"><div class="ci-title"><div class="ci-club-logo">${clubLogo()}</div><div><span class="v12-eyebrow">${L('Technische staf · Club Intelligence','Technical staff · Club Intelligence')}</span><h1>${esc(currentClub().name||L('Jouw club','Your club'))}</h1><p>${L('Van clubvisie naar aantoonbaar teamgedrag. Eén cockpit voor beleid, trainers, weekplannen en interventies.','From club vision to observable team behaviour. One cockpit for policy, coaches, weekly plans and interventions.')}</p></div></div><div class="v12-actions"><button class="v12-btn" onclick="generateClubBrief()">${L('AI-clubbrief','AI club brief')}</button><button class="v12-btn primary" onclick="propagateClubPrinciples()">${L('Principes naar teams','Push principles to teams')}</button></div></section><div class="ci-kpis">${kpi(L('Teams','Teams'),items.length,L('in deze workspace','in this workspace'))}${kpi(L('Clubalignment','Club alignment'),`${avgAlign}%`,L('visie ↔ teamplannen','vision ↔ team plans'),avgAlign<55?'warn':'')}${kpi(L('Uitvoeringsgereed','Execution ready'),`${avgReady}%`,L('review → weekplan → training','review → week plan → session'),avgReady<60?'warn':'')}${kpi(L('Weekplannen','Weekly plans'),`${planned}/${items.length}`,L('deze week','this week'))}${kpi(L('Wedstrijdreviews','Match reviews'),`${reviewed}/${items.length}`,L('beschikbaar','available'))}</div><div class="ci-grid top"><section class="v12-panel"><div class="v12-panel-head"><div><h2>${L('Technische actielijst','Technical action board')}</h2><span>${L('Waar moet de staf nu ingrijpen?','Where should the staff intervene now?')}</span></div></div><div class="v12-panel-body">${signalHtml}</div></section><section class="v12-panel"><div class="v12-panel-head"><div><h2>${L('AI-clubbrief','AI club brief')}</h2><span>${brief?dateLabel(brief.createdAt.slice(0,10)):L('Nog niet gegenereerd','Not generated yet')}</span></div><button class="v12-btn" onclick="generateClubBrief()">${L('Vernieuw','Refresh')}</button></div><div class="v12-panel-body">${brief?`<div class="ci-brief"><p>${esc(brief.summary).replace(/\n/g,'<br>')}</p>${brief.strongest?`<small>${L('Sterkste alignment','Strongest alignment')}: <b>${esc(brief.strongest)}</b></small>`:''}</div>`:`<div class="ci-empty"><b>${L('Maak de technische weekbrief','Create the technical weekly brief')}</b><p>${L('NextMatch vat automatisch de teams samen die aandacht nodig hebben.','NextMatch automatically summarises the teams that need attention.')}</p></div>`}</div></section></div><section class="v12-panel ci-matrix"><div class="v12-panel-head"><div><h2>${L('Teamportfolio','Team portfolio')}</h2><span>${L('Clubprincipes, weekfocus en uitvoeringsstatus per team','Club principles, weekly focus and execution status per team')}</span></div></div><div class="v12-panel-body"><div class="ci-table-wrap"><table><thead><tr><th>${L('Team','Team')}</th><th>${L('Trainer','Coach')}</th><th>${L('Deze week','This week')}</th><th>${L('Alignment','Alignment')}</th><th>${L('Gereed','Ready')}</th><th>${L('Signaal','Signal')}</th><th></th></tr></thead><tbody>${items.map(teamRow).join('')}</tbody></table></div></div></section><section class="v12-panel" style="margin-top:14px"><div class="v12-panel-head"><div><h2>${L('Clubkalender · deze week','Club calendar · this week')}</h2><span>${L('Alle gegenereerde trainingen en bekende wedstrijden','All generated sessions and known matches')}</span></div></div><div class="v12-panel-body">${calendar(items)}</div></section><div class="ci-grid bottom"><section class="v12-panel"><div class="v12-panel-head"><div><h2>${L('Technisch clubkader','Technical club framework')}</h2><span>${L('De vaste intelligentielaag boven alle teams','The persistent intelligence layer above every team')}</span></div><button class="v12-btn primary" onclick="saveClubFramework()">${L('Opslaan','Save')}</button></div><div class="v12-panel-body v12-form"><label>${L('Opleidings- en voetbalvisie','Development and football philosophy')}<textarea id="ci-philosophy" rows="4">${esc(s.philosophy)}</textarea></label><label>${L('Clubspelmodel','Club game model')}<textarea id="ci-game-model" rows="4">${esc(s.gameModel)}</textarea></label><label>${L('Clubprincipes · één per regel','Club principles · one per line')}<textarea id="ci-principles" rows="7">${esc(s.principles.join('\n'))}</textarea></label><label>${L('Trainingsmethodiek','Training methodology')}<textarea id="ci-methodology" rows="4">${esc(s.methodology)}</textarea></label></div></section><aside class="ci-stack"><section class="v12-panel"><div class="v12-panel-head"><div><h2>${L('Clubdocumenten','Club documents')}</h2><span>${L('Voed de AI met technisch beleid en methodiek','Feed the AI with technical policy and methodology')}</span></div></div><div class="v12-panel-body"><label class="ci-upload"><input type="file" accept=".pdf,.docx,.txt,.md,.csv,.json" onchange="importClubDocument(this)"><b>＋ ${L('Document uploaden','Upload document')}</b><small>PDF · DOCX · TXT · MD · CSV · JSON</small></label><div class="ci-docs">${docs||`<div class="ci-empty small"><p>${L('Nog geen clubdocumenten.','No club documents yet.')}</p></div>`}</div></div></section><section class="v12-panel"><div class="v12-panel-head"><div><h2>${L('Integratiehub','Integration hub')}</h2><span>${L('Brondata erin, coachbesluiten eruit','Source data in, coaching decisions out')}</span></div></div><div class="v12-panel-body"><div class="ci-integration"><div class="ci-integration-logo">S</div><div><b>Sportlink</b><small>${sport.status==='manual_import'?`${L('Laatste handmatige import','Last manual import')}: ${dateLabel(sport.lastImport?.slice(0,10))}`:L('Nog niet officieel gekoppeld','Not officially connected yet')}</small></div><span class="ci-status ${sport.status==='manual_import'?'good':'medium'}">${sport.status==='manual_import'?L('Import actief','Import active'):L('Niet gekoppeld','Not connected')}</span></div><label class="ci-upload compact"><input type="file" accept=".csv,.json" onchange="importSportlinkExport(this)"><b>${L('Sportlink-export importeren','Import Sportlink export')}</b><small>${L('CSV/JSON als veilige tussenstap; officiële Club.Dataservice later server-side.','CSV/JSON as a safe interim step; official Club.Dataservice later server-side.')}</small></label></div></section></aside></div>`)
  };
})();