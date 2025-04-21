import { useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { createColorbar } from './helper';
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
 * @param {number} props.STEPS - Number of label ticks/steps on the bar.
 * @param {string} props.colormap - Name of the colormap (e.g., 'plasma', 'viridis').
 *
 * @returns {JSX.Element}
 */

export const ColorBar = ({ label, VMIN, VMAX, STEPS, colormap }) => {
  const colorBarScale = useRef();
  useEffect(() => {
    const STEP = Math.ceil((VMAX - VMIN) / STEPS);
    const colorbar = d3.select(colorBarScale.current);
    createColorbar(colorbar, VMIN, VMAX, STEP, colormap);

    return () => {
      colorbar.selectAll('*').remove();
    };
  }, [label, VMIN, VMAX, STEPS, colormap]);

  return (
    <Card id='colorbar'>
      <div ref={colorBarScale} className='colorbar-scale'></div>
      <Typography
        variant='subtitle2'
        gutterBottom
        sx={{ marginBottom: 0 }}
        className='colorbar-label'
      >
        {label}
      </Typography>
    </Card>
  );
};
