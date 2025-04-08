import { useEffect, useState, useRef } from 'react';
import { useMapbox } from '../../../context/mapContext';
import {
  addSourcePolygonToMap,
  addFillPolygonToMap,
  addSourceLayerToMap,
  getSourceId,
  getLayerId,
} from '../utils/index';

// eslint-disable-next-line prettier/prettier
export const VisualizationLayer = ({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItem,
  onClickedOnLayer,
  onHoverOverLayer,
  registerEventHandler,
}) => {
  const { map } = useMapbox();
  const [vizItemId, setVizItemId] = useState('');
  console.log({ vizItem });

  useEffect(() => {
    const id = vizItem?.id || vizItem[0]?.id;
    setVizItemId(id);
  }, [vizItem]);

  useEffect(() => {
    if (!map || !vizItemId) return;

    const feature = vizItem || vizItem[0];
    const polygonFeature = {
      geometry: vizItem?.polygonGeometry,
      properties: vizItem?.plumeProperties,
      type: 'Feature',
    };

    const rasterSourceId = getSourceId('raster', vizItemId);
    const rasterLayerId = getLayerId('raster', vizItemId);
    const polygonSourceId = getSourceId('polygon', vizItemId);
    const polygonLayerId = getLayerId('polygon', vizItemId);
    const polygonFillSourceId = getSourceId('fill', vizItemId);
    const polygonFillLayerId = getLayerId('fill', vizItemId);

    // Add layers to map
    addSourceLayerToMap(
      map,
      VMIN,
      VMAX,
      colormap,
      assets,
      feature,
      rasterSourceId,
      rasterLayerId
    );

    addSourcePolygonToMap(
      map,
      polygonFeature,
      polygonSourceId,
      polygonLayerId,
      2
    );

    addFillPolygonToMap(map, vizItem, polygonFillSourceId, polygonFillLayerId);
    map.setLayoutProperty(rasterLayerId, 'visibility', 'visible');

    // Define event handlers
    const clickHandler = (e) => {
      onClickedOnLayer && onClickedOnLayer(vizItemId);
    };

    const hoverHandler = (e) => {
      onHoverOverLayer && onHoverOverLayer(vizItemId);
    };

    const hoverClearHandler = (e) => {
      onHoverOverLayer && onHoverOverLayer('');
    };

    // Attach event handlers to the map
    map.on('click', polygonFillLayerId, clickHandler);
    map.on('mouseenter', polygonFillLayerId, hoverHandler);
    map.on('mouseleave', polygonFillLayerId, hoverClearHandler);

    registerEventHandler(polygonFillLayerId, 'click', clickHandler);
    registerEventHandler(polygonFillLayerId, 'mouseenter', hoverHandler);
    registerEventHandler(polygonFillLayerId, 'mouseleave', hoverClearHandler);
  }, [map, vizItem, vizItemId]);

  return null;
};

