import { useState, useEffect, useCallback, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapbox } from '../../../context/mapContext';
import './index.css';
import { ZOOM_LEVEL_MARGIN } from '../utils/constants';

/**
 * MarkerFeature React component for rendering interactive Mapbox markers.
 *
 * Displays custom-styled markers on a Mapbox map. Each marker represents a
 * data item with coordinates and shows a popup with info on hover.
 *
 * @param {Object[]} items - Array of marker data objects.
 * @param {string} items[].id - Unique ID for the marker.
 * @param {Object} items[].coordinates - Coordinate object containing lat/lon.
 * @param {number} items[].coordinates.lat - Latitude for the marker.
 * @param {number} items[].coordinates.lon - Longitude for the marker.
 * @param {Function} onSelectVizItem - Callback when a marker is clicked. Passes the marker ID.
 * @param {Function} getPopupContent - Callback that returns popup HTML string for a given item.
 *
 * @returns {null} This component renders directly on the map using Mapbox API.
 */
export const MarkerFeature = ({ items, onSelectVizItem, getPopupContent }) => {
  const { map } = useMapbox();
  const [markersVisible, setMarkersVisible] = useState(true);
  const markersRef = useRef([]);

  // Memoized marker creation function
  const createMarker = useCallback(
    (item) => {
      if (!map || !item?.coordinates?.lat || !item?.coordinates?.lon) {
        console.warn('Invalid map or coordinates:', { map, coordinates: item?.coordinates });
        return null;
      }

      const { coordinates, id } = item;
      const { lon, lat } = coordinates;
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
    if (!map || !items?.length) return;

    // Wait for map to be fully loaded
    if (!map.isStyleLoaded()) {
      map.once('style.load', () => {
        // Clean up existing markers
        markersRef.current.forEach(({ marker, element, popup }) => {
          if (marker && element) {
            element.remove();
            marker.remove();
            popup?.remove();
          }
        });

        // Create and add new markers
        const newMarkers = items.map(createMarker).filter(Boolean);
        newMarkers.forEach(({ marker }) => marker.addTo(map));

        // Update markers visibility and ref
        newMarkers.forEach(({ element }) => {
          if (element) {
            element.style.display = markersVisible ? 'block' : 'none';
          }
        });
        markersRef.current = newMarkers;
      });
      return;
    }

    // Clean up existing markers
    markersRef.current.forEach(({ marker, element, popup }) => {
      if (marker && element) {
        element.remove();
        marker.remove();
        popup?.remove();
      }
    });

    // Create and add new markers
    const newMarkers = items.map(createMarker).filter(Boolean);
    newMarkers.forEach(({ marker }) => marker.addTo(map));

    // Update markers visibility and ref
    newMarkers.forEach(({ element }) => {
      if (element) {
        element.style.display = markersVisible ? 'block' : 'none';
      }
    });
    markersRef.current = newMarkers;

    // Cleanup function
    return () => {
      newMarkers.forEach(({ marker, element, popup }) => {
        if (marker && element) {
          element.remove();
          marker.remove();
          popup?.remove();
        }
      });
    };
  }, [items, map, createMarker, markersVisible]);

  // Zoom-based visibility effect
  useEffect(() => {
    if (!map) return;

    const handleZoom = () => {
      const currentZoom = map.getZoom();
      setMarkersVisible(currentZoom <= ZOOM_LEVEL_MARGIN);
    };

    map.on('zoom', handleZoom);
    return () => {
      map.off('zoom', handleZoom);
    };
  }, [map]);

  return null;
};
/**
 * Returns an SVG string representing the visual icon for the marker.
 *
 * @param {string} color - Fill color for the marker.
 * @param {string} [strokeColor='#000000'] - Optional stroke color.
 * @returns {string} SVG string to be injected into the DOM.
 */
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
