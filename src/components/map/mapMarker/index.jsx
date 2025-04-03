import React, { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import './index.css';

export const MarkerFeature = ({
  vizItems,
  onSelectVizItem,
  getPopupContent,
}) => {
  const { map } = useMapbox();
  const [markersVisible, setMarkersVisible] = useState(true);
  const markersRef = useRef([]);

  // Memoized marker creation function
  const createMarker = useCallback(
    (item) => {
      const { lon, lat, id } = item;
      const markerColor = '#00b7eb';

      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      el.innerHTML = getMarkerSVG(markerColor);

      // Create Mapbox marker
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'top',
      }).setLngLat([lon, lat]);

      // Create popup if content provided
      const popup = getPopupContent
        ? new mapboxgl.Popup({
            offset: 5,
            closeButton: false,
            closeOnClick: false,
          }).setHTML(getPopupContent(item))
        : undefined;

      // Event handlers
      const handleMouseEnter = () => {
        if (popup) {
          marker.setPopup(popup).togglePopup();
        }
      };

      const handleMouseLeave = () => {
        if (popup) {
          popup.remove();
        }
      };

      const handleClick = (e) => {
        e.stopPropagation();
        onSelectVizItem && onSelectVizItem(id);
      };

      // Add event listeners
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
      el.addEventListener('click', handleClick);

      return { marker, element: el, popup, id };
    },
    [map, onSelectVizItem, getPopupContent]
  );

  // Markers management effect
  useEffect(() => {
    if (!map || !vizItems.length) return;

    // Clean up existing markers
    markersRef.current.forEach(({ marker, element, popup }) => {
      element.remove();
      marker.remove();
      popup?.remove();
    });

    // Create and add new markers
    const newMarkers = vizItems.map(createMarker);
    newMarkers.forEach(({ marker }) => marker.addTo(map));

    // Update markers visibility and ref
    newMarkers.forEach(({ element }) => {
      element.style.display = markersVisible ? 'block' : 'none';
    });
    markersRef.current = newMarkers;

    // Cleanup function
    return () => {
      newMarkers.forEach(({ marker, element, popup }) => {
        element.remove();
        marker.remove();
        popup?.remove();
      });
    };
  }, [vizItems, map, createMarker, markersVisible]);

  // Zoom-based visibility effect
  useEffect(() => {
    if (!map) return;

    const handleZoom = () => {
      const currentZoom = map.getZoom();
      setMarkersVisible(currentZoom <= 9);
    };

    map.on('zoom', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map]);

  return null;
};

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

export default MarkerFeature;