export const VisualizationLayers = ({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  highlightedLayer,
  onHoverOverLayer,
  setVizItems,
}) => {
  const { map } = useMapbox();
  const [prevHighlightedLayer, setPrevHighlightedLayer] = useState('');
  const [layersToAdd, setLayersToAdd] = useState([]);

  // console.log({ layers: vizItems });
  const eventHandlerRegistryRef = useRef({});

  const handleClickedOnLayer = (layerId) => {
    if (layerId) {
      const rasterId = getLayerId('raster', layerId);
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
  };

  useEffect(() => {
    if (!map) return;
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

  const registerEventHandler = (layerId, eventType, handler) => {
    if (!eventHandlerRegistryRef.current[layerId]) {
      eventHandlerRegistryRef.current[layerId] = {};
    }
    eventHandlerRegistryRef.current[layerId][eventType] = handler;
  };

  const getEventHandler = (layerId, eventType) => {
    return eventHandlerRegistryRef.current[layerId]?.[eventType];
  };

  const clearEventHandlers = (layerId) => {
    delete eventHandlerRegistryRef.current[layerId];
  };

  const removeEventListeners = (vizItemId) => {
    const polygonFillLayerId = getLayerId('fill', vizItemId);

    const clickHandler = getEventHandler(polygonFillLayerId, 'click');
    const hoverHandler = getEventHandler(polygonFillLayerId, 'mouseenter');
    const hoverClearHandler = getEventHandler(polygonFillLayerId, 'mouseleave');

    if (map.getLayer(polygonFillLayerId)) {
      if (clickHandler) map.off('click', polygonFillLayerId, clickHandler);
      if (hoverHandler) map.off('mouseenter', polygonFillLayerId, hoverHandler);
      if (hoverClearHandler)
        map.off('mouseleave', polygonFillLayerId, hoverClearHandler);
    }

    clearEventHandlers(polygonFillLayerId);
  };

  const removeLayers = (layersToRemove) => {
    layersToRemove.forEach((vizItemId) => {
      const rasterSourceId = getSourceId('raster', vizItemId);
      const rasterLayerId = getLayerId('raster', vizItemId);
      const polygonSourceId = getSourceId('polygon', vizItemId);
      const polygonLayerId = getLayerId('polygon', vizItemId);
      const polygonFillSourceId = getSourceId('fill', vizItemId);
      const polygonFillLayerId = getLayerId('fill', vizItemId);

      removeEventListeners(vizItemId);

      if (map.getLayer(rasterLayerId)) map.removeLayer(rasterLayerId);
      if (map.getLayer(polygonLayerId)) map.removeLayer(polygonLayerId);
      if (map.getLayer(polygonFillLayerId)) map.removeLayer(polygonFillLayerId);

      if (map.getSource(rasterSourceId)) map.removeSource(rasterSourceId);
      if (map.getSource(polygonSourceId)) map.removeSource(polygonSourceId);
      if (map.getSource(polygonFillSourceId))
        map.removeSource(polygonFillSourceId);
    });
  };

  useEffect(() => {
    const processLayers = () => {
      try {
        const currentLayersOnMap = map.getStyle()?.layers || [];
        const currentRasterLayersOnMap = currentLayersOnMap.filter((item) =>
          item?.id?.includes('raster-')
        );

        const currentLayersInMapIds = new Set(
          currentRasterLayersOnMap.map((obj) => obj.id?.split('-')[1])
        );
        const itemsInViewPortId = new Set(vizItems.map((item) => item?.id));

        const newLayersToAdd = vizItems.filter(
          (item) => !currentLayersInMapIds.has(item.id)
        );

        if (newLayersToAdd.length) {
          setLayersToAdd(newLayersToAdd);
        } else {
          setLayersToAdd([]);
        }

        const layersToRemove = [...currentLayersInMapIds].filter(
          (id) => !itemsInViewPortId.has(id)
        );

        if (layersToRemove.length) {
          removeLayers(layersToRemove);
        }
        // This is for console logging purpose only
        // const layers = map.getStyle().layers;
        // const val = layers.filter((item) => item?.id?.includes('raster-'));
        // console.log({ finalLayers: val });

        // const listeners = map._listeners;
        // console.log({
        //   all: listeners,
        //   registry: eventHandlerRegistryRef.current,
        // });
      } catch (error) {
        console.warn('Error processing map layers:', error);
      }
    };

    if (!map) return;

    if (!map.isStyleLoaded()) {
      map.once('style.load', () => {
        processLayers(); // <-- call your function after style loads
      });
      return;
    }

    processLayers();
  }, [map, vizItems]);

  return (
    <>
      {layersToAdd.map((vizItem) => (
        <VisualizationLayer
          key={vizItem.id}
          vizItem={vizItem}
          highlightedLayer={highlightedLayer}
          onClickedOnLayer={handleClickedOnLayer}
          onHoverOverLayer={onHoverOverLayer}
          VMIN={VMIN}
          VMAX={VMAX}
          colormap={colormap}
          assets={assets}
          registerEventHandler={registerEventHandler}
          setVizItems={setVizItems}
        />
      ))}
    </>
  );
};
