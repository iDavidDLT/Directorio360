'use strict';

// El servidor real de AD queda fuera de esta entrega de maquetación.
const accounts = [
  { id: 'mlopez', name: 'María López', initials: 'ML', area: 'Ventas', version: 3, title: 'Asesora comercial', actualArea: 'Comercial', enabled: false, group: 'GRP_Ventas', member: false, extra: true },
  { id: 'atorres', name: 'Andrés Torres', initials: 'AT', area: 'Tecnología', version: 2, title: 'Analista de sistemas', actualArea: 'Tecnología', enabled: true, group: 'GRP_Tecnologia', member: true, extra: false },
  { id: 'cvera', name: 'Camila Vera', initials: 'CV', area: 'Tecnología', version: 2, title: 'Analista de sistemas', actualArea: 'Soporte', enabled: true, group: 'GRP_Tecnologia', member: false, extra: false },
  { id: 'jruiz', name: 'Javier Ruiz', initials: 'JR', area: 'Finanzas', version: 1, title: 'Analista financiero', actualArea: 'Finanzas', enabled: false, group: 'GRP_Finanzas', member: true, extra: false },
  { id: 'lcastro', name: 'Lucía Castro', initials: 'LC', area: 'Finanzas', version: 1, title: 'Analista financiera', actualArea: 'Finanzas', enabled: true, group: 'GRP_Finanzas', member: true, extra: false },
  { id: 'sperez', name: 'Sofía Pérez', initials: 'SP', area: 'Ventas', version: 3, title: 'Asesora comercial', actualArea: 'Comercial', enabled: true, group: 'GRP_Ventas', member: false, extra: true },
];
const storageKey = 'directorio360-progreso1-v1';
const validFields = new Set(['department', 'title', 'enabled', 'area-group', 'access-group', 'extra-group']);
const $ = (selector) => document.querySelector(selector);
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const timeNow = () => new Intl.DateTimeFormat('es-EC', { hour: '2-digit', minute: '2-digit' }).format(new Date());

let saved;
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { saved = {}; }
if (!saved || typeof saved !== 'object') saved = {};
let corrections = Array.isArray(saved.corrections) ? saved.corrections.filter((item) => item && accounts.some((account) => account.id === item.account) && validFields.has(item.field)) : [];
let events = Array.isArray(saved.events) ? saved.events.filter((event) => event && typeof event.title === 'string' && typeof event.detail === 'string' && typeof event.time === 'string').slice(0, 4) : [];
let selectedId = 'mlopez';
let criteriaFilter = 'all';
let comparisonNumber = 1;
let toastTimer;
let isComparing = false;
let lastFocusedElement;

function getCriteria(account) {
  const rows = [
    { id: 'department', name: 'Departamento', expected: account.area, observed: account.actualArea },
    { id: 'title', name: 'Cargo', expected: account.title, observed: account.title },
    { id: 'enabled', name: 'Cuenta habilitada', expected: 'Sí', observed: account.enabled ? 'Sí' : 'No' },
    { id: 'area-group', name: account.group, expected: 'Miembro', observed: 'Miembro', group: true },
    { id: 'access-group', name: 'GRP_AccesoPortal', expected: 'Miembro', observed: account.member ? 'Miembro' : 'No miembro', group: true },
    { id: 'extra-group', name: 'GRP_Reportes', expected: 'No miembro', observed: account.extra ? 'Miembro' : 'No miembro', group: true },
  ];
  return rows.map((row) => {
    if (corrections.some((item) => item.account === account.id && item.field === row.id)) row.observed = row.expected;
    row.matches = row.expected === row.observed;
    row.result = row.matches ? 'Coincide' : row.id === 'access-group' ? 'Faltante' : row.id === 'extra-group' ? 'Excedente' : 'Diferente';
    return row;
  });
}

