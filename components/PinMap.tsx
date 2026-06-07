"use client";

import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:30px;line-height:1;transform:translate(-50%,-90%);filter:drop-shadow(0 2px 2px rgba(0,0,0,.5))">📍</div>`,
  iconSize: [0, 0],
});

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#2a95ed;border:3px solid #fff;box-shadow:0 0 0 3px rgba(42,149,237,.4);transform:translate(-50%,-50%)"></div>`,
  iconSize: [0, 0],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export type PinMapProps = {
  lat: number;
  lng: number;
  /** optional accuracy/target circle radius in meters */
  radiusM?: number;
  /** render the marker as the "me" blue dot instead of a pin */
  asMe?: boolean;
  zoom?: number;
  className?: string;
};

export default function PinMap({
  lat,
  lng,
  radiusM,
  asMe,
  zoom = 17,
  className,
}: PinMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      className={className}
      style={{ height: "100%", width: "100%", borderRadius: 14 }}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
        maxZoom={17}
      />
      <Marker position={[lat, lng]} icon={asMe ? meIcon : pinIcon} />
      {radiusM ? (
        <Circle
          center={[lat, lng]}
          radius={radiusM}
          pathOptions={{ color: "#fec315", fillColor: "#fec315", fillOpacity: 0.15 }}
        />
      ) : null}
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
