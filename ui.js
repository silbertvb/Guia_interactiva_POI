/**
 * ui.js — Renderizado de lista de POI y panel de detalle.
 *
 * Se encarga de generar los elementos interactivos de la lista de puntos de
 * interés y mostrar la información detallada junto al reproductor.
 */
'use strict';

import { POIS } from './data.js';
import { state } from './state.js';
import {
  poiList,
  detailEmpty,
  detailContent,
  detailTitle,
  detailDesc,
  detailCategory,
  detailCoords,
  proximityAlert,
  proximityMsg
} from './dom.js';
import { cargarMedia } from './player.js';

let _tooltip = null;
let _hideTimer = null;
let _activeItem = null;

/* ── Menú contextual (⋮) para POI dinámicos ────────────────────────────── */

let _ctxMenu   = null;
let _ctxPoiId  = null;

function initContextMenu() {
  if (_ctxMenu) return;

  _ctxMenu = document.createElement('div');
  _ctxMenu.id = 'poi-ctx-menu';
  _ctxMenu.setAttribute('role', 'menu');
  _ctxMenu.hidden = true;

  const btnEdit = document.createElement('button');
  btnEdit.className = 'ctx-item';
  btnEdit.setAttribute('role', 'menuitem');
  btnEdit.innerHTML = '<span aria-hidden="true">✏️</span> Editar';
  btnEdit.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('poi:editar', { detail: { id: _ctxPoiId } }));
    _ctxMenu.hidden = true;
  });

  _ctxMenu.appendChild(btnEdit);
  document.body.appendChild(_ctxMenu);

  document.addEventListener('click', () => { if (_ctxMenu) _ctxMenu.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') _ctxMenu.hidden = true; });

  document.addEventListener('poi:menu', e => {
    const { id, anchor } = e.detail;
    _ctxPoiId = id;
    const rect = anchor.getBoundingClientRect();

    _ctxMenu.hidden = false;
    _ctxMenu.style.top  = (rect.bottom + 4) + 'px';
    _ctxMenu.style.left = rect.right + 'px';

    requestAnimationFrame(() => {
      const mw = _ctxMenu.offsetWidth;
      let left = rect.right - mw;
      if (left < 8) left = 8;
      _ctxMenu.style.left = left + 'px';
    });
  });
}

function showTooltip(item) {
  clearTimeout(_hideTimer);
  _activeItem = item;

  const rect = item.getBoundingClientRect();
  _tooltip.textContent = item.dataset.tooltip;

  // Aparece encima del item, desde la mitad horizontal hacia la derecha
  _tooltip.style.left = (rect.left + rect.width / 2) + 'px';
  _tooltip.style.top  = (rect.top - 6) + 'px';
  _tooltip.classList.add('visible');

  // Ajusta si desborda el borde derecho del viewport
  requestAnimationFrame(() => {
    const ttRect = _tooltip.getBoundingClientRect();
    if (ttRect.right > window.innerWidth) {
      _tooltip.style.left = (window.innerWidth - ttRect.width - 12) + 'px';
    }
  });

  _hideTimer = setTimeout(() => {
    _tooltip.classList.remove('visible');
    _activeItem = null;
  }, 3000);
}

function initTooltip() {
  if (_tooltip) return;

  _tooltip = document.createElement('div');
  _tooltip.id = 'poi-tooltip';
  _tooltip.setAttribute('role', 'tooltip');
  _tooltip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(_tooltip);

  poiList.addEventListener('mouseover', e => {
    const item = e.target.closest('[data-tooltip]');
    if (!item || item === _activeItem) return;
    const nameEl = item.querySelector('.poi-item-name');
    if (!nameEl || nameEl.scrollWidth <= nameEl.offsetWidth) return;
    showTooltip(item);
  });

  poiList.addEventListener('mouseout', e => {
    const item = e.target.closest('[data-tooltip]');
    if (!item) return;
    if (item.contains(e.relatedTarget)) return; // sigue dentro del mismo item
    clearTimeout(_hideTimer);
    _tooltip.classList.remove('visible');
    _activeItem = null;
  });

  poiList.addEventListener('touchstart', e => {
    const item = e.target.closest('[data-tooltip]');
    if (!item) return;
    const nameEl = item.querySelector('.poi-item-name');
    if (!nameEl || nameEl.scrollWidth <= nameEl.offsetWidth) return;
    showTooltip(item);
  }, { passive: true });
}

export function renderizarListaPoi() {
  poiList.innerHTML = '';

  POIS.forEach(poi => {
    const li = document.createElement('li');
    li.className = 'poi-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Ver información sobre ${poi.nombre}`);
    li.dataset.id = poi.id;
    li.dataset.tooltip = poi.nombre;

    li.innerHTML = `
      <span class="poi-item-emoji" aria-hidden="true">${poi.emoji}</span>
      <div class="poi-item-info">
        <div class="poi-item-name">${poi.nombre}</div>
        <div class="poi-item-type">${poi.categoria}</div>
        <div class="poi-item-distance" id="dist-${poi.id}" hidden></div>
      </div>
    `;

    if (poi.id.startsWith('poi-')) {
      const menuBtn = document.createElement('button');
      menuBtn.className = 'poi-menu-btn';
      menuBtn.type = 'button';
      menuBtn.setAttribute('aria-label', 'Opciones');
      menuBtn.textContent = '⋮';
      menuBtn.addEventListener('click', e => {
        e.stopPropagation();
        document.dispatchEvent(new CustomEvent('poi:menu', {
          detail: { id: poi.id, anchor: menuBtn }
        }));
      });
      li.appendChild(menuBtn);
    }

    li.addEventListener('click', () => seleccionarPoi(poi.id));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seleccionarPoi(poi.id);
      }
    });

    poiList.appendChild(li);
  });

  initTooltip();
  initContextMenu();
}

export function seleccionarPoi(id) {
  const poi = POIS.find(item => item.id === id);
  if (!poi) return;

  state.poiActivo = poi;

  document.querySelectorAll('.poi-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });

  document.querySelectorAll('.map-marker').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });

  detailTitle.textContent = poi.nombre;
  detailDesc.textContent = poi.descripcion;
  detailCategory.textContent = poi.categoria;
  detailCoords.textContent = `${poi.lat.toFixed(4)}°N, ${poi.lng.toFixed(4)}°O`;

  const esNearby = state.nearbyPois.has(poi.id);
  if (esNearby) {
    proximityMsg.textContent = `¡Estás cerca de ${poi.nombre}!`;
    proximityAlert.hidden = false;
  } else {
    proximityAlert.hidden = true;
  }

  detailEmpty.style.display = 'none';
  detailContent.style.display = 'block';
  detailEmpty.hidden = true;
  detailContent.hidden = false;

  cargarMedia(poi);

  const playerSection = document.querySelector('.player-section');
  if (playerSection) {
    playerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
