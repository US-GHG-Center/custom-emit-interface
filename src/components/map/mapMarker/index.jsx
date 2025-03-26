import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import './index.css';

/*
  Add marker on map
  @param {STACItem} vizItems   - An array of stac items which are to be rendered as markers
  @param {function} onSelectVizItem  - function to execute when the marker is clicked . will provide vizItemId as a parameter to the callback
*/

export const MarkerFeature = ({ vizItems, onSelectVizItem }) => {
  const { map } = useMapbox();
  const [markersVisible, setMarkersVisible] = useState(true);

  // Use ref to track markers for proper cleanup
  const markersRef = useRef([]);

  // Memoize marker creation to prevent unnecessary re-renders
  const createMarker = useCallback(
    (item) => {
      const { lon, lat, id } = item;
      const el = document.createElement('div');
      el.className = 'marker';
      const markerColor = '#00b7eb';
      el.innerHTML = getMarkerSVG(markerColor);

      const marker = new mapboxgl.Marker(el).setLngLat([lon, lat]).addTo(map);

      const markerElement = marker.getElement();

      const handleClick = (e) => {
        e.stopPropagation();
        onSelectVizItem && onSelectVizItem(id);
      };

      markerElement.addEventListener('click', handleClick);

      return {
        marker,
        element: markerElement,
        clickHandler: handleClick,
        id,
      };
    },
    [map, onSelectVizItem]
  );

  // Main markers effect
  useEffect(() => {
    if (!map || !vizItems.length) return;

    // Create new markers
    const newMarkers = vizItems.map(createMarker);

    // Update visibility
    newMarkers.forEach(({ element }) => {
      element.style.display = markersVisible ? 'block' : 'none';
    });

    // Cleanup previous markers
    markersRef.current.forEach(({ marker, element, clickHandler }) => {
      element.removeEventListener('click', clickHandler);
      marker.remove();
    });

    // Update markers ref
    markersRef.current = newMarkers;

    // Cleanup function
    return () => {
      newMarkers.forEach(({ marker, element, clickHandler }) => {
        element.removeEventListener('click', clickHandler);
        marker.remove();
      });
      markersRef.current = [];
    };
  }, [vizItems, map, createMarker, markersVisible]);

  // Zoom-based visibility effect
  useEffect(() => {
    if (!map) return;

    const handleZoom = () => {
      const currentZoom = map.getZoom();
      const threshold = 8;
      setMarkersVisible(currentZoom <= threshold);
    };

    // Add zoom event listener
    map.on('zoom', handleZoom);

    // Cleanup zoom event listener
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map]);

  return null;
};

// Marker SVG generation function
const getMarkerSVG = (color, strokeColor = '#000000') => {
  return `
    <svg fill="${color}" width="30px" height="30px" viewBox="-51.2 -51.2 614.40 614.40" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
      <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="${strokeColor}" stroke-width="10.24">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
      </g>
      <g id="SVGRepo_iconCarrier">
        <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"></path>
      </g>
    </svg>`;
};
