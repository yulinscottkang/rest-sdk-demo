import * as atlas from "azure-maps-control";
import MapsRoute from "@azure-rest/maps-route";
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

  map.events.add("load", async () => {
    // Use the access token from the map and create an object that implements the TokenCredential interface.
    const credential = {
      getToken: () => {
        return {
          token: map.authentication.getToken()
        };
      }
    };

    // Create a Route client.
    const client = MapsRoute(credential, "6b603e52-a0de-41df-bfa2-464e262fa984");

    // Create a data source and add it to the map.
    const dataSource = new atlas.source.DataSource();
    map.sources.add(dataSource);

    // Create the GeoJSON objects which represent the start and end points of the route.
    const startPoint = new atlas.data.Feature(new atlas.data.Point([-122.130137, 47.644702]), {
      title: "Redmond",
      icon: "pin-blue"
    });

    const endPoint = new atlas.data.Feature(new atlas.data.Point([-122.3352, 47.61397]), {
      title: "Seattle",
      icon: "pin-round-blue"
    });

    // Add the data to the data source.
    dataSource.add([startPoint, endPoint]);

    // Create a layer for rendering the route line under the road labels.
    map.layers.add(
      new atlas.layer.LineLayer(dataSource, null, {
        strokeColor: "#2272B9",
        strokeWidth: 5,
        lineJoin: "round",
        lineCap: "round"
      }),
      "labels"
    );

    // Create a layer for rendering the start and end points of the route as symbols.
    map.layers.add(
      new atlas.layer.SymbolLayer(dataSource, null, {
        iconOptions: {
          image: ["get", "icon"],
          allowOverlap: true,
          ignorePlacement: true
        },
        textOptions: {
          textField: ["get", "title"],
          offset: [0, 1.2]
        },
        filter: ["any", ["==", ["geometry-type"], "Point"], ["==", ["geometry-type"], "MultiPoint"]] //Only render Point or MultiPoints in this layer.
      })
    );

    // Send a request to the route API
    let url = "https://atlas.microsoft.com/route/directions/json?";
    url += "&api-version=1.0";
    url +=
      "&query=" +
      startPoint.geometry.coordinates[1] +
      "," +
      startPoint.geometry.coordinates[0] +
      ":" +
      endPoint.geometry.coordinates[1] +
      "," +
      endPoint.geometry.coordinates[0];

    // Process request
    fetch(url, {
      headers: {
        Authorization: "Bearer " + map.authentication.getToken(),
        "x-ms-client-id": "6b603e52-a0de-41df-bfa2-464e262fa984"
      }
    })
      .then((response) => response.json())
      .then((response) => {
        const bounds = [];
        const route = response.routes[0];
        
        // Create an array to store the coordinates of each turn
        let routeCoordinates = [];
        route.legs.forEach((leg) => {
          const legCoordinates = leg.points.map((point) => {
            const position = [point.longitude, point.latitude];
            bounds.push(position);
            return position;
          });
          // Add each turn coordinate to the array
          routeCoordinates = routeCoordinates.concat(legCoordinates);
        });

        // Add route line to the dataSource
        dataSource.add(new atlas.data.Feature(new atlas.data.LineString(routeCoordinates)));

        // Update the map view to center over the route.
        map.setCamera({
          bounds: new atlas.data.BoundingBox.fromLatLngs(bounds),
          padding: 40
        });
      });
  });
};

/**
 * Helper function to convert a route response into a GeoJSON FeatureCollection.
 */
const getFeatures = (routes) => {
  const bounds = [];
  const features = routes.map((route, index) => {
    const multiLineCoords = route.legs.map((leg) => {
      return leg.points.map((coord) => {
        const position = [coord.longitude, coord.latitude];
        bounds.push(position);
        return position;
      });
    });

    // Include all properties on the route object except legs.
    // Legs is used to create the MultiLineString, so we only need the summaries.
    // The legSummaries property replaces the legs property with just summary data.
    const props = {
      ...route,
      legSummaries: route.legs.map((leg) => leg.summary),
      resultIndex: index
    };
    delete props.legs;

    return {
      type: "Feature",
      geometry: {
        type: "MultiLineString",
        coordinates: multiLineCoords
      },
      properties: props
    };
  });

  return {
    type: "FeatureCollection",
    features: features,
    bbox: new atlas.data.BoundingBox.fromLatLngs(bounds)
  };
};

document.body.onload = onload;
