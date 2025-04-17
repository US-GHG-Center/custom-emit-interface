import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dashboard } from '../dashboard/index.jsx';

import {
  fetchCollectionMetadata,
  fetchAllFromSTACAPI,
  fetchData,
  getCoverageData,
} from '../../services/api.js';
import { transformMetadata } from './helper/dataTransform.ts';
import { createIndexedCoverageData } from './helper/dataTransform.ts';

/**
 * DashboardContainer Component
 *
 * Responsible for initializing and loading required data for the Dashboard.
 * This includes:
 *  - Fetching STAC metadata and transforming it to internal plume structure.
 *  - Fetching and indexing coverage data.
 *  - Managing map zoom state from URL query parameters.
 *
 * @component
 * @returns {JSX.Element} Rendered Dashboard component
 */
export function DashboardContainer() {
  // get the query params
  const [searchParams] = useSearchParams();
  const [coverage, setCoverage] = useState();
  const [zoomLocation, setZoomLocation] = useState(
    searchParams.get('zoom-location') || []
  ); // let default zoom location be controlled by map component
  const [zoomLevel, setZoomLevel] = useState(
    searchParams.get('zoom-level') || null
  ); // let default zoom level be controlled by map component
  const [collectionId] = useState(
    searchParams.get('collection-id') || 'emit-ch4plume-v1'
  );

  const [collectionMeta, setCollectionMeta] = useState({});
  const [plumes, setPlumes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState({});

  useEffect(() => {
    setLoadingData(true);
    const init = async () => {
      try {
        // // fetch in the collection from the features api
        const collectionUrl = `${process.env.REACT_APP_BASE_STAC_API_URL}/collections/${collectionId}`;
        // // use this url to find out the data frequency of the collection
        const collectionMetadata = await fetchCollectionMetadata(collectionUrl);
        setCollectionMeta(collectionMetadata);

        const metaDataEndpoint = `${process.env.REACT_APP_METADATA_ENDPOINT}`;
        const stacAPIEndpoint = `${process.env.REACT_APP_STAC_API_URL}`;
        // get all the metadata items
        const metadata = await fetchData(metaDataEndpoint);
        // get all the stac Items
        const stacData = await fetchAllFromSTACAPI(stacAPIEndpoint);

        // transform the data
        const { data, latestPlume } = await transformMetadata(
          metadata,
          stacData
        );
        setPlumes(data);
        setFilterDateRange({
          startDate: '2022-08-22',
          endDate: latestPlume?.properties?.datetime,
        });
        // remove loading
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    init().catch(console.error);
  }, []); // only on initial mount

  // Fetch coverage separately in the background
  useEffect(() => {
    let isMounted = true;
    const fetchCoverage = async () => {
      try {
        const coverageUrl = process.env.REACT_APP_COVERAGE_URL;
        // const coverageUrl = `${process.env.PUBLIC_URL}/data/coverages.json`;
        const coverageData = await getCoverageData(coverageUrl);
        const indexedCoverageData = createIndexedCoverageData(coverageData);
        // const coverageData = coverages;
        if (isMounted && coverageData?.features?.length > 0) {
          setCoverage(indexedCoverageData);
        }
      } catch (error) {
        console.error('Error fetching coverage data:', error);
      }
    };

    fetchCoverage();
    return () => {
      isMounted = false; // Cleanup in case the component unmounts before fetch completes
    };
  }, []);

  return (
    <Dashboard
      plumes={plumes}
      coverage={coverage}
      zoomLocation={zoomLocation}
      zoomLevel={zoomLevel}
      setZoomLocation={setZoomLocation}
      setZoomLevel={setZoomLevel}
      collectionMeta={collectionMeta}
      filterDateRange={filterDateRange}
      collectionId={collectionId}
      loadingData={loadingData}
    />
  );
}
