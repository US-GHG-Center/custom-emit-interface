import { useEffect } from 'react';
import { useMapbox } from '../../../context/mapContext';
import { addCoveragePolygon, layerExists, sourceExists } from '../utils';

/**
 * CoverageLayers Component
 *
 * React component that adds a coverage polygon layer to a Mapbox map instance
 * when the `coverage` GeoJSON data is available. Automatically removes the
 * layer and source on component unmount or coverage update.
 *
 * @param {Object} props
 * @param {CoverageGeoJsonData} props.coverage - GeoJSON data representing coverage polygons.
 *
 * @returns {null} This component does not render any DOM elements.
 */

export const CoverageLayers = ({ coverage }) => {
  const { map } = useMapbox();
  const layerId = 'coverage';
  useEffect(() => {
    if (!map || !coverage?.features?.length) return;

    addCoveragePolygon(map, layerId, layerId, coverage);
    return () => {
      if (map) {
        if (layerExists(map, layerId)) map.removeLayer(layerId);
        if (sourceExists(map, layerId)) map.removeSource(layerId);
      }
    };
  }, [map, coverage]);
  return null;
};
