"use client";

import { Fragment, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";

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
  name: string;
  lat: number;
  lng: number;
}

export interface MatchMapProps {
  origins: MapOrigin[];
  destination: { lat: number; lng: number; address: string };
}

export function MatchMap({ origins, destination }: MatchMapProps) {
  useDefaultMarkerIcon();

  const bounds = L.latLngBounds([
    ...origins.map((o) => [o.lat, o.lng] as [number, number]),
    [destination.lat, destination.lng],
  ]);

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
      {origins.map((origin) => (
        <Fragment key={`${origin.lat}-${origin.lng}`}>
          <Marker position={[origin.lat, origin.lng]}>
            <Popup>{origin.name}</Popup>
          </Marker>
          <Polyline
            positions={[
              [origin.lat, origin.lng],
              [destination.lat, destination.lng],
            ]}
            pathOptions={{ color: "#c9a227", weight: 3 }}
          />
        </Fragment>
      ))}
      <Marker position={[destination.lat, destination.lng]}>
        <Popup>{destination.address}</Popup>
      </Marker>
    </MapContainer>
  );
}
