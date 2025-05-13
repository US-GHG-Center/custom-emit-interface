import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Dashboard } from '../dashboard/index.jsx';
import {
  fetchCollectionMetadata,
  fetchAllFromSTACAPI,
  fetchData,
  getCoverageData,
} from '../../services/api.js';
import {
  transformMetadata,
  createIndexedCoverageData,
} from '../../utils/dataTransform.ts';

import { getConfig, validateConfig } from '../../services/config.ts';

/**
 * EmitInterface Component
 *
 * A reusable component that provides the EMIT Methane Plume Viewer interface.
 * This component handles data fetching, state management, and rendering of the dashboard.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.collectionId] - The STAC collection ID to fetch data from
 * @param {Array<number>} [props.zoomLocation] - Initial zoom location [lon, lat]
 * @param {number} [props.zoomLevel] - Initial zoom level
 * @param {Object} [props.config] - Configuration object for API endpoints and other settings
 * @returns {JSX.Element} The rendered EMIT interface
 */
export const EmitInterface = ({
  collectionId,
  zoomLocation: initialZoomLocation,
  zoomLevel: initialZoomLevel,
  config: userConfig = {},
}) => {
  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => {
    const mergedConfig = getConfig(userConfig);
    const isValidConfig = validateConfig(mergedConfig);
    if (isValidConfig.result) {
      return mergedConfig;
    } else {
      throw new Error(
        `Missing required configuration fields ${isValidConfig.missingFields} `
      );
    }
  }, [userConfig]);

  const [searchParams] = useSearchParams();
  const [coverage, setCoverage] = useState();
  const [zoomLocation, setZoomLocation] = useState(
    initialZoomLocation ||
      searchParams.get('zoom-location') ||
      config.defaultZoomLocation
  );
  const [zoomLevel, setZoomLevel] = useState(
    initialZoomLevel ||
      searchParams.get('zoom-level') ||
      config.defaultZoomLevel
  );
  const [collectionMeta, setCollectionMeta] = useState({});
  const [plumes, setPlumes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState({});

  // Fetch collection metadata and plumes data
  useEffect(() => {
    let isMounted = true;
    setLoadingData(true);

    const init = async () => {
      try {
        const collectionUrl = `${config.baseStacApiUrl}/collections/${collectionId || config.defaultCollectionId}`;
        const collectionMetadata = await fetchCollectionMetadata(collectionUrl);

        if (!isMounted) return;
        setCollectionMeta(collectionMetadata);

        const metadata = await fetchData(config.metadataEndpoint);
        const stacData = await fetchAllFromSTACAPI(config.stacApiUrl);

        if (!isMounted) return;
        const { data, latestPlume } = await transformMetadata(
          metadata,
          stacData
        );
        setPlumes(data);
        setFilterDateRange({
          startDate: config.defaultStartDate,
          endDate: latestPlume?.properties?.datetime,
        });
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [
    collectionId,
    config.baseStacApiUrl,
    config.metadataEndpoint,
    config.stacApiUrl,
    config.defaultCollectionId,
    config.defaultStartDate,
  ]);

  // Fetch coverage data
  useEffect(() => {
    let isMounted = true;
    const fetchCoverage = async () => {
      try {
        const coverageData = await getCoverageData(config.coverageUrl);
        if (!isMounted) return;

        const indexedCoverageData = createIndexedCoverageData(coverageData);
        if (coverageData?.features?.length > 0) {
          setCoverage(indexedCoverageData);
        }
      } catch (error) {
        console.error('Error fetching coverage data:', error);
      }
    };

    fetchCoverage();
    return () => {
      isMounted = false;
    };
  }, [config.coverageUrl]);

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
      collectionId={collectionId || config.defaultCollectionId}
      loadingData={loadingData}
    />
  );
};

export default EmitInterface;
