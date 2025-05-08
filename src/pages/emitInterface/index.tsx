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

import { getConfig, validateConfig } from '../../services/config.js';

export interface EmitInterfaceProps {
  collectionId?: string;
  zoomLocation?: [number, number];
  zoomLevel?: number;
  config?: Record<string, any>;
}

export interface Config {
  stacApiUrl: string;
  metadataEndpoint: string;
  coverageUrl: string;
  baseStacApiUrl: string;
  defaultZoomLocation: [number, number];
  defaultZoomLevel: number;
  defaultCollectionId: string;
  defaultStartDate: string;
}

/**
 * EmitInterface Component
 *
 * A reusable component that provides the EMIT Methane Plume Viewer interface.
 * This component handles data fetching, state management, and rendering of the dashboard.
 *
 * @component
 * @param {EmitInterfaceProps} props - Component props
 * @returns {JSX.Element} The rendered EMIT interface
 */
export const EmitInterface: React.FC<EmitInterfaceProps> = ({
  collectionId,
  zoomLocation: initialZoomLocation,
  zoomLevel: initialZoomLevel,
  config: userConfig = {},
}) => {
  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => {
    const mergedConfig = getConfig(userConfig);
    validateConfig(mergedConfig);
    return mergedConfig;
  }, [userConfig]);

  const [searchParams] = useSearchParams();
  const [coverage, setCoverage] = useState<any>();
  const [zoomLocation, setZoomLocation] = useState<[number, number]>(
    initialZoomLocation ||
      (searchParams.get('zoom-location')?.split(',').map(Number) as [number, number]) ||
      config.defaultZoomLocation
  );
  const [zoomLevel, setZoomLevel] = useState<number>(
    initialZoomLevel ||
      Number(searchParams.get('zoom-level')) ||
      config.defaultZoomLevel
  );
  const [collectionMeta, setCollectionMeta] = useState<Record<string, any>>({});
  const [plumes, setPlumes] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

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