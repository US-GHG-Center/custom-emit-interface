import * as d3 from 'd3';

const COLOR_MAP = {
  rdylgn: d3.interpolateRdYlGn, //imerg
  turbo: d3.interpolateTurbo, //sst
  bupu_r: (t) => d3.interpolateBuPu(t), //viirs,modis
  viridis: d3.interpolateViridis, //cygnss
  greys_r: (t) => d3.interpolateGreys(1 - t), //goes02 (reversed)
  cubehelix: d3.interpolateCubehelixDefault, //goes13
  magma: d3.interpolateMagma,
  reds: d3.interpolateReds,
  gist_earth: (t) => d3.interpolateGreys(1 - t), // (reversed)
  default: d3.interpolatePlasma,
  plasma: d3.interpolatePlasma,
};

/*
      Create colorbar as a legend
      
      @param {object} colorbar - instance of the colorbar objects
      @param {number} VMIN - minimum value of the color index
      @param {number} VMAX - maximum value of the color index
      @param {number} STEP - stepsize of  scale 
      @param {string} colormap - name of the colormap
     
*/
export const createColorbar = (
  container,
  VMIN,
  VMAX,
  colormap,
  width = 300
) => {
  const height = 12;
  const segmentCount = 100;

  const colorScale = d3
    .scaleSequential(COLOR_MAP[colormap] || d3.interpolatePlasma)
    .domain([VMIN, VMAX]);

  const data = d3.range(VMIN, VMAX, (VMAX - VMIN) / segmentCount);

  const svg = container
    .append('svg')
    .attr('width', '100%')
    .attr('height', height);

  svg
    .selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', (_, i) => (i * 100) / segmentCount + '%')
    .attr('y', 0)
    .attr('width', 100 / segmentCount + '%')
    .attr('height', height)
    .attr('fill', (d) => colorScale(d));
};
