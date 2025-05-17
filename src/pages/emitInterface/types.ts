export interface EmitInterfaceConfig {
  baseStacApiUrl: string;
  metadataEndpoint: string;
  stacApiUrl: string;
  coverageUrl: string;
  mapboxToken: string;
  mapboxStyle: string;
  basemapStyle: string;
  geoApifyKey: string;
  defaultCollectionId: string;
  defaultZoomLocation: [number, number];
  defaultZoomLevel: number;
  defaultStartDate: string;
  latlonEndpoint: string;
}

export interface EmitInterfaceProps {
  /**
   * The STAC collection ID to fetch data from
   */
  collectionId?: string;

  /**
   * Initial zoom location [longitude, latitude]
   */
  zoomLocation?: [number, number];

  /**
   * Initial zoom level
   */
  zoomLevel?: number;

  /**
   * Configuration object for API endpoints and other settings
   */
  config?: Partial<EmitInterfaceConfig>;
}
