/**
 * miniMap.js — Mini-mapa real de los POI.
 *
 * Usa Leaflet para mostrar un mapa real con marcadores en las ubicaciones
 * reales de los puntos de interés y la posición del usuario.
 */
'use strict';

import { POIS } from './data.js';
import { seleccionarPoi } from './ui.js';
import * as dom from './dom.js';
import { state } from './state.js';

let map = null;
let userMarker = null;
let poiMarkers = {};

function initializeMap() {
  dom.miniMap.innerHTML = '';
  const mapEl = document.createElement('div');
  mapEl.id = 'leafletMap';
  mapEl.style.height = '100%';
  dom.miniMap.appendChild(mapEl);

  if (map) {
    map.off();
    map.remove();
    map = null;
    userMarker = null;
    poiMarkers = {};
  }

  map = L.map(mapEl, {
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 2,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  return map;
}

function getPoiLatLngs() {
  return POIS.map(poi => [poi.lat, poi.lng]);
}

export function renderizarMiniMapa() {
  if (typeof L === 'undefined') return;

  initializeMap();

  const bounds = getPoiLatLngs();
  const group = L.featureGroup();

  POIS.forEach(poi => {
    const marker = L.marker([poi.lat, poi.lng], {
      title: poi.nombre
    }).addTo(map);

    marker.bindPopup(`<strong>${poi.nombre}</strong><br>${poi.categoria}`);
    marker.on('click', () => seleccionarPoi(poi.id));
    poiMarkers[poi.id] = marker;
    group.addLayer(marker);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 6 });
  } else {
    map.setView([40.4168, -3.7038], 5);
  }

  if (state.userLat !== null && state.userLng !== null) {
    actualizarUsuarioEnMapa();
  }
}

export function actualizarMarcadorMapa(poi) {
  if (!map || typeof L === 'undefined') return;
  const marker = poiMarkers[poi.id];
  if (!marker) return;
  marker.setLatLng([poi.lat, poi.lng]);
  marker.setPopupContent(`<strong>${poi.nombre}</strong><br>${poi.categoria}`);
}

export function agregarMarcadorMapa(poi) {
  if (!map || typeof L === 'undefined') return;
  const marker = L.marker([poi.lat, poi.lng], { title: poi.nombre }).addTo(map);
  marker.bindPopup(`<strong>${poi.nombre}</strong><br>${poi.categoria}`);
  marker.on('click', () => seleccionarPoi(poi.id));
  poiMarkers[poi.id] = marker;
}

export function actualizarUsuarioEnMapa() {
  if (!map || state.userLat === null || state.userLng === null) return;

  const latlng = [state.userLat, state.userLng];

  if (userMarker) {
    userMarker.setLatLng(latlng);
  } else {
    userMarker = L.circleMarker(latlng, {
      radius: 7,
      color: '#5b9bd5',
      fillColor: '#5b9bd5',
      fillOpacity: 0.9,
      weight: 2
    }).addTo(map);
  }
}
