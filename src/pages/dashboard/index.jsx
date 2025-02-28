import React, { useEffect, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { throttle } from 'lodash';

import {
  MainMap,
  MarkerFeature,
  VisualizationLayers,
  ColorBar,
  LoadingSpinner,
  PersistentDrawerRight,
  Title,
  MapControls,
  MapZoom,
  Search,
  FilterByDate,
  VizItemAnimation,
} from '@components';

import styled from 'styled-components';

import './index.css';
import { useMapbox } from '../../components';
import { isFeatureWithinBounds } from './helper';

const TITLE = 'GOES Methane Plume Viewer';
const DESCRIPTION =
  'The Geostationary Operational Environmental Satellites collect \
images of the surface every 5 minutes. Only very large emission events can be detected, \
but plume expansion is easy to see over time. More plumes will be added soon.';

const HorizontalLayout = styled.div`
  width: 90%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 12px;
`;
function Dashboard({
  plumes,
  collectionMeta,
  vizItemMetaData,
  zoomLocation,
  setZoomLocation,
  zoomLevel,
  setZoomLevel,
  collectionId,
  loadingData,
}) {
  // states for data
  const [vizItems, setVizItems] = useState([]); // store all available visualization items
  const [selectedRegionId, setSelectedRegionId] = useState(''); // region_id of the selected region (marker)
  const prevSelectedRegionId = useRef(''); // to be able to restore to previously selected region.
  const [selectedVizItems, setSelectedVizItems] = useState([]); // all visualization items for the selected region (marker)
  const [hoveredVizLayerId, setHoveredVizLayerId] = useState(''); // vizItem_id of the visualization item which was hovered over
  const [filteredVizItems, setFilteredVizItems] = useState([]); // visualization items for the selected region with the filter applied

  const [vizItemIds, setVizItemIds] = useState([]); // list of vizItem_ids for the search feature.
  const [vizItemsForAnimation, setVizItemsForAnimation] = useState([]); // list of subdaily_visualization_item used for animation

  const [showVisualizationLayers, setShowVisualizationLayers] = useState(true);
  const [visualizationLayers, setVisualizationLayers] = useState(true);

  // states for components/controls
  const [openDrawer, setOpenDrawer] = useState(false);
  const { map } = useMapbox();
  const zoomLevelRef = useRef(null); //

  //colormap states
  const [VMAX, setVMAX] = useState(100);
  const [VMIN, setVMIN] = useState(-92);
  const [colormap, setColormap] = useState('plasma');
  const [assets, setAssets] = useState('ch4-plume-emissions');

  //states for data

  // handler functions
  const handleSelectedVizItem = (vizItemId) => {
    if (!vizItemId) return;
    setShowVisualizationLayers(true);
    const vizItem = plumes[vizItemId];
    const location = vizItem?.geometry?.coordinates[0][0];
    setVisualizationLayers([vizItem]);
    setZoomLocation(location);
    setZoomLevel(12); // take the default zoom level
    setOpenDrawer(true);
    setSelectedVizItems([]); // reset the visualization items shown, to trigger re-evaluation of selected visualization item
  };

  const handleSelectedVizLayer = (vizLayerId) => {
    if (!vizItems || !vizLayerId) return;
    const vizItem = vizItems[vizLayerId];
    const { location } = vizItem;
    handleSelectedVizItemSearch(vizLayerId);
    handleAnimationReady(vizLayerId);
    setZoomLocation(location);
    setZoomLevel(12); // take the default zoom level
    // setSelectedRegionId(''); //to reset the visualization item that was shown
  };

  const handleAnimationReady = (vizItemId) => {
    // will make the visualization item ready for animation.
    if (!vizItems || !vizItemId) return;

    const vizItem = vizItems[vizItemId];
    setVizItemsForAnimation(vizItem.subDailyPlumes);
    // just clear the previous visualization item layers and not the cards
    setShowVisualizationLayers(false);
  };

  const handleSelectedVizItemSearch = (vizItemId) => {
    // will focus on the visualization item along with its visualization item metadata card
    // will react to update the metadata on the sidedrawer
    if (!vizItems || !vizItemId) return;
    const vizItem = vizItems[vizItemId];
    const location = vizItem?.geometry?.coordinates[0][0];
    console.log({ location });
    setSelectedVizItems([vizItem]);
    setOpenDrawer(true);
    setZoomLocation(location);
    setZoomLevel(null); // take the default zoom level
    setSelectedRegionId(''); //to reset the visualization item that was shown
    setVizItemsForAnimation([]); // to reset the previous animation
  };

  const handleResetHome = () => {
    setSelectedRegionId('');
    setHoveredVizLayerId('');
    setFilteredVizItems([]);
    setVizItemsForAnimation([]);
    setOpenDrawer(false);
    setZoomLevel(4);
    setZoomLocation([-98.771556, 32.967243]);
  };

  const handleResetToSelectedRegion = () => {
    // setHoveredVizItemId("");
    setVizItemsForAnimation([]);
    if (!prevSelectedRegionId.current) {
      return handleResetHome();
    }
    handleSelectedVizItem(prevSelectedRegionId.current);
  };

  // Component Effects
  useEffect(() => {
    if (!plumes) return;
    setVizItems(plumes);
  }, [plumes]);

  const renderRasterOnZoomed = (bounds, zoom) => {
    // console.log({ bounds, zoom });
    if (zoom > 8) {
      const itemsInsideZoomedRegion = Object.values(plumes)?.filter((value) =>
        isFeatureWithinBounds(value?.polygonGeometry, bounds)
      );
      // console.log({itemsInsideZoomedRegion})
      setVisualizationLayers(itemsInsideZoomedRegion);
    } else {
      setVisualizationLayers([]);
    }
  };

  useEffect(() => {
    if (!map) return;
    const handleZoom = () => {
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      // const layers = map.getStyle().layers;
      // console.log({ layers });
      renderRasterOnZoomed(bounds, zoom);
    }
    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

 

  useEffect(() => {
    const colormap = collectionMeta?.renders?.dashboard?.colormap_name;
    const rescaleValues = collectionMeta?.renders?.dashboard?.rescale;
    const VMIN = rescaleValues && rescaleValues[0][0];
    const VMAX = rescaleValues && rescaleValues[0][1];
    setVMIN(VMIN);
    setVMAX(VMAX);
    setColormap(colormap);
  }, [collectionMeta]);

  const onFilteredVizItems = (filteredVizItems) => {
    //   setFilteredVizItems(filteredVizItems);
    //   // console.log({ filteredVizItems });
  };
  const handleHoveredVizLayer = (vizItemId) => {};
  // JSX
  return (
    <Box className='fullSize'>
      <div id='dashboard-map-container'>
        <Paper className='title-container'>
          <Title title={TITLE} description={DESCRIPTION} />
          <div className='title-content'>
            <HorizontalLayout>
              <Search
                vizItems={Object.keys(vizItems).map((key) => vizItems[key])}
                onSelectedVizItemSearch={handleSelectedVizItemSearch}
              ></Search>
            </HorizontalLayout>
            <HorizontalLayout>
              <FilterByDate
                vizItems={Object.keys(vizItems).map((key) => vizItems[key])}
                onFilteredVizItems={onFilteredVizItems}
              />
            </HorizontalLayout>
            <HorizontalLayout>
              <VizItemAnimation
                VMIN={VMIN}
                VMAX={VMAX}
                colormap={colormap}
                assets={assets}
                vizItems={vizItemsForAnimation}
              />
            </HorizontalLayout>
          </div>
        </Paper>
        <MapZoom zoomLocation={zoomLocation} zoomLevel={zoomLevel} />
        <MapControls
          openDrawer={openDrawer}
          setOpenDrawer={setOpenDrawer}
          handleResetHome={handleResetHome}
          handleResetToSelectedRegion={handleResetToSelectedRegion}
        />
        <MarkerFeature
          vizItems={Object.keys(plumes).map((item) => plumes[item])}
          onSelectVizItem={handleSelectedVizItem}
        ></MarkerFeature>
        <VisualizationLayers
          vizItems={visualizationLayers}
          VMIN={VMIN}
          VMAX={VMAX}
          colormap={colormap}
          assets={assets}
          onClickOnLayer={handleSelectedVizLayer}
          onHoverOverLayer={handleHoveredVizLayer}
        />

        <PersistentDrawerRight
          open={openDrawer}
          setOpen={setOpenDrawer}
          selectedVizItems={filteredVizItems}
          vizItemMetaData={vizItemMetaData}
          collectionId={collectionId}
          vizItemsMap={vizItems}
          handleSelectedVizItems={handleSelectedVizLayer}
          hoveredVizItemId={hoveredVizLayerId}
          setHoveredVizItemId={setHoveredVizLayerId}
        />
      </div>
      {VMAX && (
        <ColorBar
          label={'Methane Column Enhancement (mol/m²)'}
          VMAX={VMAX}
          VMIN={VMIN}
          colormap={colormap}
          STEPSIZE={1}
        />
      )}
      {loadingData && <LoadingSpinner />}
    </Box>
  );
}

export function EmitDashboard({
  plumes,
  collectionMeta,
  zoomLocation,
  setZoomLocation,
  zoomLevel,
  setZoomLevel,
  collectionId,
  loadingData,
}) {
  return (
    <MainMap>
      <Dashboard
        plumes={plumes}
        zoomLocation={zoomLocation}
        zoomLevel={zoomLevel}
        setZoomLocation={setZoomLocation}
        setZoomLevel={setZoomLevel}
        collectionMeta={collectionMeta}
        collectionId={collectionId}
        loadingData={loadingData}
      />
    </MainMap>
  );
}
