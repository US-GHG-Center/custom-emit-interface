export interface PlumeMeta {
  type: string;
  geometry: {
    coordinates: [][];
    type: string;
  };
  properties: {
    longitudeOfMaxConcentration: number;
    latitudeOfMaxConcentration: number;
    plumeId: string;
    maxConcentration: number;
    orbit: number;
    timeObserved: string;
    style: Style;
  };
  id: string; // Format: <country>_<state>_<region>_<plume_id>. e.g. Mexico_Durango_BV1_BV1-1
  country: string;
  administrativeDivision: string;
  //need to remove this
  lat: string;
  lon: string;
  //
  plumeSourceId: string;
  plumeSourceName: string;
  startDatetime: string;
  endDatetime: string;
  imageUrl: string;
  tiffUrl: string;
  totalReleaseMass: string;
  colEnhancements: string;
  duration: string;
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
