import { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import { useMapbox } from '../../../context/mapContext';
import './index.css';
/*
  Add marker on map
  @param {STACItem} vizItems   - An array of stac items which are to be rendered as markers
  @param {function} onSelectVizItem  - function to execute when the marker is clicked . will provide vizItemId as a parameter to the callback
*/

// eslint-disable-next-line prettier/prettier
export const MarkerFeature = ({ vizItems, onSelectVizItem }) => {
  const { map } = useMapbox();
  const [markersVisible, setMarkersVisible] = useState(true);

  useEffect(() => {
    if (!map || !vizItems.length) return;

    const plottedMarkers = vizItems.map((item) => {
      const { lon, lat, plumeProperties } = item;
      const { location, utcTimeObserved, plumeId } = plumeProperties;

      const marker = addMarker(map, lon, lat);
      const popup = getPopup(location, utcTimeObserved, plumeId);
      marker.setPopup(popup);
      const mel = marker.getElement();

      const handleClick = () => onSelectVizItem && onSelectVizItem(item.id);
      const handleMouseEnter = () => {
        popup.addTo(map);
      };
      const handleMouseLeave = () => {
        // onHoverVizItem && onHoverVizItem(item.id);
        popup.remove();
      };

      mel.addEventListener('click', handleClick);
      mel.addEventListener('mouseenter', handleMouseEnter);
      mel.addEventListener('mouseleave', handleMouseLeave);

      mel.style.display = markersVisible ? 'block' : 'none';
      return { mel, handleClick, handleMouseLeave, handleMouseEnter };
    });

    // clean-upss
    return () => {
      plottedMarkers.forEach(
        ({ mel, handleClick, handleMouseLeave, handleMouseEnter }) => {
          mel.removeEventListener('click', handleClick);
          mel.removeEventListener('mouseenter', handleMouseEnter);
          mel.removeEventListener('mouseleave', handleMouseLeave);
          mel.parentNode.removeChild(mel);
        }
      );
    };
  }, [vizItems, map, onSelectVizItem, markersVisible]);

  useEffect(() => {
    if (!map) return;

    const threshold = 8;
    map.on('zoom', () => {
      const currentZoom = map.getZoom();
      if (currentZoom <= threshold) {
        setMarkersVisible(true);
      } else {
        setMarkersVisible(false);
      }
    });
  }, [map]);

  return null;
};

const getPopup = (location, utcTimeObserved, id) => {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
  }).setHTML(getPopupContent(location, utcTimeObserved, id));
  return popup;
};

const addMarker = (map, longitude, latitude) => {
  const el = document.createElement('div');
  el.className = 'marker';
  const markerColor = '#00b7eb';
  el.innerHTML = getMarkerSVG(markerColor);
  let marker = new mapboxgl.Marker(el)
    .setLngLat([longitude, latitude])
    .addTo(map);
  return marker;
};

export const getPopupContent = (location, utcTimeObserved, id) => {
  return `
        <table style="line-height: 1.4; font-size: 11px;">
            <tr><td><strong>ID:</strong></td><td>${id}</td></tr>
            <tr><td><strong>Location:</strong></td><td>${location}</td></tr>
            <tr><td><strong>Date:</strong></td><td>${utcTimeObserved}</td></tr>
        </table>
    `;
};

const getMarkerSVG = (color, strokeColor = '#000000') => {
  return `
        <svg fill="${color}" width="30px" height="30px" viewBox="-51.2 -51.2 614.40 614.40" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="${strokeColor}"
                stroke-width="10.24">
                <path
                    d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
            </g>
            <g id="SVGRepo_iconCarrier">
                <path
                    d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
            </g>
        </svg>`;
};
