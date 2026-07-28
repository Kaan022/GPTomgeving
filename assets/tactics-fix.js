window.nextMatchTacticalPhase=window.nextMatchTacticalPhase||'in';
function parseFormation(raw){
  const values=String(raw||'').match(/\d+/g)?.map(Number)||[];
  if(values.length&&values[0]===1&&values.reduce((a,b)=>a+b,0)===11)values.shift();
  if(values.reduce((a,b)=>a+b,0)!==10||values.some(x=>x<1||x>5))return [4,3,3];
  return values;
}
function spread(count){
  const presets={1:[50],2:[36,64],3:[20,50,80],4:[12,37,63,88],5:[8,29,50,71,92]};
  return presets[count]||Array.from({length:count},(_,i)=>10+(80*i/(count-1||1)));
}
function labelsFor(lineIndex,total,count){
  const defence={1:['CV'],2:['LCV','RCV'],3:['LCV','CV','RCV'],4:['LB','LCV','RCV','RB'],5:['LWB','LCV','CV','RCV','RWB']};
  const attack={1:['SP'],2:['SP-L','SP-R'],3:['LA','SP','RA'],4:['LA','10','SP','RA'],5:['LA','10L','SP','10R','RA']};
  const lower={1:['6'],2:['6','8'],3:['6','8','10'],4:['LM','6','8','RM'],5:['LM','6','10','8','RM']};
  const upper={1:['10'],2:['10L','10R'],3:['LA','10','RA'],4:['LA','10L','10R','RA'],5:['LA','10L','10','10R','RA']};
  if(lineIndex===0)return defence[count]||spread(count).map((_,i)=>`D${i+1}`);
  if(lineIndex===total-1)return attack[count]||spread(count).map((_,i)=>`A${i+1}`);
  return (lineIndex>=Math.ceil(total/2)?upper:lower)[count]||spread(count).map((_,i)=>`M${i+1}`);
}
function formationPlayers(raw){
  const formation=parseFormation(raw),total=formation.length,parts=[];
  parts.push(`<span class="pl" data-line="goalkeeper" title="Doelman" style="left:50%;top:94%">GK</span>`);
  formation.forEach((count,lineIndex)=>{
    const top=total===1?48:78-(lineIndex*(62/(total-1)));
    const labels=labelsFor(lineIndex,total,count);
    spread(count).forEach((left,i)=>{
      const type=lineIndex===0?'defence':lineIndex===total-1?'attack':'midfield';
      parts.push(`<span class="pl" data-line="${type}" title="${labels[i]}" style="left:${left}%;top:${top}%">${labels[i]}</span>`);
    });
  });
  return parts.join('');
}
window.setTacticalPhase=function(phase){window.nextMatchTacticalPhase=phase;render()};
window.players=function(){
  const t=team(),phase=window.nextMatchTacticalPhase;
  return formationPlayers(phase==='out'?t.fout:t.fin);
};
window.tactics=function(){
  const t=team(),phase=window.nextMatchTacticalPhase,raw=phase==='out'?t.fout:t.fin;
  const formation=parseFormation(raw).join('-');
  const phaseName=phase==='out'?'Zonder bal':'In balbezit';
  return shell(`<div class="grid g2"><div>${p('Eigen organisatie',`<div class="phase-switch"><button class="${phase==='in'?'on':''}" onclick="setTacticalPhase('in')">In balbezit</button><button class="${phase==='out'?'on':''}" onclick="setTacticalPhase('out')">Zonder bal</button></div><div class="formation-caption"><span><b>${phaseName}</b> · ${e(raw||'Formatie nog niet ingesteld')}</span><span>${formation}</span></div><div class="tactics-stage"><div class="pitch">${players()}<span class="pitch-direction">AANVALSRICHTING ↑</span></div></div>`)} </div><div>${p('Wat deze organisatie moet oplossen',`<h2>${e(raw||'Stel eerst een formatie in')}</h2><p>${phase==='in'?e(t.style||'Leg vast hoe je ruimte creëert, bezet en benut.'):'Leg vast hoe je richting geeft, compact blijft, druk zet, rugdekking organiseert en herstelt.'}</p>`)}${p('Tactische toets','1. Welke informatie start de actie?<br>2. Wie stemt met wie af?<br>3. Welke ruimte moet bezet of beschermd zijn?<br>4. Wat is zichtbaar wanneer het lukt?')}${p('Formatie aanpassen',`<p class="mut">De opstelling komt automatisch uit je teaminstellingen.</p><button class="btn" onclick="go('settings')">Open teaminstellingen</button>`)}</div></div>`);
};
