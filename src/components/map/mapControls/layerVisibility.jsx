import { useState, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Tooltip from '@mui/material/Tooltip';

function VisibilityIconComp({ map, onClickHandler }) {
  const [isVisible, setIsVisible] = useState(true);
  let rasterLayersCurrentVisibility = useRef(); // key[string(layer-id)]: string(previous visibility status)

  const toggleLayers = () => {
    if (!map) return;
    if (isVisible) {
      // toggle to invisible
      // from all current raster, store their current state and make it invisible
      rasterLayersCurrentVisibility.current = {};
      const layers = map.getStyle().layers;
      layers.forEach((layer) => {
        if (layer.id.includes('raster-')) {
          if (!layer.layout) return;
          rasterLayersCurrentVisibility.current[layer.id] =
            layer.layout.visibility;
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    } else {
      // toggle to visible
      // restore the previous visibility stateonClickHandler && onClickHandler(true);
      Object.keys(rasterLayersCurrentVisibility.current).forEach((layerId) => {
        map.setLayoutProperty(
          layerId,
          'visibility',
          rasterLayersCurrentVisibility.current[layerId]
        );
      });
    }
    onClickHandler && onClickHandler(!isVisible);
    setIsVisible(!isVisible);
  };

  return (
    <Tooltip title='Layer Visibility'>
      <IconButton className='menu-open-icon' onClick={toggleLayers}>
        {isVisible ? (
          <VisibilityIcon className='map-control-icon' />
        ) : (
          <VisibilityOffIcon className='map-control-icon' />
        )}
      </IconButton>
    </Tooltip>
  );
}

export class LayerVisibilityControl {
  constructor(onHideLayerClick) {
    this._onClick = onHideLayerClick;
    this.root = null;
    this._map = null;
  }

  onAdd = (map) => {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    const root = ReactDOM.createRoot(this._container);
    root.render(
      <VisibilityIconComp map={this._map} onClickHandler={this._onClick} />
    );
    this.root = root;
    return this._container;
  };

  onRemove = () => {
    setTimeout(() => {
      try {
        this.root.unmount();
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
      } catch (err) {
        console.warn('Error during cleanup:', err);
      }
    }, 0);
  };
}
