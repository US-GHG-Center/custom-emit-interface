import { STACItem } from '../../../dataModel';
import { Features, Metadata } from '../../../dataModel/metadata';
import { Geometry, PointGeometry, Properties } from '../../../dataModel/plumes';
import { Plume } from '../../../dataModel/plumes';
import { getResultArray } from '../../../services/api';

export const transformMetadata = (metadata: Metadata, stacData: STACItem[]) => {
  const metaFeatures = getResultArray(metadata);

  const polygonLookup = new Map<string, Features>();
  let pointLookup = new Map<string, Features>();

  for (const feature of metaFeatures) {
    const id = feature.properties['Data Download']
      .split('/')
      .pop()
      .split('.')[0];

    if (feature.geometry.type === 'Polygon') {
      polygonLookup.set(id, feature);
    } else if (feature.geometry.type === 'Point') {
      pointLookup.set(id, feature);
    }
  }
  stacData = stacData.slice(0, 200);
  // Transform points to markers with associated data
  const plumes: Record<string, Plume> = {};
  stacData.forEach((item: STACItem) => {
    const id = item.id;
    const pointInfo = pointLookup.get(id);
    const polygonInfo = polygonLookup.get(id);
    const properties: Properties = {
      longitudeOfMaxConcentration:
        pointInfo?.properties['Longitude of max concentration'],
      latitudeOfMaxConcentration:
        pointInfo?.properties['Latitude of max concentration'],
      plumeId: pointInfo?.properties['Plume ID'],
      concentrationUncertanity:
        pointInfo?.properties['Concentration Uncertainty (ppm m)'],
      maxConcentration:
        pointInfo?.properties['Max Plume Concentration (ppm m)'],
      orbit: Number(pointInfo?.properties['Orbit']),
      utcTimeObserved: pointInfo?.properties['UTC Time Observed'],
      pointStyle: pointInfo?.properties['style'],
      polygonStyle: polygonInfo?.properties['style'],
      plumeCountNumber: pointInfo?.properties?.plume_complex_count,
      assetLink: pointInfo?.properties['Data Download'],
      dcid: pointInfo?.properties?.DCID,
      daacSceneNumber: pointInfo?.properties['DAAC Scene Numbers'],
      sceneFID: pointInfo?.properties['Scene FIDs'],
      mapEndTime: pointInfo?.properties?.map_endtime,
    };
    const lon =
      pointInfo?.geometry?.type === 'Point'
        ? (pointInfo.geometry.coordinates as number[])[0]
        : undefined;
    const lat =
      pointInfo?.geometry?.type === 'Point'
        ? (pointInfo.geometry.coordinates as number[])[1]
        : undefined;
    plumes[id] = {
      id: item.id,
      bbox: item.bbox,
      type: item.type,
      lat: lat,
      lon: lon,
      links: item.links,
      assets: item.assets,
      geometry: item.geometry,
      collection: item.collection,
      properties: item.properties,
      plumeProperties: properties,
      pointGeometry: pointInfo?.geometry as PointGeometry,
      polygonGeometry: polygonInfo?.geometry as Geometry,
      stac_version: item.stac_version,
      stac_extensions: item.stac_extensions,
    };
  });

  return {
    data: plumes,
  };
};
