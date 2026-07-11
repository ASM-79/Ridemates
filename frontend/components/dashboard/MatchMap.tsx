"use client";

import { Fragment, useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { getDrivingRoute } from "@/lib/osrm";

// Leaflet's default marker icons reference image paths that don't resolve
// under a bundler — point them at the CDN instead.
function useDefaultMarkerIcon() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
}

export interface MapOrigin {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface MatchMapProps {
  origins: MapOrigin[];
  destination: { lat: number; lng: number; address: string };
}

// One entry per origin: the real road-following path to the destination
// (or null while loading / if OSRM couldn't find a route, in which case we
// fall back to a straight line so the map never looks broken).
function useRoutePaths(origins: MapOrigin[], destination: { lat: number; lng: number }) {
  const [paths, setPaths] = useState<Record<string, [number, number][] | null>>({});

  useEffect(() => {
    let cancelled = false;

    origins.forEach((origin) => {
      const key = origin.id;
      getDrivingRoute([
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
      ]).then((path) => {
        if (!cancelled) {
          setPaths((prev) => ({ ...prev, [key]: path }));
        }
      });
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(origins), destination.lat, destination.lng]);

  return paths;
}

export function MatchMap({ origins, destination }: MatchMapProps) {
  useDefaultMarkerIcon();
  const routePaths = useRoutePaths(origins, destination);

  // With no origins yet (e.g. a fresh dashboard with no ride submitted),
  // fitting bounds to a single point would zoom in absurdly far — pad an
  // artificial box around the destination instead for a sensible city view.
  const boundsPoints: [number, number][] =
    origins.length > 0
      ? [...origins.map((o) => [o.lat, o.lng] as [number, number]), [destination.lat, destination.lng]]
      : [
          [destination.lat - 0.01, destination.lng - 0.01],
          [destination.lat + 0.01, destination.lng + 0.01],
        ];
  const bounds = L.latLngBounds(boundsPoints);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [40, 40] }}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {origins.map((origin) => {
        const key = origin.id;
        const roadPath = routePaths[key];
        const positions: [number, number][] =
          roadPath ?? [
            [origin.lat, origin.lng],
            [destination.lat, destination.lng],
          ];

        return (
          <Fragment key={key}>
            <Marker position={[origin.lat, origin.lng]}>
              <Popup>{origin.name}</Popup>
            </Marker>
            <Polyline positions={positions} pathOptions={{ color: "#c9a227", weight: 4 }} />
          </Fragment>
        );
      })}
      <Marker position={[destination.lat, destination.lng]}>
        <Popup>{destination.address}</Popup>
      </Marker>
    </MapContainer>
  );
}
