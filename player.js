/**
 * player.js — Controlador del reproductor multimedia.
 *
 * Gestiona la creación dinámica de los elementos <audio> y <video>, el
 * enlace con los controles personalizados y los eventos de reproducción.
 */
'use strict';

import { state } from './state.js';
import { formatTime } from './utils.js';
import {
  mediaContainer,
  playerTypeIcon,
  playerTypeLabel,
  btnPlayPause,
  btnStop,
  playIcon,
  progressFill,
  progressBar,
  timeElapsed,
  timeDuration,
  volumeSlider,
  volumeIcon
} from './dom.js';

export function cargarMedia(poi) {
  if (state.mediaElement) {
    state.mediaElement.pause();
    state.mediaElement.src = '';
    state.mediaElement.load();
    state.mediaElement = null;
  }

  mediaContainer.innerHTML = '';

  if (!poi.media) {
    playerTypeIcon.textContent = '📌';
    playerTypeLabel.textContent = 'Sin multimedia';
    resetearUIReproductor();
    return;
  }

  const { tipo, src } = poi.media;

  if (tipo === 'imagen') {
    const img = document.createElement('img');
    img.src = src;
    img.className = 'media-image';
    img.alt = poi.nombre;
    playerTypeIcon.textContent = '🖼️';
    playerTypeLabel.textContent = 'Imagen del lugar';
    mediaContainer.appendChild(img);
    resetearUIReproductor();
    return;
  }

  const elemento = tipo === 'video'
    ? document.createElement('video')
    : document.createElement('audio');

  if (tipo === 'video') {
    elemento.poster = '';
    playerTypeIcon.textContent = '🎬';
    playerTypeLabel.textContent = 'Guía en vídeo';
  } else {
    playerTypeIcon.textContent = '🎧';
    playerTypeLabel.textContent = 'Guía de audio';
  }

  elemento.src = src;
  elemento.preload = 'metadata';
  elemento.volume = Number(volumeSlider.value);
  elemento.setAttribute('aria-label', `Guía multimedia de ${poi.nombre}`);

  state.mediaElement = elemento;
  vincularEventosMedia();
  mediaContainer.appendChild(elemento);
  resetearUIReproductor();
}

function vincularEventosMedia() {
  if (!state.mediaElement) return;

  state.mediaElement.addEventListener('timeupdate', () => {
    if (!state.mediaElement.duration) return;
    const pct = (state.mediaElement.currentTime / state.mediaElement.duration) * 100;
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute('aria-valuenow', Math.round(pct));
    timeElapsed.textContent = formatTime(state.mediaElement.currentTime);
  });

  state.mediaElement.addEventListener('loadedmetadata', () => {
    timeDuration.textContent = formatTime(state.mediaElement.duration);
  });

  state.mediaElement.addEventListener('play', () => {
    playIcon.textContent = '⏸';
  });

  state.mediaElement.addEventListener('pause', () => {
    playIcon.textContent = '▶';
  });

  state.mediaElement.addEventListener('ended', () => {
    playIcon.textContent = '▶';
    progressFill.style.width = '0%';
    timeElapsed.textContent = '0:00';
    if (state.mediaElement) state.mediaElement.currentTime = 0;
  });

  state.mediaElement.addEventListener('error', () => {
    timeDuration.textContent = 'Archivo de muestra';
    timeElapsed.textContent = '--:--';
    console.info(`[Media] Archivo no encontrado: ${state.mediaElement.src}.`);
  });
}

export function resetearUIReproductor() {
  playIcon.textContent = '▶';
  progressFill.style.width = '0%';
  timeElapsed.textContent = '0:00';
  timeDuration.textContent = '0:00';
  progressBar.setAttribute('aria-valuenow', 0);
}

export function initPlayerControls() {
  btnPlayPause.addEventListener('click', () => {
    if (!state.mediaElement) return;
    if (state.mediaElement.paused) {
      state.mediaElement.play().catch(err => {
        console.warn('[Media] No se pudo iniciar la reproducción:', err.message);
      });
    } else {
      state.mediaElement.pause();
    }
  });

  btnStop.addEventListener('click', () => {
    if (!state.mediaElement) return;
    state.mediaElement.pause();
    state.mediaElement.currentTime = 0;
    playIcon.textContent = '▶';
  });

  progressBar.addEventListener('click', e => {
    if (!state.mediaElement || !state.mediaElement.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    state.mediaElement.currentTime = ratio * state.mediaElement.duration;
  });

  volumeSlider.addEventListener('input', () => {
    if (!state.mediaElement) return;
    state.mediaElement.volume = Number(volumeSlider.value);
    actualizarIconoVolumen(Number(volumeSlider.value));
  });

  volumeIcon.addEventListener('click', () => {
    if (!state.mediaElement) return;
    state.mediaElement.muted = !state.mediaElement.muted;
    volumeSlider.value = state.mediaElement.muted ? 0 : state.mediaElement.volume;
    actualizarIconoVolumen(state.mediaElement.muted ? 0 : state.mediaElement.volume);
  });
}

function actualizarIconoVolumen(nivel) {
  if (nivel <= 0) volumeIcon.textContent = '🔇';
  else if (nivel < 0.4) volumeIcon.textContent = '🔈';
  else if (nivel < 0.7) volumeIcon.textContent = '🔉';
  else volumeIcon.textContent = '🔊';
}
