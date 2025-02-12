import React from "react";
import { createRoot } from "react-dom/client";
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";

const MyMap = () => {
  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      onLoad={() => console.log("Maps API has loaded.")}
    >
      <Map
        style={{ width: "100%", height: "500px" }} // 幅100%、高さ500px
        defaultZoom={13}
        defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
        onCameraChanged={(ev) =>
          console.log("camera changed:", ev.detail.center, "zoom:", ev.detail.zoom)
        }
      >
      </Map>
      <h1>Hello World</h1>
    </APIProvider>
  );
};

export default MyMap;