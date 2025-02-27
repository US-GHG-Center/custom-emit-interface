export interface PlumePoint {
  type: string;
  plumegeometry: {
    coordinates: [][];
    type: string;
  };
  properties: {
    longitudeOfMaxConcentration: number;
    latitudeOfMaxConcentration: number;
    concentrationUncertanity: number;
    plumeId: string;
    maxConcentration: number;
    orbit: number;
    timeObserved: string;
    style: Style;
  };
  id: string;
  lat: string;
  lon: string;
  plumeSourceId: string;
  startDatetime: string;
  endDatetime: string;
  tiffUrl: string;
  plumeComplexCount: number;
}

export interface Style {
  color: string;
  fillOpacity: number;
  maxZoom: number;
  minZoom: number;
  opacity: number;
  radius: number;
  weight: number;
}
