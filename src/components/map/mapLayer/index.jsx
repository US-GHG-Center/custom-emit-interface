import { useEffect } from 'react';
import { useMapbox } from '../../../context/mapContext';
import { addSourceLayerToMap, getSourceId, getLayerId } from '../utils';
import { addSourcePolygonToMap } from '../utils/index';

// eslint-disable-next-line prettier/prettier
export const VisualizationLayer = ({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItem,
  highlightedLayer,
  onClickOnLayer,
  onHoverOverLayer,
}) => {
  const { map } = useMapbox();
  const vizItemId = vizItem.id;

  useEffect(() => {
    if (!map || !vizItem) return;
    const feature = vizItem;
    const polygonFeature = {
      geometry: vizItem?.polygonGeometry,
      properties: vizItem?.plumeProperties,
      type: 'Feature',
    };

    const rasterSourceId = getSourceId('raster', vizItemId);
    const rasterLayerId = getLayerId('raster', vizItemId);
    const polygonSourceId = getSourceId('polygon', vizItemId);
    const polygonLayerId = getLayerId('polygon', vizItemId);
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

    map.setLayoutProperty(rasterLayerId, 'visibility', 'visible');
  }, [
    vizItem,
    map,
    vizItemId,
    onClickOnLayer,
    onHoverOverLayer,
    VMIN,
    VMAX,
    colormap,
    assets,
    highlightedLayer,
  ]);

  return null;
};
/*
      Add layers of visualization components on top of map
      
      @param {number} VMIN - minimum value of the color index
      @param {number} VMAX - maximum value of the color index
      @param {string} colormap - name of the colormap
      @param {string} assets - name of the asset of the color
      @param {STACItem} vizItems   - An array of STACitems which are to be displayed
      @param {function} onHoverOverlayer - function to execute when mouse is hovered on layer. will provide vizItemId as a parameter to the callback
      @param {function} onClickOnlayer - function to execute when layer is clicked. will provide vizItemId as a parameter to the callback
*/

export const VisualizationLayers = ({
  VMIN,
  VMAX,
  colormap,
  assets,
  vizItems,
  highlightedLayer,
  onHoverOverLayer,
  onClickOnLayer,
}) => {
  const { map } = useMapbox();

  if (!map || !vizItems || !vizItems.length) return null;

  return (
    <>
      {vizItems.map((vizItem) => (
        <VisualizationLayer
          key={vizItem.id}
          vizItem={vizItem}
          highlightedLayer={highlightedLayer}
          onClickOnLayer={onClickOnLayer}
          onHoverOverLayer={onHoverOverLayer}
          VMIN={VMIN}
          VMAX={VMAX}
          colormap={colormap}
          assets={assets}
        />
      ))}
    </>
  );
};