function saveState() {
  try { localStorage.setItem(storageKey, JSON.stringify({ corrections, events })); }
  catch { showToast('El navegador no permite guardar. Los cambios durarán esta sesión.'); }
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('#toast span').textContent = message;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4800);
}

function addEvent(title, detail) {
  events.unshift({ title, detail, time: timeNow() });
  events = events.slice(0, 4);
  saveState();
  renderActivity();
}

function renderMetrics() {
  const totals = accounts.map((account) => getCriteria(account).filter((row) => !row.matches).length);
  const differences = totals.reduce((sum, count) => sum + count, 0);
  const pendingAccounts = totals.filter((count) => count > 0).length;
  const criteria = accounts.length * 6;
  const matched = criteria - differences;
  const percent = Math.round(matched / criteria * 100);
  $('#metric-accounts').textContent = String(accounts.length).padStart(2, '0');
  $('#metric-drift').textContent = String(pendingAccounts).padStart(2, '0');
  $('#metric-drift-detail').textContent = `${differences} diferencias detectadas`;
  $('#metric-percent').innerHTML = `${percent}<span>%</span>`;
  $('#metric-match-detail').textContent = `${matched} de ${criteria} criterios evaluados`;
  $('#mini-ring').style.setProperty('--progress', percent);
  $('#nav-count').textContent = pendingAccounts;
}

function renderComparison() {
  const account = accounts.find((item) => item.id === selectedId);
  const rows = getCriteria(account);
  const differences = rows.filter((row) => !row.matches).length;
  const percent = Math.round((rows.length - differences) / rows.length * 100);
  $('#selected-initials').textContent = account.initials;
  $('#selected-name').textContent = account.name;
  $('#selected-username').textContent = account.id;
  $('#selected-area').textContent = account.area;
  $('#selected-profile').innerHTML = `${escapeHTML(account.area)} <span>v${account.version}</span>`;
  $('#comparison-number').textContent = String(comparisonNumber).padStart(3, '0');
  $('#criteria-total').textContent = rows.length;
  $('#criteria-differences').textContent = differences;
  const visible = rows.filter((row) => criteriaFilter === 'all' || !row.matches);
  $('#criteria-body').innerHTML = visible.length ? visible.map((row) => `<tr><td${row.group ? ' class="comparison-table__group"' : ''}>${escapeHTML(row.name)}</td><td>${escapeHTML(row.expected)}</td><td${!row.matches ? ' class="comparison-table__changed"' : ''}>${escapeHTML(row.observed)}</td><td><span class="pill ${row.matches ? 'pill--success' : 'pill--warm'}">${row.matches ? icon('check') : ''}${row.result}</span></td></tr>`).join('') : '<tr><td colspan="4">Todos los criterios coinciden con el perfil esperado.</td></tr>';
  $('#account-score').innerHTML = `${percent}<span>%</span>`;
  $('#health-bar').style.width = `${percent}%`;
  $('#account-matches').textContent = rows.length - differences;
  $('#account-differences').textContent = differences;
  $('#review-count').textContent = `${differences} por revisar`;
  $('#review-button').disabled = !differences;
  $('#review-button').innerHTML = `${differences ? 'Revisar diferencias' : 'Sin diferencias pendientes'}${icon(differences ? 'arrow' : 'check')}`;
}

function renderDirectory() {
  const query = normalize($('#account-search').value);
  const filter = $('#account-filter').value;
  const visible = accounts.filter((account) => {
    const matchesQuery = normalize(`${account.name} ${account.id}`).includes(query);
    const differences = getCriteria(account).some((row) => !row.matches);
    return matchesQuery && (filter === 'all' || (filter === 'differences' ? differences : !differences));
  });
  $('#accounts-list').innerHTML = visible.map((account) => {
    const differences = getCriteria(account).filter((row) => !row.matches).length;
    return `<button class="account${account.id === selectedId ? ' account--selected' : ''}" type="button" data-account="${account.id}" aria-pressed="${account.id === selectedId}" aria-label="Comparar a ${escapeHTML(account.name)}, ${differences} diferencias"><span class="avatar" aria-hidden="true">${account.initials}</span><span class="account__details"><strong>${escapeHTML(account.name)}</strong><small>${escapeHTML(account.id)} · ${escapeHTML(account.area)}</small></span><span class="account__indicator${differences ? '' : ' account__indicator--match'}" aria-hidden="true">${differences || icon('check')}</span></button>`;
  }).join('');
  $('#accounts-empty').hidden = visible.length > 0;
  $('#accounts-count').textContent = `Mostrando ${visible.length} de ${accounts.length} cuentas`;
}

