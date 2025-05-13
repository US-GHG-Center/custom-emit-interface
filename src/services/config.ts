import { EmitInterfaceConfig } from '../pages/emitInterface/types';

/**
 * Default configuration for the EMIT Interface
 * These values will be used if no user configuration is provided
 */
const defaultConfig: EmitInterfaceConfig = {
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
 * @param {Partial<EmitInterfaceConfig>} userConfig - User provided configuration
 * @returns {EmitInterfaceConfig} Merged configuration
 */
export const getConfig = (userConfig: Partial<EmitInterfaceConfig> = {}): EmitInterfaceConfig => {
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
export const validateConfig = (config: EmitInterfaceConfig): ValidationResult => {
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