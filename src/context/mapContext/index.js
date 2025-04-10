import React, { createContext, useContext, useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxContext = createContext();

const accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const mapboxStyleBaseUrl = process.env.REACT_APP_MAPBOX_STYLE_URL;
const BASEMAP_STYLES_MAPBOX_ID =
  process.env.REACT_APP_BASEMAP_STYLES_MAPBOX_ID || 'cldu1cb8f00ds01p6gi583w1m';

/**
 * MapboxProvider
 *
 * React Context Provider that initializes a Mapbox GL map instance
 * and makes it available to child components via `useMapbox` hook.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - React children that will have access to the map context.
 *
 * @returns {JSX.Element}
 */
export const MapboxProvider = ({ children }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;

    let mapboxStyleUrl = 'mapbox://styles/mapbox/streets-v12';
    if (mapboxStyleBaseUrl) {
      mapboxStyleUrl = `${mapboxStyleBaseUrl}/${BASEMAP_STYLES_MAPBOX_ID}`;
    }

    // Set Mapbox access token
    mapboxgl.accessToken = accessToken;
    // Initialize map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapboxStyleUrl,
      center: [-98.771556, 32.967243], // Centered on the US
      zoom: 4,
      projection: 'equirectangular',
      options: {
        trackResize: true,
      },
    });
    // Disable rotation interactions
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    // Cleanup map instance on unmount
    return () => map.current.remove();
  }, []);

  return (
    <MapboxContext.Provider value={{ map: map.current }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {children}
    </MapboxContext.Provider>
  );
};

export const useMapbox = () => useContext(MapboxContext);
