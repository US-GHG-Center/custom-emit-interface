import { EmitInterfaceConfig } from '../pages/emitInterface/types';

/**
 * Default configuration for the EMIT Interface
 * These values will be used if no user configuration is provided
 */
const defaultConfig: EmitInterfaceConfig = {
  // API Endpoints
  stacApiUrl:
    "https://earth.gov/ghgcenter/api/stac/collections/emit-ch4plume-v1/items",
  metadataEndpoint:
    "https://earth.jpl.nasa.gov/emit-mmgis-lb/Missions/EMIT/Layers/coverage/combined_plume_metadata.json",
  coverageUrl:
    "https://earth.jpl.nasa.gov/emit-mmgis/Missions/EMIT/Layers/coverage/coverage_pub.json",
  baseStacApiUrl: "https://earth.gov/ghgcenter/api/stac/",
  mapboxToken:
    "pk.eyJ1IjoiY292aWQtbmFzYSIsImEiOiJjbGNxaWdqdXEwNjJnM3VuNDFjM243emlsIn0.NLbvgae00NUD5K64CD6ZyA",
  mapboxStyle: "mapbox://styles/covid-nasa",
  basemapStyle: "cldu1cb8f00ds01p6gi583w1m",
  geoApifyKey: "58347c078a5645d6b6367ae88984be7c",
  latlonEndpoint: "https://api.geoapify.com/v1/geocode/reverse",

  // Map Configuration
  defaultZoomLocation: [-98.771556, 32.967243],
  defaultZoomLevel: 4,
  defaultCollectionId: 'emit-ch4plume-v1',

  // Date Range
  defaultStartDate: '2022-08-22',
};

/**
 * Merges user configuration with default configuration
 * @param {Partial<EmitInterfaceConfig>} userConfig - User provided configuration
 * @returns {EmitInterfaceConfig} Merged configuration
 */
export const getConfig = (
  userConfig: Partial<EmitInterfaceConfig> = {}
): EmitInterfaceConfig => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};

interface ValidationResult {
  result: boolean;
  missingFields: string[];
}

/**
 * Validates the configuration
 * @param {EmitInterfaceConfig} config - Configuration to validate
 * @returns {ValidationResult} Validation result with missing fields if any
 */
export const validateConfig = (
  config: EmitInterfaceConfig
): ValidationResult => {
  const requiredFields: (keyof EmitInterfaceConfig)[] = [
    'stacApiUrl',
    'metadataEndpoint',
    'coverageUrl',
    'baseStacApiUrl',
  ];

  const missingFields = requiredFields.filter((field) => !config[field]);

  if (missingFields.length > 0) {
    return { result: false, missingFields };
  }
  return { result: true, missingFields: [] };
};
