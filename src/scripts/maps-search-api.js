import * as atlas from "azure-maps-control";
import "azure-maps-control/dist/atlas.min.css";

const onload = () => {
  // Initialize a map instance.
  const map = new atlas.Map("map", {
    view: "Auto",
    // Add authentication details for connecting to Azure Maps.
    authOptions: {
      // Use Azure Active Directory authentication.
      authType: "aad",
      clientId: "6b603e52-a0de-41df-bfa2-464e262fa984",
      aadAppId: "761aa8c0-ab72-4dfe-8f47-8bd0718acae6",
      aadTenant: "5122b9e0-9741-49fe-8990-94c45441f85d"
    }
  });

  map.events.add("load", () => {
    // Create a data source and add it to the map.
    const datasource = new atlas.source.DataSource();
    map.sources.add(datasource);

    // Add a layer for rendering point data.
    const resultLayer = new atlas.layer.SymbolLayer(datasource);
    map.layers.add(resultLayer);

    // Send a request to Azure Maps search API
    let url = "https://atlas.microsoft.com/search/fuzzy/json?";
    url += "&api-version=1";
    url += "&query=gasoline%20station";
    url += "&lat=47.6101";
    url += "&lon=-122.34255";
    url += "&radius=100000";

    // Parse the API response and create a pin on the map for each result
    fetch(url, {
      headers: {
        Authorization: "Bearer " + map.authentication.getToken(),
        "x-ms-client-id": "6b603e52-a0de-41df-bfa2-464e262fa984"
      }
    })
      .then((response) => response.json())
      .then((response) => {
        // Arrays to store bounds for results.
        const bounds = [];

        // Convert the response into Feature and add it to the data source.
        const searchPins = response.results.map((result) => {
          const position = [result.position.lon, result.position.lat];
          bounds.push(position);
          return new atlas.data.Feature(new atlas.data.Point(position), {
            position: result.position.lat + ", " + result.position.lon
          });
        });

        // Add the pins to the data source.
        datasource.add(searchPins);

        // Set the camera to the bounds of the pins
        map.setCamera({
          bounds: new atlas.data.BoundingBox.fromLatLngs(bounds),
          padding: 40
        });
      });
  });
};

document.body.onload = onload;
