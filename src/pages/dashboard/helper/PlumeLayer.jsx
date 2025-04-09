import React, { useEffect, useState } from 'react';
import {
  VisualizationLayers,
  useMapbox,
  getLayerId,
  getSourceId,
} from '@components';

function Plumes({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  highlightedLayer,
  onHoverOverLayer,
}) {
  const { map } = useMapbox();

  const [plumeLayers, setPlumeLayers] = useState([]);

  useEffect(() => {
    setPlumeLayers(vizItems);
  }, [vizItems]);

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
  const handleRemoveLayer = (vizItemId) => {
    const rasterSourceId = getSourceId('raster', vizItemId);
    const rasterLayerId = getLayerId('raster', vizItemId);
    const polygonSourceId = getSourceId('polygon', vizItemId);
    const polygonLayerId = getLayerId('polygon', vizItemId);
    const polygonFillSourceId = getSourceId('fill', vizItemId);
    const polygonFillLayerId = getLayerId('fill', vizItemId);

    if (map.getLayer(rasterLayerId)) map.removeLayer(rasterLayerId);
    if (map.getLayer(polygonLayerId)) map.removeLayer(polygonLayerId);
    if (map.getLayer(polygonFillLayerId)) map.removeLayer(polygonFillLayerId);

    if (map.getSource(rasterSourceId)) map.removeSource(rasterSourceId);
    if (map.getSource(polygonSourceId)) map.removeSource(polygonSourceId);
    if (map.getSource(polygonFillSourceId))
      map.removeSource(polygonFillSourceId);
  };
  /**
   * Effect to handle highlighting of a layer when hovered,
   * and reverting to normal style when hover is removed.
   */
  useEffect(() => {
    if (!map) return;

    if (highlightedLayer) {
      const polygonId = getLayerId('polygon', highlightedLayer);
      const rasterId = getLayerId('raster', highlightedLayer);

      // Highlight the polygon layer by increasing its line width
      if (map.getLayer(polygonId)) {
        map.setPaintProperty(polygonId, 'line-width', 5);
      }

      // Move the raster layer below the polygon layer for visibility
      if (map.getLayer(rasterId) && map.getLayer(polygonId)) {
        map.moveLayer(rasterId, polygonId);
      }
    } else {
      const mapLayers = map.getStyle().layers;
      const polygonLayers = mapLayers?.filter((item) =>
        item?.id?.includes('polygon-')
      );
      const highlightedLayer = polygonLayers?.filter(
        (item) => item?.paint['line-width'] === 5
      );

      // Revert the previously highlighted layer back to normal line width
      highlightedLayer &&
        highlightedLayer?.forEach((item) =>
          map.setPaintProperty(item.id, 'line-width', 2)
        );
    }
  }, [highlightedLayer]);

  return (
    <VisualizationLayers
      vizItems={plumeLayers}
      VMIN={VMIN}
      VMAX={VMAX}
      colormap={colormap}
      assets={assets}
      onHoverOverLayer={onHoverOverLayer}
      highlightedLayer={highlightedLayer}
      onClickedOnLayer={handleClickedOnLayer}
      handleRemoveLayer={handleRemoveLayer}
    />
  );
}

export default Plumes;
