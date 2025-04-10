import { useEffect } from 'react';

import { useMapbox } from '../../../context/mapContext';

/**
 * MapZoom Component
 *
 * Smoothly zooms and pans the Mapbox map when `zoomLocation` or `zoomLevel` changes.
 * Uses `map.flyTo()` for a smooth animation effect.
 *
 * @param {Object} props
 * @param {[number, number]} props.zoomLocation - Target map center as [longitude, latitude].
 * @param {number|null} props.zoomLevel - Target zoom level. If null, uses default 8.5.
 *
 * @returns {null} This component does not render any DOM.
 */
export const MapZoom = ({ zoomLocation, zoomLevel }) => {
  const { map } = useMapbox();

  useEffect(() => {
    if (!map || !zoomLocation.length) return;

    const [lon, lat] = zoomLocation;
    map.flyTo({
      center: [lon, lat], // Replace with the desired latitude and longitude
      offset: zoomLevel ? [0, 0] : [-250, 0],
      zoom: zoomLevel ? zoomLevel : 8.5,
    });
  }, [map, zoomLevel, zoomLocation]);

  return null;
};
