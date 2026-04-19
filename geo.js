/**
 * geo.js — Lógica de geolocalización y proximidad.
 *
 * Controla el watcher de posición del navegador, calcula distancias entre
 * el usuario y los POI, y actualiza los estados de proximidad.
 */
'use strict';

import { POIS } from './data.js';
import { state } from './state.js';
import { haversineMetros } from './utils.js';
import {
  btnGeo,
  btnRetry,
  poiList,
  miniMap
} from './dom.js';
import {
  actualizarEstadoGeo,
  mostrarErrorGeo,
  ocultarErrorGeo
} from './permissions.js';
import { actualizarUsuarioEnMapa } from './miniMap.js';

export function iniciarGeolocalizacion() {
  if (!('geolocation' in navigator)) {
    mostrarErrorGeo(
      'Tu navegador no es compatible con la geolocalización. Prueba con Firefox, Chrome o Edge en su versión actual.',
      false
    );
    return;
  }

  actualizarEstadoGeo('loading', 'Obteniendo ubicación…');
  btnGeo.disabled = true;

  const opciones = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 5000
  };

  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
  }

  state.watchId = navigator.geolocation.watchPosition(
    onPosicionObtenida,
    onErrorGeo,
    opciones
  );
}

function onPosicionObtenida(position) {
  state.userLat = position.coords.latitude;
  state.userLng = position.coords.longitude;
  const precision = Math.round(position.coords.accuracy);

  actualizarEstadoGeo('active', `Ubicación activa (±${precision}m)`);
  ocultarErrorGeo();
  calcularProximidades();
  actualizarUsuarioEnMapa();
}

function onErrorGeo(error) {
  btnGeo.disabled = false;

  if (state.watchId !== null) {
    navigator.geolocation.clearWatch(state.watchId);
    state.watchId = null;
  }

  let mensaje;
  switch (error.code) {
    case error.PERMISSION_DENIED:
      mensaje =
        'Has denegado el acceso a tu ubicación. Para activarla, cambia los permisos de localización en la configuración de tu navegador y vuelve a pulsar "Detectar mi ubicación".';
      actualizarEstadoGeo('error', 'Permiso denegado');
      break;
    case error.POSITION_UNAVAILABLE:
      mensaje =
        'No se puede determinar tu posición en este momento. Puede deberse a una señal GPS insuficiente o a restricciones del entorno. Inténtalo de nuevo.';
      actualizarEstadoGeo('error', 'Posición no disponible');
      break;
    case error.TIMEOUT:
      mensaje =
        'La solicitud de ubicación tardó demasiado tiempo. Comprueba tu conexión a internet o la señal GPS y vuelve a intentarlo.';
      actualizarEstadoGeo('error', 'Tiempo agotado');
      break;
    default:
      mensaje = 'Ocurrió un error desconocido al obtener la ubicación.';
      actualizarEstadoGeo('error', 'Error de ubicación');
  }

  mostrarErrorGeo(mensaje, true);
}

export function calcularProximidades() {
  if (state.userLat === null || state.userLng === null) return;

  state.nearbyPois.clear();

  POIS.forEach(poi => {
    const distancia = haversineMetros(state.userLat, state.userLng, poi.lat, poi.lng);
    const esCercano = distancia <= state.PROXIMITY_M;
    const distEl = document.getElementById(`dist-${poi.id}`);

    if (distEl) {
      distEl.hidden = false;
      distEl.textContent = distancia < 1000
        ? `${Math.round(distancia)} m`
        : `${(distancia / 1000).toFixed(1)} km`;
    }

    const item = poiList.querySelector(`[data-id="${poi.id}"]`);
    const marker = miniMap.querySelector(`.map-marker[data-id="${poi.id}"]`);

    if (esCercano) {
      state.nearbyPois.add(poi.id);
      item?.classList.add('nearby');
      marker?.classList.add('nearby');
      if (item && !item.querySelector('.nearby-badge')) {
        const badge = document.createElement('span');
        badge.className = 'nearby-badge';
        badge.textContent = 'Cerca';
        badge.setAttribute('aria-label', `${poi.nombre} está cerca de ti`);
        item.appendChild(badge);
      }
    } else {
      item?.classList.remove('nearby');
      marker?.classList.remove('nearby');
      item?.querySelector('.nearby-badge')?.remove();
    }
  });

  if (state.poiActivo) {
    const esNearby = state.nearbyPois.has(state.poiActivo.id);
    const proximityAlert = document.getElementById('proximityAlert');
    const proximityMsg = document.getElementById('proximityMsg');

    if (esNearby) {
      proximityMsg.textContent = `¡Estás cerca de ${state.poiActivo.nombre}!`;
      proximityAlert.hidden = false;
    } else {
      proximityAlert.hidden = true;
    }
  }
}

export function initGeoListeners() {
  btnGeo.addEventListener('click', () => {
    iniciarGeolocalizacion();
  });

  btnRetry.addEventListener('click', () => {
    ocultarErrorGeo();
    iniciarGeolocalizacion();
  });
}
