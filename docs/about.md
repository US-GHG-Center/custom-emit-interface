# EMIT Methane Plume Viewer

## Overview
The EMIT Methane Plume Viewer is a React-based geospatial visualization dashboard that integrates with Mapbox GL to allow scientists and developers to explore methane plume emissions detected by the EMIT satellite. It supports STAC data ingestion, filtering, zoom-level raster switching, marker and polygon overlays, and custom UI controls for interaction.

This is built using the library https://github.com/US-GHG-Center/custom-interface-ui-library

---

## 1. Application Structure

**Entry Point:** `DashboardContainer`
- Fetches metadata, STAC data, and coverage data.
- Transforms and processes plume data.
- Passes processed data into the main `Dashboard` component.

**Main Component:** `Dashboard`
- Core layout with title, controls, map, drawers, and data flow.
- Manages application states: plume data, zoom, filters, hover/click.

**Map Context:** `mapContext`
- Provides access to the Mapbox map object via React context.

---

## 2. Data Models

### `Plume`
```ts
interface Plume {
  id: string;
  lat: number;
  lon: number;
  bbox: number[];
  geometry: Geometry;
  plumeProperties: Properties;
  polygonGeometry: Geometry;
  pointGeometry: PointGeometry;
  collection: string;
}
```

### `CoverageData`
```ts
interface CoverageFeature {
  geometry: Geometry;
  properties: { start_time: string; end_time: string };
}
```

---

## 3. Core Features

### a. **STAC Integration**
- `fetchAllFromSTACAPI()` fetches all STAC items.
- `transformMetadata()` merges STAC data with point/polygon metadata.

### b. **Map Layers**
- `VisualizationLayers` dynamically renders raster, line, and fill layers.
- `MarkerFeature` adds custom SVG markers with popups.
- `CoverageLayers` renders static background polygons.

### c. **Interactive Controls**
- `MapControls` container includes:
  - Hamburger toggle (`HamburgerControl`)
  - Home button (`HomeControl`)
  - Measurement tool (`MeasureDistanceControl`)
  - Unit toggle (`ChangeUnitControl`)
  - Layer visibility toggle (`LayerVisibilityControl`)

### d. **Measurement Tool**
- Draws points and lines with turf.js to calculate distances.
- Layers: `measure-points`, `measure-line`, `measure-label`.

---

## 4. Filtering & Search

### `FilterByDate`
- Slider UI with moment.js for temporal range filtering.

### `Search`
- Trie-based full-text search from location/plume ID.
- Uses `TrieSearch` to efficiently suggest matches.

---



For any questions or integration help, contact the platform maintainers.

