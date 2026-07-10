'use client'

import MapGL, { Source, Layer, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { HeatmapLayerSpecification } from 'mapbox-gl'
import type { FunnelEvent } from './types'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface Props {
  events: FunnelEvent[]
}

const heatmapLayer: HeatmapLayerSpecification = {
  id: 'funnel-heat',
  type: 'heatmap',
  source: 'funnel-events',
  paint: {
    'heatmap-weight': 1,
    'heatmap-intensity': 1,
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)',
    ],
    'heatmap-radius': 22,
    'heatmap-opacity': 0.85,
  },
}

export function LocationHeatmap({ events }: Props) {
  const geoJson = {
    type: 'FeatureCollection' as const,
    features: events
      .filter((e) => e.geo_lat != null && e.geo_lng != null)
      .map((e) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [e.geo_lng!, e.geo_lat!] },
        properties: {},
      })),
  }

  const withGeo = geoJson.features.length

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-800">Visitor Location Heatmap</h3>
        <span className="text-xs text-slate-400">{withGeo} geolocated events</span>
      </div>
      <div className="h-[360px] rounded-lg overflow-hidden border border-slate-100">
        {withGeo === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">No location data yet</div>
        ) : (
          <MapGL
            mapboxAccessToken={MAPBOX_TOKEN}
            initialViewState={{ longitude: -98.5795, latitude: 39.8283, zoom: 3.2 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/light-v11"
          >
            <NavigationControl position="top-right" />
            <Source id="funnel-events" type="geojson" data={geoJson}>
              <Layer {...heatmapLayer} />
            </Source>
          </MapGL>
        )}
      </div>
    </div>
  )
}
