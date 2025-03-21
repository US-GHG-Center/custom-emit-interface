import { useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

import { createColorbar } from './helper';
import * as d3 from 'd3';

import './index.css';

/*
      Component to create colorbar
      
      @param {label} label - label to be displayed 
      @param {number} VMIN - minimum value of the color index
      @param {number} VMAX - maximum value of the color index
      @param {number} STEPS - no of Steps  
      @param {string} colormap - name of the colormap
     
*/

export const ColorBar = ({ label, VMIN, VMAX, STEPS, colormap }) => {
  const colorBarScale = useRef();
  useEffect(() => {
    const STEP = Math.floor(((VMAX - VMIN) / STEPS));
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