function renderActivity() {
  const initial = [
    { title: 'Comparación de mlopez preparada', detail: 'Perfil Ventas v3 · datos de demostración', time: 'Inicio' },
    { title: 'Perfiles de referencia cargados', detail: 'Ventas, Tecnología y Finanzas', time: 'Inicio' },
    { title: 'Espacio de prueba listo', detail: '6 cuentas ficticias · 36 criterios', time: 'Inicio' },
  ];
  $('#activity-list').innerHTML = [...events, ...initial].slice(0, 4).map((event, index) => `<li class="timeline__item"><span class="timeline__icon">${icon(index === 0 ? 'compare' : index === 1 ? 'shield' : 'check')}</span><div class="timeline__body"><p>${escapeHTML(event.title)}</p><span>${escapeHTML(event.detail)}</span></div><time class="timeline__time">${escapeHTML(event.time)}</time></li>`).join('');
}

function render() { renderMetrics(); renderComparison(); renderDirectory(); renderActivity(); }

$('#account-search').addEventListener('input', renderDirectory);
$('#account-filter').addEventListener('change', renderDirectory);
$('#accounts-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-account]');
  if (!button || isComparing) return;
  selectedId = button.dataset.account;
  comparisonNumber++;
  renderComparison(); renderDirectory();
  $('#comparison-time').textContent = `Vista consultada · ${timeNow()}`;
  addEvent(`Comparación de ${selectedId} consultada`, 'Referencia esperada frente a datos de prueba');
  $('#comparaciones').scrollIntoView({ behavior: 'smooth', block: 'start' });
  // El botón seleccionado está debajo del panel; el foco anuncia el nuevo resultado.
  $('#comparison-title').tabIndex = -1;
  $('#comparison-title').focus({ preventScroll: true });
});

document.querySelectorAll('[data-criteria]').forEach((button) => button.addEventListener('click', () => {
  criteriaFilter = button.dataset.criteria;
  document.querySelectorAll('[data-criteria]').forEach((tab) => { const active = tab === button; tab.classList.toggle('comparison__tab--active', active); tab.setAttribute('aria-pressed', active); });
  renderComparison();
}));

$('#compare-button').addEventListener('click', async () => {
  if (isComparing) return;
  isComparing = true;
  const button = $('#compare-button');
  button.disabled = true;
  button.innerHTML = `${icon('compare')}Comparando…`;
  await new Promise((resolve) => setTimeout(resolve, 450));
  comparisonNumber++;
  renderComparison();
  $('#comparison-time').textContent = `Actualizada · ${timeNow()}`;
  addEvent(`Nueva comparación de ${selectedId}`, 'Simulación completada sobre datos locales');
  button.innerHTML = `${icon('plus')}Nueva comparación`;
  button.disabled = false;
  isComparing = false;
  showToast(`Comparación actualizada para ${selectedId}.`);
});

