export interface EmitInterfaceConfig {
  baseStacApiUrl: string;
  metadataEndpoint: string;
  stacApiUrl: string;
  coverageUrl: string;
  defaultCollectionId: string;
  defaultZoomLocation: [number, number];
  defaultZoomLevel: number;
  defaultStartDate: string;
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