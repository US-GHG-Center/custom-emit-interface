import { useEffect } from 'react';
import { useMapbox } from '../../../context/mapContext';
import { addFillPolygonToMap, getSourceId, getLayerId } from '../utils/index';

/**
 * FillLayer Component
 *
 * Renders an interactive polygon layer on a Mapbox map. This component handles:
 * - Adding a fill layer to the map with the provided visualization item's geometry
 * - Managing hover and click interactions
 * - Cleaning up event listeners on unmount
 *
 * @component
 * @param {Object} props.vizItem - Visualization item containing geometry and properties
 * @param {string} props.highlightedLayer - ID of the currently highlighted layer (for visual feedback)
 * @param {Function} props.onClickOnLayer - Callback when layer is clicked (receives vizItemId)
 * @param {Function} props.onHoverOverLayer - Callback for hover events
 *                                           Receives vizItemId on enter, empty string on leave
 */
export const FillLayer = ({
  vizItem,
  highlightedLayer,
  onClickOnLayer,
  onHoverOverLayer,
}) => {
  const { map } = useMapbox();
  const vizItemId = vizItem?.id;

  useEffect(() => {
    if (!map || !vizItem) return;

    const polygonFillSourceId = getSourceId('fill', vizItemId);
    const polygonFillLayerId = getLayerId('fill', vizItemId);

    // Add the polygon layer to the map
    addFillPolygonToMap(map, vizItem, polygonFillSourceId, polygonFillLayerId);

    // Event handlers
    const onClickHandler = (e) => {
      onClickOnLayer && onClickOnLayer(vizItemId);
    };

    const onHoverHandler = (e) => {
      // console.log({ Hovered: vizItemId });
      onHoverOverLayer && onHoverOverLayer(vizItemId);
    };

    const onHoverClearHandler = (e) => {
      // console.log({ Removed: vizItemId });
      onHoverOverLayer && onHoverOverLayer('');
    };

    // Add event listeners
    map.on('click', polygonFillLayerId, onClickHandler);
    map.on('mouseenter', polygonFillLayerId, onHoverHandler);
    map.on('mouseleave', polygonFillLayerId, onHoverClearHandler);

    // Cleanup function
    return () => {
      map.off('click', polygonFillLayerId, onClickHandler);
      map.off('mouseenter', polygonFillLayerId, onHoverHandler);
      map.off('mouseleave', polygonFillLayerId, onHoverClearHandler);
    };
  }, [
    vizItem,
    map,
    vizItemId,
    onClickOnLayer,
    onHoverOverLayer,
    highlightedLayer,
  ]);

  return null;
};

/**
 * FillLayers Component
 *
 * A container component that manages multiple FillLayer instances. It handles:
 * - Rendering a FillLayer for each visualization item
 * - Passing down interaction callbacks
 * - Managing the highlighted state
 *
 * @component
 * @param {Array<Object>} props.vizItems - Array of visualization items to render
 * @param {string} props.highlightedLayer - ID of the currently highlighted layer
 * @param {Function} props.onClickOnLayer - Click handler passed to each FillLayer
 * @param {Function} props.onHoverOverLayer - Hover handler passed to each FillLayer
 *
 */
export const FillLayers = ({
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
        <FillLayer
          key={vizItem.id}
          vizItem={vizItem}
          highlightedLayer={highlightedLayer}
          onClickOnLayer={onClickOnLayer}
          onHoverOverLayer={onHoverOverLayer}
        />
      ))}
    </>
  );
};
