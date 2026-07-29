const seed = [
  {
    id: 'ATP-2026-001', systemName: 'Recruitment Copilot', vendor: 'TalentFlow',
    useCase: 'CV’s samenvatten en kandidaten rangschikken voor recruiter-review.',
    department: 'HR', owner: 'Head of Talent', risk: 'High-risk kandidaat', score: 74,
    decision: 'Voorwaardelijk',
    actions: ['Leg menselijke eindbeslissing formeel vast', 'Vraag onafhankelijke bias-test op', 'Bevestig bewaartermijn kandidaatdata'],
    evidence: 7, totalEvidence: 12, created: '2026-07-29'
  },
  {
    id: 'ATP-2026-002', systemName: 'Marketing Content Assistant', vendor: 'WriteSpark',
    useCase: 'Conceptteksten voor blogs en social posts, altijd gereviewd door een medewerker.',
    department: 'Marketing', owner: 'Marketing Lead', risk: 'Transparantie', score: 62,
    decision: 'Goedgekeurd met controls',
    actions: ['Label relevante AI-content waar vereist', 'Leg publicatiereview vast'],
    evidence: 5, totalEvidence: 12, created: '2026-07-28'
  }
];

function loadRecords() {
  try { return JSON.parse(localStorage.getItem('atp_records') || 'null'); } catch (_) { return null; }
}
let records = loadRecords() || seed;
let currentStep = 0;
let selected = records[0];
let toastTimer;

const titles = {
  dashboard: ['Dashboard', 'Stuur op risico, bewijs en actie.'],
  register: ['AI-register', 'Eén inventaris van AI-systemen, use-cases en eigenaarschap.'],
  assessment: ['Nieuw assessment', 'Bouw een verdedigbaar dossier in vijf stappen.'],
  passport: ['Trust Passport', 'Deelbare samenvatting voor stakeholders en leverancier.'],
  evidence: ['Evidence room', 'Zie direct welke bewijsstukken ontbreken.']
};

function save() {
  try { localStorage.setItem('atp_records', JSON.stringify(records)); } catch (_) { /* private preview mode */ }
}

