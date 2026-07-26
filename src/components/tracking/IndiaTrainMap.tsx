import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LiveTracking, StationStop } from '../../types';
import { MapPin, Navigation, Compass, Maximize2, RefreshCw } from 'lucide-react';

interface IndiaTrainMapProps {
  trackingData: LiveTracking;
}

export const IndiaTrainMap: React.FC<IndiaTrainMapProps> = ({ trackingData }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center map over India (Lat: 22.5937, Lng: 78.9629)
      const map = L.map(mapContainerRef.current, {
        center: [22.5937, 78.9629],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false
      });

      // CartoDB Voyager light tile layer for crisp, modern GIS rendering
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control at bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Update map markers, polyline, and view bounds whenever trackingData changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear existing markers & lines
    layerGroup.clearLayers();

    // Collect all stops in order
    const allStops: StationStop[] = [
      ...trackingData.stopsPassed,
      ...trackingData.upcomingStops
    ];

    // Build polyline latlng array
    const routeCoordinates: [number, number][] = [];

    allStops.forEach(stop => {
      if (stop.latitude && stop.longitude) {
        routeCoordinates.push([stop.latitude, stop.longitude]);
      }
    });

    // Ensure train current position is valid
    const trainPos: [number, number] = [
      trackingData.coordinates.lat,
      trackingData.coordinates.lng
    ];

    // Custom Icon Creators using Leaflet DivIcons
    const createStationMarkerIcon = (code: string, isTerminal: boolean, terminalType?: 'origin' | 'destination') => {
      const bgColor = terminalType === 'origin' ? '#10b981' : terminalType === 'destination' ? '#ef4444' : '#6366f1';
      return L.divIcon({
        className: 'custom-station-icon',
        html: `
          <div style="
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(15, 23, 42, 0.9);
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 9999px;
            border: 2px solid ${bgColor};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: sans-serif;
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
          ">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: ${bgColor};
              display: inline-block;
            "></span>
            <span>${code}</span>
          </div>
        `,
        iconSize: [60, 24],
        iconAnchor: [30, 12]
      });
    };

    // Train Animated GPS Icon
    const trainIcon = L.divIcon({
      className: 'custom-train-live-icon',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="
            position: absolute;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(99, 102, 241, 0.35);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            background: #4f46e5;
            color: #ffffff;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2.5px solid #ffffff;
            box-shadow: 0 4px 16px rgba(79, 70, 229, 0.6);
            z-index: 10;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect width="16" height="16" x="4" y="3" rx="2"/>
              <path d="M4 11h16"/>
              <path d="M12 3v8"/>
              <path d="m8 19-2 3"/>
              <path d="m18 22-2-3"/>
              <circle cx="8" cy="15" r="1"/>
              <circle cx="16" cy="15" r="1"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Draw Route Polylines
    if (routeCoordinates.length > 1) {
      // Background full route line (dashed grey/indigo)
      L.polyline(routeCoordinates, {
        color: '#94a3b8',
        weight: 4,
        dashArray: '6, 8',
        opacity: 0.7
      }).addTo(layerGroup);

      // Active traveled path line (solid emerald)
      const passedCoordinates: [number, number][] = [];
      trackingData.stopsPassed.forEach(s => {
        if (s.latitude && s.longitude) passedCoordinates.push([s.latitude, s.longitude]);
      });
      passedCoordinates.push(trainPos);

      if (passedCoordinates.length > 1) {
        L.polyline(passedCoordinates, {
          color: '#10b981',
          weight: 5,
          opacity: 0.95
        }).addTo(layerGroup);
      }

      // Upcoming path line (solid indigo/violet)
      const upcomingCoordinates: [number, number][] = [trainPos];
      trackingData.upcomingStops.forEach(s => {
        if (s.latitude && s.longitude) upcomingCoordinates.push([s.latitude, s.longitude]);
      });

      if (upcomingCoordinates.length > 1) {
        L.polyline(upcomingCoordinates, {
          color: '#6366f1',
          weight: 4,
          dashArray: '3, 6',
          opacity: 0.95
        }).addTo(layerGroup);
      }
    }

    // Add Station Markers along the Route
    allStops.forEach((stop, index) => {
      if (!stop.latitude || !stop.longitude) return;

      const isOrigin = index === 0;
      const isDestination = index === allStops.length - 1;
      const termType = isOrigin ? 'origin' : isDestination ? 'destination' : undefined;

      const marker = L.marker([stop.latitude, stop.longitude], {
        icon: createStationMarkerIcon(stop.stationCode, isOrigin || isDestination, termType)
      });

      marker.bindPopup(`
        <div style="font-family: system-ui, sans-serif; padding: 4px; color: #0f172a;">
          <div style="font-size: 12px; font-weight: 800; color: #4338ca;">${stop.stationName} (${stop.stationCode})</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Distance: <strong>${stop.distanceKm} km</strong></div>
          <div style="font-size: 11px; color: #64748b;">Arr: <strong>${stop.arrivalTime}</strong> | Dep: <strong>${stop.departureTime}</strong></div>
          <div style="font-size: 10px; color: #059669; margin-top: 4px; font-weight: 700;">Platform #${stop.platformNumber}</div>
        </div>
      `);

      marker.addTo(layerGroup);
    });

    // Add Live Train Marker
    const trainMarker = L.marker(trainPos, { icon: trainIcon });
    trainMarker.bindPopup(`
      <div style="font-family: system-ui, sans-serif; padding: 4px; color: #0f172a;">
        <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase;">LIVE SATELLITE TELEMETRY</div>
        <div style="font-size: 14px; font-weight: 900; color: #1e1b4b; margin: 2px 0;">${trackingData.trainName} (#${trackingData.trainNumber})</div>
        <div style="font-size: 11px; color: #475569;">Speed: <strong style="color: #4f46e5;">${trackingData.speedKmh} km/h</strong></div>
        <div style="font-size: 11px; color: #475569;">En route to: <strong>${trackingData.nextStation}</strong></div>
        <div style="font-size: 10px; font-weight: 700; color: ${trackingData.status === 'On Time' ? '#059669' : '#d97706'}; margin-top: 4px;">
          Status: ${trackingData.status} ${trackingData.delayMinutes > 0 ? `(+${trackingData.delayMinutes}m)` : ''}
        </div>
      </div>
    `).openPopup();

    trainMarker.addTo(layerGroup);

    // Auto-fit Bounds to contain the entire Indian route
    if (routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      bounds.extend(trainPos);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 9 });
    }
  }, [trackingData]);

  // Center on Live Train
  const handleRecenterTrain = () => {
    if (!mapInstanceRef.current || !trackingData) return;
    mapInstanceRef.current.flyTo([trackingData.coordinates.lat, trackingData.coordinates.lng], 8, {
      duration: 1.2
    });
  };

  // Zoom Full India Map
  const handleFullIndiaView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([22.5937, 78.9629], 5, {
      duration: 1.2
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Live Indian Railways GPS Map & Corridor Route
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time track positioning from <span className="font-semibold text-emerald-600">{trackingData.originName || trackingData.stopsPassed[0]?.stationName || trackingData.currentStation}</span> to <span className="font-semibold text-indigo-600">{trackingData.destinationName || trackingData.upcomingStops[trackingData.upcomingStops.length - 1]?.stationName || trackingData.nextStation}</span>
          </p>
        </div>

        {/* Map Control Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecenterTrain}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Focus Train</span>
          </button>
          <button
            onClick={handleFullIndiaView}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Full India View</span>
          </button>
        </div>
      </div>

      {/* Map Container Element */}
      <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Route Legend overlay */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl border border-slate-700/80 shadow-lg text-[11px] space-y-1.5 pointer-events-auto max-w-[240px]">
          <div className="font-extrabold text-slate-300 text-[10px] uppercase tracking-wider mb-1">
            Indian Rail Corridor Legend
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></div>
            <span>Origin Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
            <span>Destination Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-emerald-500 rounded"></div>
            <span>Traveled Route Segment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-indigo-500 border-dashed border-white rounded"></div>
            <span>Upcoming Route Corridor</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
            <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 border border-white flex items-center justify-center font-bold text-[8px]">
              🚆
            </div>
            <span className="font-bold text-emerald-400">Live GPS Train Position</span>
          </div>
        </div>
      </div>
    </div>
  );
};
