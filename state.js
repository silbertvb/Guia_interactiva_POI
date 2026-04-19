/**
 * state.js — Estado compartido de la aplicación.
 *
 * Mantiene el estado centralizado de la aplicación, incluyendo el POI
 * activo, el elemento multimedia actual, la posición del usuario y el
 * watcher de geolocalización.
 */
'use strict';

export const state = {
  poiActivo: null,
  mediaElement: null,
  watchId: null,
  userLat: null,
  userLng: null,
  nearbyPois: new Set(),
  PROXIMITY_M: 500
};
