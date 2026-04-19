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

export function renderizarListaPoi() {
  poiList.innerHTML = '';

  POIS.forEach(poi => {
    const li = document.createElement('li');
    li.className = 'poi-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `Ver información sobre ${poi.nombre}`);
    li.dataset.id = poi.id;

    li.innerHTML = `
      <span class="poi-item-emoji" aria-hidden="true">${poi.emoji}</span>
      <div class="poi-item-info">
        <div class="poi-item-name">${poi.nombre}</div>
        <div class="poi-item-type">${poi.categoria}</div>
        <div class="poi-item-distance" id="dist-${poi.id}" hidden></div>
      </div>
    `;

    li.addEventListener('click', () => seleccionarPoi(poi.id));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        seleccionarPoi(poi.id);
      }
    });

    poiList.appendChild(li);
  });
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