function showToast(title, text) {
  const toast = document.querySelector('#toast');
  if (!toast) return;
  document.querySelector('#toastTitle').textContent = title;
  document.querySelector('#toastText').textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function toggleSidebar(force) {
  const sidebar = document.querySelector('#sidebar');
  const overlay = document.querySelector('#mobileOverlay');
  if (!sidebar || !overlay) return;
  const open = typeof force === 'boolean' ? force : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
}
window.toggleSidebar = toggleSidebar;

function showView(id) {
  if (!titles[id]) id = 'dashboard';
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelector('#' + id)?.classList.add('active');
  document.querySelectorAll('.side-nav button').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  document.querySelector('#viewTitle').textContent = titles[id][0];
  document.querySelector('#viewSubtitle').textContent = titles[id][1];
  document.querySelector('#breadcrumbCurrent').textContent = titles[id][0];
  if (id === 'passport') renderPassport();
  if (id === 'evidence') renderEvidence();
  location.hash = id;
  toggleSidebar(false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.showView = showView;
document.querySelectorAll('.side-nav button').forEach(b => b.onclick = () => showView(b.dataset.view));

function statusClass(decision) {
  const value = String(decision || '').toLowerCase();
  if (value.includes('stop') || value.includes('niet gereed') || value.includes('verboden')) return 'status-bad';
  if (value.includes('voorwaardelijk') || value.includes('review')) return 'status-warn';
  return 'status-good';
}

function esc(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function averageScore() {
  return records.length ? Math.round(records.reduce((sum, record) => sum + Number(record.score || 0), 0) / records.length) : 0;
}

function renderRegisterRows(rows = records) {
  const target = document.querySelector('#registerRows');
  if (!target) return;
  if (!rows.length) {
    target.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:42px;color:#718090">Geen systemen gevonden.</td></tr>';
    return;
  }
  target.innerHTML = rows.map(record => `
    <tr onclick="selectRecord('${record.id}')">
      <td>${esc(record.id)}</td>
      <td><b>${esc(record.systemName)}</b></td>
      <td>${esc(record.vendor)}</td>
      <td title="${esc(record.useCase)}">${esc(record.useCase.slice(0, 42))}${record.useCase.length > 42 ? '…' : ''}</td>
      <td>${esc(record.owner)}</td>
      <td>${esc(record.risk)}</td>
      <td><b>${record.score}</b>/100</td>
      <td><span class="status ${statusClass(record.decision)}">${esc(record.decision)}</span></td>
    </tr>`).join('');
}

function render() {
  const avg = averageScore();
  const totalActions = records.reduce((sum, record) => sum + record.actions.length, 0);
  const highRisk = records.filter(record => record.risk.includes('High-risk')).length;
  const transparency = records.filter(record => record.risk.includes('Transparantie')).length;
  const lowRisk = records.filter(record => record.risk.includes('Beperkt')).length;

  const values = {
    metricTotal: records.length,
    metricActions: totalActions,
    metricScore: avg,
    metricHigh: highRisk,
    heroTrustScore: avg,
    coverageScore: `${avg}%`,
    donutTotal: records.length,
    riskHighCount: highRisk,
    riskTransparencyCount: transparency,
    riskLowCount: lowRisk,
    navSystemCount: records.length,
    registerCount: `${records.length} record${records.length === 1 ? '' : 's'}`
  };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.querySelector('#' + id);
    if (element) element.textContent = value;
  });

  const trustRing = document.querySelector('#trustRing');
  if (trustRing) trustRing.style.setProperty('--score', avg);
  const portfolioBar = document.querySelector('#portfolioBar');
  if (portfolioBar) portfolioBar.style.width = `${avg}%`;

  const recent = document.querySelector('#recentRows');
  if (recent) {
    recent.innerHTML = records.slice().reverse().slice(0, 5).map(record => `
      <tr onclick="selectRecord('${record.id}')" style="cursor:pointer">
        <td><b>${esc(record.systemName)}</b><br><small>${esc(record.vendor)}</small></td>
        <td>${esc(record.department)}</td>
        <td>${esc(record.risk)}</td>
        <td><b>${record.score}</b>/100</td>
        <td><span class="status ${statusClass(record.decision)}">${esc(record.decision)}</span></td>
      </tr>`).join('');
  }

  renderRegisterRows(records);

  const actions = records
    .flatMap(record => record.actions.map(action => ({ action, system: record.systemName, score: record.score })))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
  const priorityList = document.querySelector('#priorityList');
  if (priorityList) {
    priorityList.innerHTML = actions.length ? actions.map((item, index) => `
      <div class="action">
        <b>${String(index + 1).padStart(2, '0')}</b>
        <div><strong>${esc(item.action)}</strong><br><small style="color:var(--muted)">${esc(item.system)}</small></div>
      </div>`).join('') : '<div class="notice">Geen open acties. Je portfolio is volledig bijgewerkt.</div>';
  }
}
window.render = render;

function selectRecord(id) {
  selected = records.find(record => record.id === id) || records[0];
  renderPassport();
  renderEvidence();
  showView('passport');
}
window.selectRecord = selectRecord;

function bool(formData, key) {
  return formData.get(key) === 'on';
}

function evaluate(formData) {
  const prohibited = [];
  if (bool(formData, 'socialScoring')) prohibited.push('social scoring');
  if (bool(formData, 'manipulation')) prohibited.push('schadelijke manipulatie');
  if (bool(formData, 'facialScraping')) prohibited.push('ongerichte gezichtsdatabank');
  if (bool(formData, 'emotionWork')) prohibited.push('emotieherkenning op werk/onderwijs');

  const high = [];
  [
    ['hr', 'werk/HR'], ['education', 'onderwijs'], ['credit', 'krediet of essentiële diensten'],
    ['health', 'gezondheid/veiligheid'], ['biometric', 'biometrie'], ['publicAuthority', 'publieke/juridische besluitvorming']
  ].forEach(([key, label]) => { if (bool(formData, key)) high.push(label); });

  const transparency = [];
  if (bool(formData, 'externalInteraction')) transparency.push('directe AI-interactie');
  if (bool(formData, 'generatedContent')) transparency.push('AI-gegenereerde content');

  const controls = ['dpa', 'security', 'modelCard', 'subprocessors', 'incident', 'change', 'humanOversight', 'logging', 'monitoring', 'fallback', 'appeal', 'aiLiteracy'];
  const evidence = controls.filter(key => bool(formData, key)).length;
  let score = Math.round(evidence / controls.length * 82);
  if (!bool(formData, 'personalData')) score += 5;
  if (!bool(formData, 'specialData')) score += 5;
  if (bool(formData, 'humanOversight')) score += 4;
  if (bool(formData, 'logging')) score += 4;
  score = Math.min(100, score);
  if (prohibited.length) score = Math.min(score, 25);
  else if (high.length && !bool(formData, 'humanOversight')) score = Math.min(score, 50);

  const risk = prohibited.length ? 'Mogelijk verboden' : high.length ? 'High-risk kandidaat' : transparency.length ? 'Transparantie' : 'Beperkt/minimaal';
  const decision = prohibited.length ? 'Stop & legal review' : score >= 75 ? 'Goedgekeurd met controls' : score >= 55 ? 'Voorwaardelijk' : 'Niet gereed';
  const actions = [];
  if (prohibited.length) actions.push('Stop implementatie en laat Legal de mogelijke verboden praktijk beoordelen');
  if (high.length) actions.push('Voer formele AI Act-classificatie en rolbepaling uit');
  if (bool(formData, 'personalData') && !bool(formData, 'dpa')) actions.push('Sluit en beoordeel een DPA/privacyovereenkomst');
  if (bool(formData, 'specialData')) actions.push('Voer DPIA/noodzaak- en proportionaliteitstoets uit');
  if (!bool(formData, 'humanOversight')) actions.push('Leg bevoegd menselijk toezicht en override vast');
  if (!bool(formData, 'logging')) actions.push('Implementeer logging en traceerbaarheid');
  if (!bool(formData, 'modelCard')) actions.push('Vraag model/systemcard en beperkingen op');
  if (!bool(formData, 'security')) actions.push('Vraag aantoonbaar security-assurance bewijs op');
  if (!bool(formData, 'incident')) actions.push('Leg incident- en escalatieproces vast');
  if (transparency.length) actions.push('Bepaal en implementeer toepasselijke transparantie/labeling');
  if (!bool(formData, 'aiLiteracy')) actions.push('Train gebruikers op beperkingen, veilig gebruik en escalatie');
  if (!actions.length) actions.push('Plan periodieke herbeoordeling en monitor wijzigingen');

  return { prohibited, high, transparency, evidence, totalEvidence: controls.length, score, risk, decision, actions };
}

const form = document.querySelector('#assessmentForm');
const steps = [...document.querySelectorAll('.form-step')];
const dots = [...document.querySelectorAll('.wizard-dot')];
const prev = document.querySelector('#prevBtn');
const next = document.querySelector('#nextBtn');
const assessmentSteps = [...document.querySelectorAll('.assessment-aside li')];

function updateWizard() {
  steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
  dots.forEach((dot, index) => dot.classList.toggle('active', index <= currentStep));
  assessmentSteps.forEach((step, index) => step.classList.toggle('active', index <= currentStep));
  prev.disabled = currentStep === 0;
  next.textContent = currentStep === steps.length - 1 ? 'Opslaan in register' : 'Volgende →';

  if (currentStep === steps.length - 1) {
    const result = evaluate(new FormData(form));
    document.querySelector('#resultContent').innerHTML = `
      <div class="result-grid">
        <div class="panel result-score">
          <span class="status ${statusClass(result.decision)}">${esc(result.decision)}</span>
          <strong>${result.score}</strong><div>Trust score / 100</div>
        </div>
        <div class="panel" style="padding:20px">
          <span class="panel-eyebrow">RISICO-INDICATIE</span><h3 style="margin:3px 0;color:var(--navy)">${esc(result.risk)}</h3>
          <p style="color:var(--muted);font-size:11px">${result.evidence} van ${result.totalEvidence} bewijs- en controlepunten vastgelegd.</p>
          <div class="action-list">${result.actions.slice(0, 5).map((action, index) => `<div class="action"><b>${String(index + 1).padStart(2, '0')}</b><span>${esc(action)}</span></div>`).join('')}</div>
        </div>
      </div>
      <div class="notice" style="margin-top:14px">Deze uitkomst is een geautomatiseerde eerste triage. Laat verboden/high-risk classificatie en juridische verplichtingen valideren.</div>`;
  }
}

if (next) {
  next.onclick = () => {
    if (currentStep === 0 && !form.reportValidity()) return;
    if (currentStep < steps.length - 1) {
      currentStep++;
      updateWizard();
      document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const formData = new FormData(form);
    const result = evaluate(formData);
    const id = `ATP-${new Date().getFullYear()}-${String(records.length + 1).padStart(3, '0')}`;
    const record = {
      id,
      systemName: formData.get('systemName'),
      vendor: formData.get('vendor'),
      useCase: formData.get('useCase'),
      department: formData.get('department'),
      owner: formData.get('owner'),
      operatorRole: formData.get('operatorRole'),
      reviewCycle: formData.get('reviewCycle'),
      risk: result.risk,
      score: result.score,
      decision: result.decision,
      actions: result.actions,
      evidence: result.evidence,
      totalEvidence: result.totalEvidence,
      created: new Date().toISOString().slice(0, 10)
    };
    records.push(record);
    selected = record;
    save();
    render();
    form.reset();
    currentStep = 0;
    updateWizard();
    showToast('Assessment opgeslagen', `${record.systemName} staat nu in het AI-register.`);
    showView('passport');
  };
}
if (prev) prev.onclick = () => { if (currentStep > 0) { currentStep--; updateWizard(); } };

function renderPassport() {
  if (!selected) selected = records[0];
  const target = document.querySelector('#passportContent');
  if (!target || !selected) return;
  const record = selected;
  target.innerHTML = `
    <div class="passport">
      <div class="passport-head">
        <div><div class="passport-id">${esc(record.id)} · aangemaakt ${esc(record.created)}</div><h1 style="margin:8px 0 5px">${esc(record.systemName)}</h1><p style="margin:0;color:#c4e2f6">${esc(record.vendor)} · ${esc(record.department)} · owner: ${esc(record.owner)}</p></div>
        <div style="text-align:right"><div style="font-size:56px;font-weight:900;letter-spacing:-.06em">${record.score}<small style="font-size:15px">/100</small></div><span class="status ${statusClass(record.decision)}">${esc(record.decision)}</span></div>
      </div>
      <div class="passport-body">
        <div class="notice">Decision-support paspoort. Geen certificaat, conformity assessment of juridisch advies.</div>
        <h2>Doel en gebruik</h2><p>${esc(record.useCase)}</p>
        <div class="passport-grid"><div class="passport-tile"><small>Risico-indicatie</small><strong>${esc(record.risk)}</strong></div><div class="passport-tile"><small>Bewijsdekking</small><strong>${record.evidence} / ${record.totalEvidence}</strong></div><div class="passport-tile"><small>Besluit</small><strong>${esc(record.decision)}</strong></div></div>
        <h2 style="margin-top:28px">Verplichte vervolgacties</h2><div class="action-list">${record.actions.map((action, index) => `<div class="action"><b>${String(index + 1).padStart(2, '0')}</b><span>${esc(action)}</span></div>`).join('')}</div>
        <div class="no-print" style="display:flex;gap:9px;flex-wrap:wrap;margin-top:24px"><button class="btn btn-primary" onclick="window.print()">⇩ Print / opslaan als PDF</button><button class="btn btn-secondary" onclick="showView('evidence')">Open evidence room</button><button class="btn btn-quiet" onclick="showView('register')">Terug naar register</button></div>
      </div>
    </div>`;
}

function renderEvidence() {
  if (!selected) selected = records[0];
  const target = document.querySelector('#evidenceList');
  if (!target || !selected) return;
  const labels = ['DPA / privacyvoorwaarden', 'Security assurance', 'Model/systemcard', 'Subprocessors & datalocaties', 'Incidentproces', 'Wijzigingsproces', 'Menselijk toezicht', 'Logging & traceerbaarheid', 'Monitoring & drift', 'Fallback', 'Bezwaar/herbeoordeling', 'AI-geletterdheid'];
  target.innerHTML = labels.map((label, index) => {
    const present = index < selected.evidence;
    return `<div class="evidence-item"><div><b>${esc(label)}</b><br><small style="color:var(--muted)">${present ? 'Vastgelegd en gereed voor review' : 'Nog opvragen of intern vastleggen'}</small></div><span class="status ${present ? 'status-good' : 'status-warn'}">${present ? 'Aanwezig' : 'Ontbreekt'}</span></div>`;
  }).join('');
}

function download(name, data, type) {
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(new Blob([data], { type }));
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(anchor.href);
  showToast('Export gereed', `${name} is aangemaakt.`);
}

function exportJSON() {
  download('ai-register.json', JSON.stringify(records, null, 2), 'application/json');
}
function exportCSV() {
  const headers = ['id', 'systemName', 'vendor', 'useCase', 'department', 'owner', 'risk', 'score', 'decision', 'created'];
  const csv = [headers.join(';'), ...records.map(record => headers.map(header => `"${String(record[header] ?? '').replaceAll('"', '""')}"`).join(';'))].join('\n');
  download('ai-register.csv', csv, 'text/csv');
}
window.exportJSON = exportJSON;
window.exportCSV = exportCSV;

const registerSearch = document.querySelector('#registerSearch');
if (registerSearch) {
  registerSearch.addEventListener('input', event => {
    const query = event.target.value.toLowerCase().trim();
    const filtered = records.filter(record => [record.systemName, record.vendor, record.owner, record.department, record.risk, record.useCase].some(value => String(value).toLowerCase().includes(query)));
    renderRegisterRows(filtered);
    const count = document.querySelector('#registerCount');
    if (count) count.textContent = `${filtered.length} record${filtered.length === 1 ? '' : 's'}`;
  });
}

const globalSearch = document.querySelector('#globalSearch');
if (globalSearch) {
  globalSearch.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const query = event.target.value.toLowerCase().trim();
    if (!query) return;
    showView('register');
    if (registerSearch) {
      registerSearch.value = query;
      registerSearch.dispatchEvent(new Event('input'));
      registerSearch.focus();
    }
  });
}

render();
renderPassport();
renderEvidence();
updateWizard();
const hash = location.hash.replace('#', '');
if (titles[hash]) showView(hash);
