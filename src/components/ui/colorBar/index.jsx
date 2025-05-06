import { useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { createColorbar } from './helper';
import { useTooltipPosition } from './helper/useToolTip';
import * as d3 from 'd3';

import './index.css';

/**
 * ColorBar Component
 *
 * Renders a horizontal D3-based color gradient scale with a caption label.
 * Used to visually indicate the color mapping for  plume concentrations.
 *
 * @param {Object} props
 * @param {string} props.label - Descriptive label shown below the colorbar (e.g., units).
 * @param {number} props.VMIN - Minimum value of the colormap scale.
 * @param {number} props.VMAX - Maximum value of the colormap scale.
 * @param {string} props.colormap - Name of the colormap (e.g., 'plasma', 'viridis').
 *
 * @returns {JSX.Element}
 */
export const ColorBar = ({ label, VMIN, VMAX, colormap }) => {
  const BAR_WIDTH = 350;
  const colorBarContainer = useRef();
  const { tooltip, handleMouseMove, hideTooltip } = useTooltipPosition();

  useEffect(() => {
    const container = d3.select(
      colorBarContainer.current.querySelector('.colorbar-d3')
    );
    createColorbar(container, VMIN, VMAX, colormap, BAR_WIDTH);

    return () => {
      container.selectAll('*').remove();
    };
  }, [label, VMIN, VMAX, colormap]);

  return (
    <Card
      id='colorbar'
      sx={{ padding: 2, width: 'fit-content', position: 'relative' }}
    >
      <div
        ref={colorBarContainer}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const width = rect.width;
          const valueScale = d3
            .scaleLinear()
            .domain([0, width])
            .range([VMIN, VMAX]);
          handleMouseMove(e, valueScale);
        }}
        onMouseLeave={hideTooltip}
        style={{ width: BAR_WIDTH, height: 12, position: 'relative' }}
      >
        <div
          className='colorbar-d3'
          style={{ width: '100%', height: '100%' }}
        />
        {tooltip.visible && (
          <div style={{ left: tooltip.x, top: tooltip.y }} id='colortip-box'>
            {tooltip.value.toFixed(2)}
            <div id='colortip-pin' />
          </div>
        )}
      </div>

      <div id='colorbar-label' style={{ width: BAR_WIDTH }}>
        <span>{VMIN}</span>
        <span>{VMAX}</span>
      </div>

      <Typography
        variant='subtitle2'
        gutterBottom
        sx={{ marginTop: 0, marginBottom: 0 }}
        className='colorbar-label'
      >
        {label}
      </Typography>
    </Card>
  );
};
