/**
 * app.js — Módulo principal de arranque de la Guía Interactiva.
 *
 * Este módulo inicia la aplicación cargando la lista de POI,
 * renderizando el mini-mapa, inicializando los controles del
 * reproductor y configurando los listeners de geolocalización.
 */
'use strict';

import { renderizarListaPoi } from './ui.js';
import { renderizarMiniMapa } from './miniMap.js';
import { initPlayerControls } from './player.js';
import { initGeoListeners } from './geo.js';
import { footerYear } from './dom.js';

export function init() {
  footerYear.textContent = new Date().getFullYear();
  renderizarListaPoi();
  renderizarMiniMapa();
  initPlayerControls();
  initGeoListeners();
}

init();
