/**
 * dom.js — Referencias globales al DOM.
 *
 * Centraliza las selecciones de elementos HTML utilizados por los
 * distintos módulos de la aplicación, evitando búsquedas repetidas.
 */
'use strict';

export const poiList        = document.getElementById('poiList');
export const detailEmpty    = document.getElementById('detailEmpty');
export const detailContent  = document.getElementById('detailContent');
export const detailTitle    = document.getElementById('detailTitle');
export const detailDesc     = document.getElementById('detailDesc');
export const detailCategory = document.getElementById('detailCategory');
export const detailCoords   = document.getElementById('detailCoords');
export const mediaContainer = document.getElementById('mediaContainer');
export const playerTypeIcon = document.getElementById('playerTypeIcon');
export const playerTypeLabel= document.getElementById('playerTypeLabel');
export const proximityAlert = document.getElementById('proximityAlert');
export const proximityMsg   = document.getElementById('proximityMsg');

export const btnPlayPause  = document.getElementById('btnPlayPause');
export const btnStop       = document.getElementById('btnStop');
export const playIcon      = document.getElementById('playIcon');
export const progressFill  = document.getElementById('progressFill');
export const progressBar   = document.getElementById('progressBar');
export const timeElapsed   = document.getElementById('timeElapsed');
export const timeDuration  = document.getElementById('timeDuration');
export const volumeSlider  = document.getElementById('volumeSlider');
export const volumeIcon    = document.getElementById('volumeIcon');

export const geoStatus      = document.getElementById('geoStatus');
export const geoDot         = document.getElementById('geoDot');
export const geoLabel       = document.getElementById('geoLabel');
export const geoErrorBanner = document.getElementById('geoErrorBanner');
export const geoErrorMsg    = document.getElementById('geoErrorMsg');
export const btnGeo         = document.getElementById('btnGeo');
export const btnRetry       = document.getElementById('btnRetry');
export const miniMap        = document.getElementById('miniMap');

export const footerYear     = document.getElementById('footerYear');