$('#review-button').addEventListener('click', () => {
  const account = accounts.find((item) => item.id === selectedId);
  const differences = getCriteria(account).filter((row) => !row.matches);
  if (!differences.length) return;
  lastFocusedElement = document.activeElement;
  $('#dialog-account').textContent = `${account.name} · ${account.id} · Perfil ${account.area} v${account.version}`;
  $('#review-options').innerHTML = differences.map((row, index) => `<label class="review-dialog__option"><input type="radio" name="difference" value="${row.id}" ${index === 0 ? 'checked' : ''} required><span><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.observed)} → ${escapeHTML(row.expected)}</small></span></label>`).join('');
  $('#justification').value = '';
  $('#justification').setCustomValidity('');
  $('#review-dialog').showModal();
});

function closeDialog() { $('#review-dialog').close(); }
$('#close-dialog').addEventListener('click', closeDialog);
$('#cancel-dialog').addEventListener('click', closeDialog);
$('#review-dialog').addEventListener('close', () => lastFocusedElement?.focus());
$('#justification').addEventListener('input', () => $('#justification').setCustomValidity(''));
$('#review-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const justification = $('#justification');
  if (justification.value.trim().length < 10) { justification.setCustomValidity('Escribe al menos 10 caracteres, sin contar espacios al inicio o final.'); justification.reportValidity(); return; }
  const field = new FormData(event.currentTarget).get('difference');
  const account = accounts.find((item) => item.id === selectedId);
  const row = getCriteria(account).find((item) => item.id === field && !item.matches);
  if (!row) return;
  corrections.push({ account: selectedId, field });
  addEvent(`Corrección simulada: ${row.name}`, `${selectedId} · ${row.observed} → ${row.expected}`);
  closeDialog(); render();
  showToast(`${row.name} corregido en la demostración. Los demás criterios se conservan.`);
});

$('#export-button').addEventListener('click', () => {
  const account = accounts.find((item) => item.id === selectedId);
  const rows = [['Cuenta', 'Criterio', 'Esperado', 'Observado', 'Resultado'], ...getCriteria(account).map((row) => [account.id, row.name, row.expected, row.observed, row.result])];
  const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a'); link.href = url; link.download = `comparacion-${account.id}.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Comparación exportada en formato CSV.');
});

$('#reset-button').addEventListener('click', () => {
  corrections = []; events = []; comparisonNumber = 1; selectedId = 'mlopez';
  $('#account-search').value = ''; $('#account-filter').value = 'all';
  $('#comparison-time').textContent = 'Captura de demostración';
  criteriaFilter = 'all';
  document.querySelectorAll('[data-criteria]').forEach((button) => { const active = button.dataset.criteria === 'all'; button.classList.toggle('comparison__tab--active', active); button.setAttribute('aria-pressed', active); });
  saveState(); render(); showToast('La demostración volvió a su estado inicial.');
});

function setMenu(open) {
  $('.sidebar').classList.toggle('sidebar--open', open);
  document.body.classList.toggle('has-open-menu', open);
  $('.nav-scrim').hidden = !open;
  $('#menu-button').setAttribute('aria-expanded', open);
  $('#menu-button').setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
  $('.sidebar').inert = !open && window.matchMedia('(max-width: 900px)').matches;
  if (open) $('.sidebar a').focus();
}
$('#menu-button').addEventListener('click', () => setMenu($('#menu-button').getAttribute('aria-expanded') !== 'true'));
$('.nav-scrim').addEventListener('click', () => { setMenu(false); $('#menu-button').focus(); });
document.querySelectorAll('.sidebar a').forEach((link) => link.addEventListener('click', () => {
  setMenu(false);
  document.querySelectorAll('.navigation__item').forEach((item) => { const active = item === link; item.classList.toggle('navigation__item--active', active); if (active) item.setAttribute('aria-current', 'location'); else item.removeAttribute('aria-current'); });
}));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && $('#menu-button').getAttribute('aria-expanded') === 'true') { setMenu(false); $('#menu-button').focus(); } });
window.matchMedia('(min-width: 901px)').addEventListener('change', (event) => { if (event.matches) setMenu(false); });
window.matchMedia('(max-width: 900px)').addEventListener('change', () => setMenu(false));
setMenu(false);
render();
