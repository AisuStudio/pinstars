"use client";

import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const meIcon = L.divIcon({
  className: "",
  html: `<div style="width:20px;height:20px;border-radius:50%;background:#2a95ed;border:3px solid #fff;box-shadow:0 0 0 4px rgba(42,149,237,.35);transform:translate(-50%,-50%)"></div>`,
  iconSize: [0, 0],
});

function FitBoth({
  me,
  target,
}: {
  me: [number, number] | null;
  target: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    if (me) {
      map.fitBounds([me, target], { padding: [50, 50], maxZoom: 18 });
    } else {
      map.setView(target, 16);
    }
  }, [me, target, map]);
  return null;
}

/**
 * Leaflet measures its container on init. Inside a flex column the final
 * height isn't settled at that moment, so the map comes up at size 0 and
 * never loads tiles. Re-measure once the layout is painted and whenever the
 * container resizes.
 */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const raf = requestAnimationFrame(fix);
    const t = setTimeout(fix, 200);
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    window.addEventListener("resize", fix);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", fix);
    };
  }, [map]);
  return null;
}

export type PlayMapProps = {
  target: [number, number];
  radiusM: number;
  me: [number, number] | null;
  /** reveal exact target pin (e.g. when DA) */
  reveal?: boolean;
};

export default function PlayMap({ target, radiusM, me, reveal }: PlayMapProps) {
  return (
    <MapContainer
      center={target}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png" maxZoom={17} />
      <Circle
        center={target}
        radius={Math.max(radiusM, 25)}
        pathOptions={{
          color: reveal ? "#13aa12" : "#fec315",
          fillColor: reveal ? "#13aa12" : "#fec315",
          fillOpacity: 0.18,
          weight: 3,
        }}
      />
      {me && <Marker position={me} icon={meIcon} />}
      <MapResizer />
      <FitBoth me={me} target={target} />
    </MapContainer>
  );
}
