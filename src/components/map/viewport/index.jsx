import { useEffect, useState } from 'react';
import { useMapbox } from '../../../context/mapContext';
import { isFeatureWithinBounds } from '../utils/index';
import { ZOOM_LEVEL_MARGIN } from '../utils/constants';

export function MapViewPortComponent({
  filteredVizItems,
  setVisualizationLayers,
  handleZoomOutEvent,
  fromSearch,
}) {
  const { map } = useMapbox();
  const [initialValues, setInitialValues] = useState(filteredVizItems);

  useEffect(() => {
    if (filteredVizItems) {
      const values = Object.values(filteredVizItems);
      setInitialValues(values);
    } else {
      setInitialValues([]);
    }
  }, [filteredVizItems]);

  const findAllLayersInsideViewport = (map, initialValues) => {
    const bounds = map.getBounds();
    const itemsInsideZoomedRegion = initialValues?.filter((value) =>
      isFeatureWithinBounds(value?.polygonGeometry, bounds)
    );
    setVisualizationLayers(itemsInsideZoomedRegion);
  };

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= ZOOM_LEVEL_MARGIN && !fromSearch) {
        findAllLayersInsideViewport(map, initialValues);
      } else {
        handleZoomOutEvent(zoom);
      }
    };
    if (initialValues?.length) {
      handleViewportChange();
    }
  }, [initialValues, fromSearch]);

  useEffect(() => {
    if (!map) return;
    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= ZOOM_LEVEL_MARGIN) {
        if (!fromSearch) {
          findAllLayersInsideViewport(map, initialValues);
        }
      } else {
        handleZoomOutEvent(zoom);
      }
    };

    // Wait for style to load before adding listeners
    map.on('zoomend', handleViewportChange);
    map.on('dragend', handleViewportChange);
    // map.on('moveend', handleViewportChange);

    return () => {
      map.off('zoomend', handleViewportChange);
      map.off('dragend', handleViewportChange);
      // map.on('moveend', handleViewportChange);
    };
  }, [map, initialValues, fromSearch]);

  return null;
}
