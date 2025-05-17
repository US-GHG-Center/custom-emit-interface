import { useEffect, useState } from 'react';
import { useMapbox } from '../../../context/mapContext';
import {
  findMeasurementAnchor,
  addMeasurementLayer,
  addMeasurementSource,
  createMeasuringLine,
  removeMeasurementLayer,
  removeMeasurementSource,
  changeCursor,
  cleanMeasurementControlLayers,
  MEASURE_LINE,
  MEASURE_LABEL,
  MEASURE_POINTS,
} from './helper/measureDistance';

/**
 * MeasurementLayer Component
 *
 * Controls a map-based distance measuring tool that allows users
 * to click to add points, see a dynamic line, and measure distances
 * in km/mi using Turf.js. Handles map interaction, state, rendering,
 * and teardown.
 *
 * @param {Object} props
 * @param {boolean} props.measureMode - Whether measurement mode is active.
 * @param {Function} props.setMeasureMode - Function to toggle measurement mode.
 * @param {Function} props.setClearMeasurementIcon - Show/hide the "clear" icon.
 * @param {boolean} props.clearMeasurementLayer - Whether user has requested to clear layers.
 * @param {Function} props.setClearMeasurementLayer - Clear flag updater.
 * @param {'km' | 'mi'} props.mapScaleUnit - Unit to measure distance in.
 *
 * @returns {null}
 */
export const MeasurementLayer = ({
  measureMode,
  setMeasureMode,
  setClearMeasurementIcon,
  clearMeasurementLayer,
  setClearMeasurementLayer,
  mapScaleUnit,
}) => {
  const { map } = useMapbox();
  const [measurePoints, setMeasurePoints] = useState(MEASURE_POINTS);
  const [measureLine, setMeasureLine] = useState(MEASURE_LINE);
  const [measureLabel, setMeasureLabel] = useState(MEASURE_LABEL);

  /**
   * Reset all internal measurement state and GeoJSON layers.
   */
  const clearMeasurementState = () => {
    setMeasureLine(MEASURE_LINE);
    setMeasureLabel(MEASURE_LABEL);
    setMeasurePoints(MEASURE_POINTS);
  };

  /**
   * Click to place anchor point or remove it.
   */
  const handleClick = (e) => {
    if (!map || !map.isStyleLoaded()) return;
    try {
      const anchor = findMeasurementAnchor(e, map, measurePoints);
      if (!anchor?.features?.length) {
        cleanMeasurementControlLayers(map);
        setClearMeasurementIcon(false);
      }
      setMeasurePoints(anchor);
      map.getSource('measurePoints')?.setData(anchor);
      map.moveLayer('measure-points');
    } catch (error) {
      console.error('Error handling measurement click:', error);
    }
  };

  /**
   * Exit measurement mode on double click.
   */
  const handleDoubleClick = (e) => {
    setMeasureMode(false);
  };

  /**
   * Mouse movement dynamically draws measurement line and label.
   */
  const handleMouseMovement = (e) => {
    if (!map || !map.isStyleLoaded()) return;
    try {
      const { line, label } = createMeasuringLine(e, measurePoints, mapScaleUnit);
      map.getSource('measureLine')?.setData(line);
      map.getSource('measureLabel')?.setData(label);
      map.moveLayer('measure-line');
      map.moveLayer('measure-label');
      setMeasureLine(line);
      setMeasureLabel(label);
    } catch (error) {
      console.error('Error handling mouse movement:', error);
    }
  };

  /**
   * Hide clear icon if measure mode is off.
   */
  useEffect(() => {
    if (!measureMode) {
      setClearMeasurementIcon(false);
    }
  }, [measureMode, setClearMeasurementIcon]);

  /**
   * When clear icon is clicked, reset all measurement layers + state.
   */
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    if (clearMeasurementLayer) {
      try {
        cleanMeasurementControlLayers(map);
        clearMeasurementState();
        setClearMeasurementIcon(false);
        setClearMeasurementLayer(false);
      } catch (error) {
        console.error('Error clearing measurement layers:', error);
      }
    }
  }, [clearMeasurementLayer, map, setClearMeasurementIcon, setClearMeasurementLayer]);

  /**
   * If a point is selected and measuring is active, show line + label on mousemove.
   */
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    if (measurePoints?.features.length > 0 && measureMode) {
      setClearMeasurementIcon(true);
      map.on('mousemove', handleMouseMovement);
    }
    return () => {
      if (map) {
        map.off('mousemove', handleMouseMovement);
      }
    };
  }, [map, measurePoints, mapScaleUnit, measureMode, setClearMeasurementIcon]);

  /**
   * Handles activation and deactivation of layers, sources, and cursor style.
   */
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    try {
      changeCursor(map, measurePoints, measureMode);
      if (measureMode) {
        addMeasurementSource(map, measurePoints, measureLine, measureLabel);
        addMeasurementLayer(map);
        map.doubleClickZoom.disable();
      } else if (!measureMode) {
        removeMeasurementSource(map);
        removeMeasurementLayer(map);
        clearMeasurementState();
        map.doubleClickZoom.enable();
      }
      return () => {
        removeMeasurementSource(map);
        removeMeasurementLayer(map);
      };
    } catch (error) {
      console.error('Error managing measurement layers:', error);
    }
  }, [map, measureMode, measurePoints, measureLine, measureLabel]);

  /**
   * Attach click and double-click handlers when measuring is active.
   */
  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return;
    if (measureMode) {
      map.on('click', handleClick);
      map.on('dblclick', handleDoubleClick);
    }
    return () => {
      if (map) {
        map.off('click', handleClick);
        map.off('dblclick', handleDoubleClick);
      }
    };
  }, [map, measureMode]);

  return null;
};
