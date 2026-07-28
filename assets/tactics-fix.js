window.nextMatchTacticalPhase=window.nextMatchTacticalPhase||'in';
function formationDetails(raw){
 const original=String(raw||'').trim();
 if(!original)return{valid:false,original,lines:[],normalized:'',error:'Vul een formatie in, bijvoorbeeld 4-3-3.'};
 const compact=original.replace(/\s+/g,'');
 let values=/^\d{3,5}$/.test(compact)?compact.split('').map(Number):(original.match(/\d+/g)||[]).map(Number);
 const total=values.reduce((a,b)=>a+b,0);
 if(values.length>=3&&values[0]===1&&total===11)values.shift();
 const sum=values.reduce((a,b)=>a+b,0);
 if(values.length<2||values.length>5)return{valid:false,original,lines:values,normalized:values.join('-'),error:'Gebruik 2 tot 5 linies, bijvoorbeeld 4-2-3-1.'};
 if(values.some(x=>x<1||x>5))return{valid:false,original,lines:values,normalized:values.join('-'),error:'Elke linie moet 1 tot en met 5 spelers bevatten.'};
 if(sum!==10)return{valid:false,original,lines:values,normalized:values.join('-'),error:`De veldspelers tellen op tot ${sum}. Zonder keeper moet de formatie optellen tot 10.`};
 return{valid:true,original,lines:values,normalized:values.join('-'),error:''};
}
function parseFormation(raw){return formationDetails(raw).lines}
function spread(count){return({1:[50],2:[34,66],3:[18,50,82],4:[10,36,64,90],5:[7,28,50,72,93]})[count]||[]}
function labelsFor(lineIndex,total,count){
 const defence={1:['CV'],2:['LCV','RCV'],3:['LCV','CV','RCV'],4:['LV','LCV','RCV','RV'],5:['LWB','LCV','CV','RCV','RWB']};
 const attack={1:['SP'],2:['LSP','RSP'],3:['LA','SP','RA'],4:['LA','LSP','RSP','RA'],5:['LA','LAM','SP','RAM','RA']};
 const central={1:['CM'],2:['LCM','RCM'],3:['LCM','CM','RCM'],4:['LM','LCM','RCM','RM'],5:['LM','LCM','CM','RCM','RM']};
 const defensive={1:['VM'],2:['LVM','RVM'],3:['LVM','VM','RVM'],4:['LM','LVM','RVM','RM'],5:['LWB','LVM','VM','RVM','RWB']};
 const attacking={1:['AM'],2:['LAM','RAM'],3:['LAM','AM','RAM'],4:['LM','LAM','RAM','RM'],5:['LA','LAM','AM','RAM','RA']};
 if(lineIndex===0)return defence[count]||[];
 if(lineIndex===total-1)return attack[count]||[];
 if(total>=4&&lineIndex===1)return defensive[count]||central[count]||[];
 if(total>=4&&lineIndex===total-2)return attacking[count]||central[count]||[];
 return central[count]||[];
}
function formationPlayers(raw){
 const parsed=formationDetails(raw);if(!parsed.valid)return'';
 const total=parsed.lines.length,parts=['<span class="pl" data-line="goalkeeper" title="Keeper" style="left:50%;top:93%">K</span>'];
 parsed.lines.forEach((count,lineIndex)=>{const top=total===1?50:78-lineIndex*(61/(total-1)),labels=labelsFor(lineIndex,total,count);spread(count).forEach((left,i)=>{const type=lineIndex===0?'defence':lineIndex===total-1?'attack':'midfield',label=labels[i]||`${type==='defence'?'V':type==='attack'?'A':'M'}${i+1}`;parts.push(`<span class="pl" data-line="${type}" title="${label}" style="left:${left}%;top:${top}%">${label}</span>`)})});
 return parts.join('');
}
window.setTacticalPhase=function(phase){window.nextMatchTacticalPhase=phase;render()};
window.players=function(){const t=team(),phase=window.nextMatchTacticalPhase;return formationPlayers(phase==='out'?t.fout:t.fin)};
window.tactics=function(){
 const t=team(),phase=window.nextMatchTacticalPhase||'in',raw=phase==='out'?t.fout:t.fin,parsed=formationDetails(raw),phaseName=phase==='out'?'Zonder bal':'In balbezit';
 const intention=phase==='in'?e(t.style||'Leg vast hoe je ruimte creëert, bezet en benut.'):'Leg vast hoe je richting geeft, compact blijft, druk zet, rugdekking organiseert en herstelt.';
 const field=parsed.valid?`<div class="formation-caption"><span><b>${phaseName}</b> · ingevoerd: ${e(parsed.original)}</span><span class="formation-ok">${parsed.normalized}</span></div><div class="tactics-stage"><div class="pitch">${formationPlayers(raw)}<span class="pitch-direction">AANVALSRICHTING ↑</span></div></div><div class="position-legend"><span><i class="legend-k"></i>Keeper</span><span><i class="legend-v"></i>Verdediging</span><span><i class="legend-m"></i>Middenveld</span><span><i class="legend-a"></i>Aanval</span></div>`:`<div class="formation-error"><b>Formatie kan niet worden getekend</b><p>${e(parsed.error)}</p><p>Gebruik bijvoorbeeld 4-3-3, 4-2-3-1 of 4-1-2-1-2. Ook 442 en 1-4-4-2 worden herkend.</p><button class="btn primary" onclick="go('settings')">Formatie corrigeren</button></div>`;
 return shell(`<div class="grid g2"><div>${p('Eigen organisatie',`<div class="phase-switch"><button class="${phase==='in'?'on':''}" onclick="setTacticalPhase('in')">In balbezit</button><button class="${phase==='out'?'on':''}" onclick="setTacticalPhase('out')">Zonder bal</button></div>${field}`)}</div><div>${p('Wat deze organisatie moet oplossen',`<h2>${e(parsed.valid?parsed.normalized:'Formatie corrigeren')}</h2><p>${intention}</p>`)}${p('Tactische toets','1. Welke informatie start de actie?<br>2. Wie stemt met wie af?<br>3. Welke ruimte moet bezet of beschermd zijn?<br>4. Wat is zichtbaar wanneer het lukt?')}${p('Invoerformaat',`<p>Gebruik bij voorkeur streepjes: <b>4-3-3</b>, <b>4-2-3-1</b> of <b>4-1-2-1-2</b>. De keeper mag worden weggelaten of als eerste 1 worden ingevoerd.</p><button class="btn" onclick="go('settings')">Open teaminstellingen</button>`)}</div></div>`)
};