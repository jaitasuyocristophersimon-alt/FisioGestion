(() => {
  'use strict';
  const KEY = 'fisiogestion-v1';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const today = () => new Date().toISOString().slice(0, 10);
  const money = value => `Bs ${Number(value || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  let data = { patients: [], sessions: [], payments: [] };
  try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && Array.isArray(saved.patients) && Array.isArray(saved.sessions) && Array.isArray(saved.payments)) data = saved; } catch { /* El registro local puede estar vacío o ilegible. */ }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch { toast('No se pudo guardar. Revisa el espacio disponible del dispositivo.'); return false; } };
  const toast = message => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2800); };
  const patient = id => data.patients.find(item => item.id === id);
  const patientSessions = id => data.sessions.filter(item => item.patientId === id);
  const paid = id => data.payments.filter(item => item.patientId === id).reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const balance = p => patientSessions(p.id).length * Number(p.price || 0) - paid(p.id);
  const fmtDate = value => { if (!value) return 'Sin fecha'; const d = new Date(`${value}T12:00:00`); return d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' }); };

  function render() {
    $('#today').textContent = new Date().toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#patientCount').textContent = data.patients.length;
    $('#sessionCount').textContent = data.sessions.length;
    $('#balanceTotal').textContent = money(data.patients.reduce((sum, p) => sum + Math.max(0, balance(p)), 0));
    const query = $('#searchInput').value.trim().toLocaleLowerCase('es');
    const patients = data.patients.filter(p => `${p.name} ${p.phone} ${p.pathology}`.toLocaleLowerCase('es').includes(query));
    $('#patientList').innerHTML = patients.map(p => `<article class="patient-card"><div class="avatar">${escapeHTML(p.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase())}</div><div class="patient-main"><strong>${escapeHTML(p.name)}</strong><p>${escapeHTML(p.pathology || 'Sin patología indicada')} · ${escapeHTML(p.phone || 'Sin teléfono')}</p></div><div class="card-meta"><strong>${money(p.price)}</strong><small>por sesión</small></div><div class="card-actions"><button class="small-btn" data-action="detail" data-id="${escapeHTML(p.id)}">Ver</button><button class="small-btn" data-action="session" data-id="${escapeHTML(p.id)}">＋ Sesión</button></div></article>`).join('');
    $('#emptyPatients').hidden = data.patients.length > 0;
    if (query && patients.length === 0) $('#patientList').innerHTML = '<div class="empty"><h3>Sin resultados</h3><p>Prueba con otro nombre, teléfono o patología.</p></div>';
    $('#sessionList').innerHTML = [...data.sessions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).map(s => { const p = patient(s.patientId); return `<article class="record-card"><div class="record-date"><strong>${escapeHTML(s.number)}</strong><small>SESIÓN</small></div><div class="record-info"><strong>${escapeHTML(p?.name || 'Paciente eliminado')}</strong><p>${fmtDate(s.date)} · ${escapeHTML(s.treatment || 'Sin tratamiento descrito')}</p><span class="tag">${escapeHTML(s.machine || 'Sin máquina')}${s.duration ? ` · ${escapeHTML(s.duration)} min` : ''}</span></div></article>`; }).join('');
    $('#emptySessions').hidden = data.sessions.length > 0;
    $('#paymentList').innerHTML = data.patients.map(p => { const due = balance(p); return `<article class="payment-card"><div class="avatar">${escapeHTML(p.name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase())}</div><div class="patient-main"><strong>${escapeHTML(p.name)}</strong><p>${patientSessions(p.id).length} sesiones · ${money(paid(p.id))} pagado</p></div><div class="balance ${due > 0 ? 'due' : 'credit'}"><strong>${money(Math.abs(due))}</strong><small>${due > 0 ? 'saldo estimado' : due < 0 ? 'a favor' : 'al día'}</small></div><div class="card-actions"><button class="small-btn" data-action="payment" data-id="${escapeHTML(p.id)}">＋ Pago</button></div></article>`; }).join('');
    $('#emptyPayments').hidden = data.patients.length > 0;
    const recent = [...data.payments].sort((a, b) => b.date.localeCompare(a.date));
    $('#recentPayments').innerHTML = recent.map(item => `<article class="record-card"><div class="record-date"><strong>$</strong><small>${fmtDate(item.date)}</small></div><div class="record-info"><strong>${escapeHTML(patient(item.patientId)?.name || 'Paciente eliminado')}</strong><p>${escapeHTML(item.note || 'Pago recibido')}</p></div><div class="balance credit"><strong>${money(item.amount)}</strong><small>recibido</small></div></article>`).join('');
    $('#emptyRecentPayments').hidden = recent.length > 0;
  }
  function openPatient(id) {
    const form = $('#patientForm'); form.reset(); form.elements.id.value = '';
    if (id) { const p = patient(id); if (!p) return; form.elements.id.value = p.id; form.elements.name.value = p.name; form.elements.phone.value = p.phone || ''; form.elements.pathology.value = p.pathology || ''; form.elements.price.value = p.price; $('.dialog-head h2', $('#patientDialog')).textContent = 'Editar paciente'; }
    else $('.dialog-head h2', $('#patientDialog')).textContent = 'Datos del paciente';
    $('#patientDialog').showModal();
  }
  function openSession(patientId) {
    if (!data.patients.length) { toast('Primero registra un paciente.'); openPatient(); return; }
    const form = $('#sessionForm'); form.reset();
    form.elements.patientId.innerHTML = data.patients.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join('');
    if (patientId) form.elements.patientId.value = patientId;
    const selected = patient(form.elements.patientId.value);
    form.elements.number.value = selected ? patientSessions(selected.id).length + 1 : 1; form.elements.date.value = today();
    $('#sessionDialog').showModal();
  }
  function openPayment(patientId) {
    if (!data.patients.length) { toast('Primero registra un paciente.'); return; }
    const form = $('#paymentForm'); form.reset(); form.elements.patientId.innerHTML = data.patients.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(p.name)}</option>`).join('');
    if (patientId) form.elements.patientId.value = patientId; form.elements.date.value = today(); $('#paymentDialog').showModal();
  }
  function showDetail(id) {
    const p = patient(id); if (!p) return;
    const sessions = patientSessions(id).sort((a, b) => b.date.localeCompare(a.date));
    $('#detailContent').innerHTML = `<div class="dialog-head"><div><p class="eyebrow">PERFIL DEL PACIENTE</p><h2>${escapeHTML(p.name)}</h2></div><button type="button" class="close" data-close aria-label="Cerrar">×</button></div><p class="muted">${escapeHTML(p.phone || 'Sin teléfono')} · ${escapeHTML(p.pathology || 'Sin patología indicada')}</p><div class="detail-summary">${sessions.length} sesiones registradas · ${money(p.price)} por sesión<br>Pagado: ${money(paid(id))} · Saldo estimado: <strong>${money(balance(p))}</strong></div><div class="card-actions"><button class="small-btn" data-action="edit" data-id="${escapeHTML(id)}">Editar</button><button class="small-btn" data-action="session" data-id="${escapeHTML(id)}">＋ Sesión</button><button class="small-btn" data-action="payment" data-id="${escapeHTML(id)}">＋ Pago</button><button class="small-btn" data-action="delete" data-id="${escapeHTML(id)}">Eliminar</button></div><h3>Historial de sesiones</h3>${sessions.length ? sessions.map(s => `<div class="detail-session"><strong>Sesión ${escapeHTML(s.number)} · ${fmtDate(s.date)}</strong><p><b>Tratamiento:</b> ${escapeHTML(s.treatment || '—')}<br><b>Máquina:</b> ${escapeHTML(s.machine || '—')} · <b>Duración:</b> ${escapeHTML(s.duration || '—')} min<br><b>Observaciones:</b> ${escapeHTML(s.notes || '—')}</p></div>`).join('') : '<p class="muted">Aún no hay sesiones registradas.</p>'}`;
    $('#detailDialog').showModal();
  }
  document.addEventListener('click', event => {
    const close = event.target.closest('[data-close]'); if (close) { close.closest('dialog').close(); return; }
    const action = event.target.closest('[data-action]'); if (action) { const { action: kind, id } = action.dataset; if (kind === 'detail') showDetail(id); if (kind === 'session') openSession(id); if (kind === 'payment') openPayment(id); if (kind === 'edit') { $('#detailDialog').close(); openPatient(id); } if (kind === 'delete' && confirm('¿Eliminar este paciente y todo su historial y pagos?')) { data.patients = data.patients.filter(p => p.id !== id); data.sessions = data.sessions.filter(s => s.patientId !== id); data.payments = data.payments.filter(p => p.patientId !== id); persist(); $('#detailDialog').close(); render(); toast('Paciente eliminado.'); } return; }
    const tab = event.target.closest('.tab'); if (tab) { $$('.tab').forEach(t => t.classList.toggle('active', t === tab)); $$('.view').forEach(v => v.classList.toggle('active', v.id === `${tab.dataset.view}View`)); }
  });
  $('#searchInput').addEventListener('input', render);
  $('#addPatientBtn').addEventListener('click', () => openPatient()); $('#emptyAddBtn').addEventListener('click', () => openPatient());
  $('#addSessionBtn').addEventListener('click', () => openSession());
  $('#sessionForm').elements.patientId.addEventListener('change', event => { event.target.form.elements.number.value = patientSessions(event.target.value).length + 1; });
  $('#patientForm').addEventListener('submit', event => { event.preventDefault(); const f = event.currentTarget; const id = f.elements.id.value; const record = { id: id || uid(), name: f.elements.name.value.trim(), phone: f.elements.phone.value.trim(), pathology: f.elements.pathology.value.trim(), price: Number(f.elements.price.value) || 0 }; if (id) data.patients = data.patients.map(p => p.id === id ? { ...p, ...record } : p); else data.patients.push(record); persist(); f.closest('dialog').close(); render(); toast(id ? 'Paciente actualizado.' : 'Paciente guardado.'); });
  $('#sessionForm').addEventListener('submit', event => { event.preventDefault(); const f = event.currentTarget; data.sessions.push({ id: uid(), patientId: f.elements.patientId.value, number: Number(f.elements.number.value), date: f.elements.date.value, treatment: f.elements.treatment.value.trim(), machine: f.elements.machine.value.trim(), duration: f.elements.duration.value, notes: f.elements.notes.value.trim(), createdAt: new Date().toISOString() }); persist(); f.closest('dialog').close(); render(); toast('Sesión guardada en el historial.'); });
  $('#paymentForm').addEventListener('submit', event => { event.preventDefault(); const f = event.currentTarget; data.payments.push({ id: uid(), patientId: f.elements.patientId.value, amount: Number(f.elements.amount.value), date: f.elements.date.value, note: f.elements.note.value.trim() }); persist(); f.closest('dialog').close(); render(); toast('Pago anotado.'); });
  $('#paymentList').addEventListener('click', event => { const button = event.target.closest('[data-action="payment"]'); if (button) openPayment(button.dataset.id); });
  $('#sessionForm').elements.patientId.addEventListener('change', event => { const f = event.target.form; f.elements.number.value = patientSessions(event.target.value).length + 1; });
  document.addEventListener('click', event => { const button = event.target.closest('[data-voice]'); if (!button) return; const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; if (!SpeechRecognition) { toast('El dictado por voz no está disponible en este navegador.'); return; } const recognition = new SpeechRecognition(); recognition.lang = 'es-BO'; recognition.interimResults = false; recognition.maxAlternatives = 1; button.disabled = true; button.textContent = 'Escuchando…'; recognition.onresult = e => { const field = button.closest('label').querySelector(`[name="${button.dataset.voice}"]`); if (field) { field.value = `${field.value}${field.value ? ' ' : ''}${e.results[0][0].transcript}`; field.dispatchEvent(new Event('input', { bubbles: true })); } }; recognition.onerror = () => toast('No se pudo completar el dictado. Puedes escribir el texto.'); recognition.onend = () => { button.disabled = false; button.textContent = '🎙 Dictar'; }; recognition.start(); });
  let installPrompt; const installBtn = $('#installBtn'); window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; installBtn.hidden = false; }); installBtn.addEventListener('click', async () => { if (!installPrompt) return; installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; installBtn.hidden = true; });
  window.addEventListener('appinstalled', () => { installBtn.hidden = true; toast('FisioGestión quedó instalada.'); });
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => toast('No se pudo activar el modo sin conexión.')));
  render();
})();
