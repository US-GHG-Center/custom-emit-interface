import { PlumePoint, STACItem } from '../../../dataModel';
import { getResultArray } from '../../../services/api';

export const transformMetadata = (metadata: any, stacData: STACItem[]) => {
  const metaFeatures = getResultArray(metadata);
  // Create lookup map for STAC items for O(1) access
  const stacLookup = new Map(stacData.map((item: any) => [item.id, item]));
  const polygonLookup = new Map();
  let points: PlumePoint[] = [];

  for (const feature of metaFeatures) {
    const id = feature.properties['Data Download']
      .split('/')
      .pop()
      .split('.')[0];

    if (feature.geometry.type === 'Polygon') {
      polygonLookup.set(id, feature);
    } else if (feature.geometry.type === 'Point') {
      points.push({
        id,
        lon: feature?.geometry?.coordinates[0],
        lat: feature?.geometry?.coordinates[1],
        type: 'Feature',
        properties: {
          longitudeOfMaxConcentration:
            feature.properties['Longitude of max concentration'],
          latitudeOfMaxConcentration:
            feature.properties['Latitude of max concentration'],
          plumeId: feature.properties['Plume ID'],
          concentrationUncertanity:
            feature.properties['Concentration Uncertainty (ppm m)'],
          maxConcentration:
            feature.properties['Max Plume Concentration (ppm m)'],
          orbit: Number(feature.properties['Orbit']),
          timeObserved: feature.properties['UTC Time Observed'],
          style: feature.properties['style'],
        },
        plumeSourceId: feature.properties['DCID'] || '',
        startDatetime: feature.properties['UTC Time Observed'],
        endDatetime: feature.properties['map_endtime'],
        tiffUrl: feature.properties['Data Download'],
        plumeComplexCount: feature.properties['plume_complex_count'] || 0,
        plumegeometry: polygonLookup.get(id)?.geometry,
      });
    }
  }
  points = points.slice(0, 200);
  // Transform points to markers with associated data
  const polygons = new Map();
  for (const { id } of points) {
    if (polygonLookup.has(id)) {
      polygons.set(id, {
        ...(stacLookup.get(id) || {}),
        ...polygonLookup.get(id),
      });
    }
  }

  return {
    markers: points,
    polygons: polygons,
  };
};
