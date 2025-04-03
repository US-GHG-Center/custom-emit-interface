import React, { useEffect, useState } from 'react';
import { useMapbox } from '../../../context/mapContext';
import { isFeatureWithinBounds, getLayerId, getSourceId } from '../utils/index';

export function MapViewPortComponent({
  filteredVizItems,
  setVisualizationLayers,
  setCurrentLayersInViewPort,
  setZoomLevel,
  setOpenDrawer,
  highlightedLayer,
  setZoomLocation,
  clickedOnLayer,
  hideLayers,
}) {
  const { map } = useMapbox();
  const [layersToRemove, setLayersToRemove] = useState([]);
  const [prevHighlightedLayer, setPrevHighlightedLayer] = useState('');

  const removeLayers = (layersToRemove) => {
    layersToRemove.forEach((vizItemId) => {
      const rasterSourceId = getSourceId('raster', vizItemId);
      const fillSourceId = getSourceId('fill', vizItemId);
      const fillLayerId = getLayerId('fill', vizItemId);
      const rasterLayerId = getLayerId('raster', vizItemId);
      const polygonSourceId = getSourceId('polygon', vizItemId);
      const polygonLayerId = getLayerId('polygon', vizItemId);

      if (map.getLayer(rasterLayerId)) map.removeLayer(rasterLayerId);
      if (map.getLayer(polygonLayerId)) map.removeLayer(polygonLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);

      if (map.getSource(rasterSourceId)) map.removeSource(rasterSourceId);
      if (map.getSource(polygonSourceId)) map.removeSource(polygonSourceId);
      if (map.getSource(fillSourceId)) map.removeSource(fillSourceId);
    });
  };

  const getRasterLayersInCurrentViewPort = (map) => {
    const bounds = map.getBounds();
    const itemsInsideZoomedRegion = Object.values(filteredVizItems)?.filter(
      (value) => isFeatureWithinBounds(value?.polygonGeometry, bounds)
    );
    // Get IDs of items currently in view
    const newLayerIds = new Set(itemsInsideZoomedRegion.map((item) => item.id));
    const currentLayersOnMap = map.getStyle()?.layers || [];

    const currentRasterLayersOnMap = currentLayersOnMap.filter((item) =>
      item?.id?.includes('raster-')
    );
    const currentLayerIds = new Set(
      currentRasterLayersOnMap.map((obj) => obj['id']?.split('-')[1])
    );
    return { newLayerIds, currentLayerIds, itemsInsideZoomedRegion };
  };

  const updateVisibleLayers = (map, filteredVizItems) => {
    if (!map || !filteredVizItems || !map.isStyleLoaded()) return;

    try {
      const { newLayerIds, currentLayerIds, itemsInsideZoomedRegion } =
        getRasterLayersInCurrentViewPort(map);
      // console.log({ currentLayerIds, itemsInsideZoomedRegion });
      // Find layers to add (in new but not in current)
      const layersToAdd = itemsInsideZoomedRegion.filter(
        (item) => !currentLayerIds.has(item.id)
      );

      // Find layers to remove (in current but not in new)
      const layersToRemove = [...currentLayerIds].filter(
        (id) => !newLayerIds.has(id)
      );

      // const remainingLayers = [...currentLayerIds].filter(
      //   (id) => !layersToRemove.has(id)
      // );
      // Only update if there are changes

      if (itemsInsideZoomedRegion?.length > 0) {
        setCurrentLayersInViewPort(itemsInsideZoomedRegion);
        // setOpenDrawer(true);
      } else {
        setCurrentLayersInViewPort([]);
        setOpenDrawer(false);
      }
      if (layersToRemove.length > 0) {
        setLayersToRemove(layersToRemove);
      } else {
        setLayersToRemove([]);
      }
      if (layersToAdd?.length > 0) {
        setVisualizationLayers(layersToAdd);
        // setOpenDrawer(true);
      } else {
        setVisualizationLayers([]);
      }
      const allLayers = map.getStyle()?.layers || [];
      const finalLayers = allLayers.filter(
        (item) =>
          item?.id?.includes('raster-') ||
          item?.id?.includes('fill-') ||
          item?.id?.includes('polygon-')
      );
      console.log({ finalLayers });
    } catch (error) {
      console.warn('Error updating visible layers:', error);
    }
  };

  useEffect(() => {
    if (highlightedLayer !== '') {
      const polygonId = getLayerId('polygon', highlightedLayer);
      const rasterId = getLayerId('raster', highlightedLayer);
      if (map.getLayer(polygonId))
        map.setPaintProperty(polygonId, 'line-width', 5);
      if (map.getLayer(rasterId)) map.moveLayer(rasterId, polygonId);
      setPrevHighlightedLayer(highlightedLayer);
    } else {
      if (prevHighlightedLayer !== '') {
        const polygonId = getLayerId('polygon', prevHighlightedLayer);
        if (map.getLayer(polygonId))
          map.setPaintProperty(polygonId, 'line-width', 2);
        setPrevHighlightedLayer('');
      }
    }
  }, [highlightedLayer]);

  useEffect(() => {
    if (clickedOnLayer !== '') {
      const rasterId = getLayerId('raster', highlightedLayer);
      if (map?.getLayer(rasterId)) {
        const visibility = map.getLayoutProperty(
          rasterId,
          'visibility',
          'none'
        );
        if (visibility === 'none') {
          map.setLayoutProperty(rasterId, 'visibility', 'visible');
        } else if (visibility === 'visible') {
          map.setLayoutProperty(rasterId, 'visibility', 'none');
        }
      }
    }
  }, [clickedOnLayer, hideLayers]);

  const cleanMap = (zoom) => {
    setCurrentLayersInViewPort([]);
    setVisualizationLayers([]);
    const { currentLayerIds } = getRasterLayersInCurrentViewPort(map);
    removeLayers(currentLayerIds);
    setZoomLevel(zoom);
    setZoomLocation([]);
    setOpenDrawer(false);
  };
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;

    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= 9) {
        updateVisibleLayers(map, filteredVizItems);
      } else {
        cleanMap(zoom);
      }
    };
    handleViewportChange();
  }, [filteredVizItems]);

  useEffect(() => {
    if (!map) return;

    const handleViewportChange = () => {
      const zoom = map.getZoom();
      if (zoom >= 9) {
        updateVisibleLayers(map, filteredVizItems);
      } else {
        cleanMap(zoom);
      }
    };

    // Wait for style to load before adding listeners
    map.on('zoomend', handleViewportChange);
    map.on('dragend', handleViewportChange);

    return () => {
      map.off('zoomend', handleViewportChange);
      map.off('dragend', handleViewportChange);
    };
  }, [map, filteredVizItems]);

  useEffect(() => {
    if (!map || layersToRemove.length === 0 || !map.isStyleLoaded()) return;
    removeLayers(layersToRemove);
  }, [map, layersToRemove]);

  return null;
}
