'use strict';

import { POIS, addPoi, updatePoi } from './data.js';
import { renderizarListaPoi, seleccionarPoi } from './ui.js';
import { agregarMarcadorMapa, actualizarMarcadorMapa } from './miniMap.js';

let _emoji       = '📍';
let _mediaFile   = null;
let _mediaUrl    = null;
let _geoCoords   = null;
let _pickerReady = false;
let _editMode    = false;
let _editPoiId   = null;
let _idleHtml    = null;  // HTML original del fileZoneIdle para restaurar

export function initModal() {
  const modal         = document.getElementById('poiModal');
  const btnAdd        = document.getElementById('btnAddPoi');
  const btnClose      = document.getElementById('modalClose');
  const btnCancel     = document.getElementById('btnModalCancel');
  const form          = document.getElementById('poiForm');
  const emojiTrigger  = document.getElementById('emojiTrigger');
  const emojiWrap     = document.getElementById('emojiPickerWrap');
  const btnGeocode    = document.getElementById('btnGeocode');
  const fileInput = document.getElementById('poiMedia');
  const fileZone  = document.getElementById('fileZone');

  _idleHtml = document.getElementById('fileZoneIdle').innerHTML;

  btnAdd.addEventListener('click', () => abrirModal(modal, 'crear'));
  iniciarTooltipBoton(btnAdd);

  btnClose.addEventListener('click',  () => cerrarModal(modal, form));
  btnCancel.addEventListener('click', () => cerrarModal(modal, form));
  modal.addEventListener('click', e => { if (e.target === modal) cerrarModal(modal, form); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) cerrarModal(modal, form);
  });

  // Editar POI dinámico desde menú contextual
  document.addEventListener('poi:editar', e => {
    const poi = POIS.find(p => p.id === e.detail.id);
    if (!poi) return;
    _editMode  = true;
    _editPoiId = poi.id;
    prefillForm(poi);
    abrirModal(modal, 'editar');
  });

  emojiTrigger.addEventListener('click', () => toggleEmojiPicker(emojiTrigger, emojiWrap));
  btnGeocode.addEventListener('click', geocodificar);

  // Delegación sobre fileZone: .btn-file-browse se recrea al resetear el HTML
  fileZone.addEventListener('click', e => {
    if (e.target.closest('.btn-file-browse')) fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  fileZone.addEventListener('dragover', e => {
    e.preventDefault();
    fileZone.classList.add('drag-over');
  });
  fileZone.addEventListener('dragleave', e => {
    if (!fileZone.contains(e.relatedTarget)) fileZone.classList.remove('drag-over');
  });
  fileZone.addEventListener('drop', e => {
    e.preventDefault();
    fileZone.classList.remove('drag-over');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  form.addEventListener('submit', e => { e.preventDefault(); guardarPoi(modal, form); });
}

/* ── Abrir / cerrar ─────────────────────────────────────────────────────── */

function abrirModal(modal, modo = 'crear') {
  const titulo = document.getElementById('modalTitle');
  const btnSubmit = document.querySelector('.btn-modal-submit');
  if (modo === 'editar') {
    titulo.textContent    = 'Editar Punto de Interés';
    btnSubmit.textContent = '💾 Guardar cambios';
  } else {
    titulo.textContent    = 'Nuevo Punto de Interés';
    btnSubmit.textContent = '✚ Crear punto';
  }
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('poiNombre').focus(), 50);
}

function cerrarModal(modal, form) {
  modal.hidden = true;
  document.body.style.overflow = '';
  resetearFormulario(form);
}

function resetearFormulario(form) {
  form.reset();
  _emoji     = '📍';
  _mediaFile = null;
  if (_mediaUrl) { URL.revokeObjectURL(_mediaUrl); _mediaUrl = null; }
  _geoCoords = null;
  _editMode  = false;
  _editPoiId = null;

  document.getElementById('emojiTrigger').textContent = '📍';
  document.getElementById('emojiPickerWrap').hidden   = true;
  document.getElementById('geocodeResult').hidden     = true;
  document.getElementById('geocodeError').hidden      = true;
  document.getElementById('formValidationMsg').hidden = true;

  const idle = document.getElementById('fileZoneIdle');
  if (_idleHtml) idle.innerHTML = _idleHtml;
  idle.hidden = false;

  const preview = document.getElementById('fileZonePreview');
  preview.innerHTML = '';
  preview.hidden    = true;
}

/* ── Pre-rellenar formulario en modo edición ────────────────────────────── */

function prefillForm(poi) {
  document.getElementById('poiNombre').value      = poi.nombre;
  document.getElementById('poiCategoria').value   = poi.categoria;
  document.getElementById('poiDescripcion').value = poi.descripcion;

  _emoji = poi.emoji || '📍';
  document.getElementById('emojiTrigger').textContent = _emoji;

  _geoCoords = { lat: poi.lat, lng: poi.lng };
  document.getElementById('geoLatSpan').textContent = `${poi.lat.toFixed(5)}°N`;
  document.getElementById('geoLngSpan').textContent = `${Math.abs(poi.lng).toFixed(5)}°O`;
  document.getElementById('geocodeResult').hidden   = false;

  if (poi.media) {
    const icono = poi.media.tipo === 'audio' ? '🎧' : poi.media.tipo === 'video' ? '🎬' : '🖼️';
    document.getElementById('fileZoneIdle').innerHTML = `
      <span class="file-zone-icon">${icono}</span>
      <span>Archivo actual: <strong>${poi.media.tipo}</strong></span>
      <span class="file-zone-formats">Sube un archivo nuevo para reemplazarlo</span>`;
  }
}

/* ── Tooltip del botón + ────────────────────────────────────────────────── */

function iniciarTooltipBoton(btn) {
  let timer = null;

  btn.addEventListener('mouseenter', () => {
    const tt = document.getElementById('poi-tooltip');
    if (!tt) return;

    clearTimeout(timer);
    const rect = btn.getBoundingClientRect();

    tt.textContent = 'Crear nuevo punto';
    tt.style.left  = (rect.left + rect.width / 2) + 'px';
    tt.style.top   = (rect.top - 6) + 'px';
    tt.classList.add('visible');

    requestAnimationFrame(() => {
      const ttRect = tt.getBoundingClientRect();
      if (ttRect.right > window.innerWidth) {
        tt.style.left = (window.innerWidth - ttRect.width - 12) + 'px';
      }
    });

    timer = setTimeout(() => { tt.classList.remove('visible'); }, 2000);
  });

  btn.addEventListener('mouseleave', () => {
    const tt = document.getElementById('poi-tooltip');
    clearTimeout(timer);
    if (tt) tt.classList.remove('visible');
  });
}

/* ── Emoji picker (carga lazy desde CDN) ───────────────────────────────── */

async function toggleEmojiPicker(trigger, wrap) {
  if (!wrap.hidden) { wrap.hidden = true; return; }

  if (!_pickerReady) {
    try {
      await import('https://cdn.jsdelivr.net/npm/emoji-picker-element@1/index.js');
      _pickerReady = true;
      const picker = document.createElement('emoji-picker');
      picker.setAttribute('locale', 'es');
      wrap.appendChild(picker);
      picker.addEventListener('emoji-click', e => {
        _emoji = e.detail.unicode;
        trigger.textContent = _emoji;
        wrap.hidden = true;
      });
    } catch (err) {
      console.warn('[Modal] Selector de emoji no disponible:', err);
      return;
    }
  }

  wrap.hidden = false;
}

/* ── Geocodificación con Nominatim ──────────────────────────────────────── */

async function geocodificar() {
  const calle    = document.getElementById('poiCalle').value.trim();
  const cp       = document.getElementById('poiCp').value.trim();
  const ciudad   = document.getElementById('poiCiudad').value.trim();
  const completa = [calle, cp, ciudad].filter(Boolean).join(', ');

  const resultEl = document.getElementById('geocodeResult');
  const errorEl  = document.getElementById('geocodeError');
  const errorMsg = document.getElementById('geocodeErrorMsg');

  if (!completa) {
    errorMsg.textContent = 'Introduce al menos la calle o la ciudad.';
    errorEl.hidden  = false;
    resultEl.hidden = true;
    return;
  }

  const btn = document.getElementById('btnGeocode');
  btn.disabled    = true;
  btn.textContent = 'Buscando…';

  try {
    const url  = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(completa)}&format=json&limit=1`;
    const res  = await fetch(url, { headers: { 'Accept-Language': 'es' } });
    if (!res.ok) throw new Error('red');
    const data = await res.json();
    if (!data.length) throw new Error('sin resultados');

    _geoCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    document.getElementById('geoLatSpan').textContent = `${_geoCoords.lat.toFixed(5)}°N`;
    document.getElementById('geoLngSpan').textContent = `${Math.abs(_geoCoords.lng).toFixed(5)}°O`;
    resultEl.hidden = false;
    errorEl.hidden  = true;
  } catch {
    errorMsg.textContent = 'Dirección no encontrada. Intenta con más detalle o añade la ciudad.';
    errorEl.hidden  = false;
    resultEl.hidden = true;
    _geoCoords = null;
  } finally {
    btn.disabled    = false;
    btn.textContent = '📍 Obtener coordenadas';
  }
}

/* ── Manejo de archivo multimedia ───────────────────────────────────────── */

const TIPOS_VALIDOS = new Set(['image/jpeg', 'image/png', 'audio/mpeg', 'video/mp4']);

function handleFile(file) {
  if (!TIPOS_VALIDOS.has(file.type)) {
    alert('Formato no válido. Usa JPG, PNG, MP3 o MP4.');
    return;
  }

  if (_mediaUrl) URL.revokeObjectURL(_mediaUrl);
  _mediaFile = file;
  _mediaUrl  = URL.createObjectURL(file);

  const preview = document.getElementById('fileZonePreview');
  preview.innerHTML = '';

  const nameTag = document.createElement('span');
  nameTag.className   = 'file-name-tag';
  nameTag.textContent = file.name;
  preview.appendChild(nameTag);

  if (file.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = _mediaUrl; img.className = 'file-preview-img';
    preview.appendChild(img);
  } else if (file.type.startsWith('audio/')) {
    const audio = document.createElement('audio');
    audio.src = _mediaUrl; audio.controls = true; audio.className = 'file-preview-audio';
    preview.appendChild(audio);
  } else {
    const video = document.createElement('video');
    video.src = _mediaUrl; video.controls = true; video.className = 'file-preview-video';
    preview.appendChild(video);
  }

  const btnRemove = document.createElement('button');
  btnRemove.type = 'button';
  btnRemove.className = 'btn-remove-file';
  btnRemove.textContent = '✕ Quitar archivo';
  btnRemove.addEventListener('click', () => {
    _mediaFile = null;
    URL.revokeObjectURL(_mediaUrl); _mediaUrl = null;
    document.getElementById('poiMedia').value = '';
    preview.innerHTML = ''; preview.hidden = true;
    document.getElementById('fileZoneIdle').hidden = false;
  });
  preview.appendChild(btnRemove);

  preview.hidden = false;
  document.getElementById('fileZoneIdle').hidden = true;
}

/* ── Crear o guardar POI ────────────────────────────────────────────────── */

function guardarPoi(modal, form) {
  const nombre      = document.getElementById('poiNombre').value.trim();
  const categoria   = document.getElementById('poiCategoria').value.trim().toUpperCase();
  const descripcion = document.getElementById('poiDescripcion').value.trim();
  const msgEl       = document.getElementById('formValidationMsg');

  if (!nombre || !categoria || !descripcion) {
    msgEl.textContent = 'Completa los campos obligatorios (*).';
    msgEl.hidden = false;
    return;
  }
  if (!_geoCoords) {
    msgEl.textContent = 'Pulsa "Obtener coordenadas" para geolocalizar la dirección.';
    msgEl.hidden = false;
    return;
  }
  msgEl.hidden = true;

  // Si hay archivo nuevo úsalo; en modo edición conserva el media anterior
  let media = null;
  if (_mediaFile && _mediaUrl) {
    const t = _mediaFile.type;
    media = {
      tipo: t.startsWith('image/') ? 'imagen' : t.startsWith('audio/') ? 'audio' : 'video',
      src:  _mediaUrl
    };
    // Transferir propiedad del blob al POI: el reset no debe revocarlo
    _mediaUrl = null;
  } else if (_editMode) {
    media = POIS.find(p => p.id === _editPoiId)?.media ?? null;
  }

  if (_editMode) {
    const datos = { nombre, categoria, emoji: _emoji, descripcion,
                    lat: _geoCoords.lat, lng: _geoCoords.lng, media };
    updatePoi(_editPoiId, datos);
    renderizarListaPoi();
    actualizarMarcadorMapa({ id: _editPoiId, ...datos });
    // Refresca el panel de detalle si este POI está activo
    const active = document.querySelector('.poi-item.active');
    if (active?.dataset.id === _editPoiId) seleccionarPoi(_editPoiId);
  } else {
    const nuevoPoi = {
      id: `poi-${Date.now()}`,
      nombre, categoria, emoji: _emoji, descripcion,
      lat: _geoCoords.lat, lng: _geoCoords.lng, media
    };
    addPoi(nuevoPoi);
    renderizarListaPoi();
    agregarMarcadorMapa(nuevoPoi);
  }

  cerrarModal(modal, form);
}
