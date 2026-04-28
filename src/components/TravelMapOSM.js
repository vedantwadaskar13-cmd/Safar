import React from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const center = [20.5937, 78.9629];

const TravelMapOSM = ({ routes }) => {
  return (
    <MapContainer
      center={center}
      zoom={5}
      style={{
        height: "350px",
        width: "100%",
        borderRadius: "18px"
      }}
    >

      {/* OpenStreetMap Layer */}
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Routes */}
      {routes?.map((route, i) =>
        route.geometry ? (
          <Polyline
            key={i}
            positions={route.geometry.map(p => [p.lat, p.lng])}
            color="#4285F4"
          />
        ) : null
      )}

    </MapContainer>
  );
};

export default TravelMapOSM;
