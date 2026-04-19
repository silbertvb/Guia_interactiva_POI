/**
 * data.js — Datos de los puntos de interés (POI) de Madrid.
 *
 * Este módulo exporta el catálogo de lugares con su metadata,
 * coordenadas geográficas y rutas a los recursos multimedia.
 */
'use strict';

export const POIS = [
  {
    id: 'piano-mozart',
    nombre: 'Concierto de Piano — Madrid (Teatro Real)',
    categoria: 'Música clásica',
    emoji: '🎹',
    descripcion:
      'Una pieza atemporal de Wolfgang Amadeus Mozart interpretada al piano. La música clásica vienesa del siglo XVIII en su máxima expresión, con melodías que han perdurado más de dos siglos.',
    lat: 40.4170,
    lng: -3.7098,
    media: { tipo: 'audio', src: 'audio/piano_mozart.mp3' }
  },
  {
    id: 'bossa-nova',
    nombre: 'Bossa Nova - Barcelona (Samba Brasil)',
    categoria: 'Música del mundo',
    emoji: '🎸',
    descripcion:
      'El ritmo característico de la Bossa Nova brasileña, nacida en Río de Janeiro a finales de los años 50. Una fusión de samba y jazz que conquistó el mundo entero.',
    lat: 41.3810,
    lng: 2.1665,
    media: { tipo: 'audio', src: 'audio/viva-brazil-bossa-nova.mp3' }
  },
  {
    id: 'atardecer-mar',
    nombre: 'Atardecer en el Mar (Menorca)',
    categoria: 'Paisaje natural',
    emoji: '🌅',
    descripcion:
      'Una grabación del espectacular atardecer sobre el horizonte marino. Los últimos rayos de sol tiñendo el mar de tonos naranja y dorado en un momento de paz absoluta.',
    lat: 39.8875,
    lng: 4.2500,
    media: { tipo: 'video', src: 'video/Atardecer_en_el_mar.mp4' }
  },
  {
    id: 'domingo-golf',
    nombre: 'Domingo de Golf (Adeje Golf-Tenerife)',
    categoria: 'Deporte y naturaleza',
    emoji: '⛳',
    descripcion:
      'Una tarde tranquila en el campo de golf rodeado de naturaleza. El verde del césped, el silencio del entorno y la concentración del juego hacen de este deporte una experiencia única.',
    lat: 28.0810,
    lng: -16.7280,
    media: { tipo: 'video', src: 'video/Domingo_de_golf.mp4' }
  }
];
