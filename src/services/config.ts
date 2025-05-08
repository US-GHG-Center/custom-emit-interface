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
 * Default configuration for the EMIT Interface
 * These values will be used if no user configuration is provided
 */
const defaultConfig: Config = {
  // API Endpoints
  stacApiUrl: process.env.REACT_APP_STAC_API_URL || '',
  metadataEndpoint: process.env.REACT_APP_METADATA_ENDPOINT || '',
  coverageUrl: process.env.REACT_APP_COVERAGE_URL || '',
  baseStacApiUrl: process.env.REACT_APP_BASE_STAC_API_URL || '',

  // Map Configuration
  defaultZoomLocation: [-98.771556, 32.967243],
  defaultZoomLevel: 4,
  defaultCollectionId: 'emit-ch4plume-v1',

  // Date Range
  defaultStartDate: '2022-08-22',
};

/**
 * Merges user configuration with default configuration
 * @param {Partial<Config>} userConfig - User provided configuration
 * @returns {Config} Merged configuration
 */
export const getConfig = (userConfig: Partial<Config> = {}): Config => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};

/**
 * Validates the configuration
 * @param {Config} config - Configuration to validate
 * @throws {Error} If required configuration is missing
 */
export const validateConfig = (config: Config): void => {
  const requiredFields: (keyof Config)[] = [
    'stacApiUrl',
    'metadataEndpoint',
    'coverageUrl',
    'baseStacApiUrl',
  ];

  const missingFields = requiredFields.filter(
    (field) => !config[field]
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Missing required configuration fields: ${missingFields.join(
        ', '
      )}`
    );
  }
}; 