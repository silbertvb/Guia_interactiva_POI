/**
 * permissions.js — Gestión de estado y errores de geolocalización.
 *
 * Agrupa funciones que actualizan la interfaz cuando el permiso de
 * ubicación cambia o cuando ocurre un error durante la obtención de la
 * posición.
 */
'use strict';

import {
  geoDot,
  geoLabel,
  geoErrorBanner,
  geoErrorMsg,
  btnRetry
} from './dom.js';

export function actualizarEstadoGeo(estado, texto) {
  geoDot.className = `geo-dot ${estado}`;
  geoLabel.textContent = texto;
}

export function mostrarErrorGeo(mensaje, mostrarBoton) {
  geoErrorMsg.textContent = mensaje;
  btnRetry.hidden = !mostrarBoton;
  geoErrorBanner.hidden = false;
}

export function ocultarErrorGeo() {
  geoErrorBanner.hidden = true;
}
