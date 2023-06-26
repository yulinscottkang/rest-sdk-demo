import * as atlas from "azure-maps-control";
import MapsSearch from "@azure-rest/maps-search";
import "azure-maps-control/dist/atlas.min.css";

const onload = async () => {
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

  map.events.add("ready", async () => {
    // Use the access token from the map and create an object that implements the TokenCredential interface.
    const credential = {
      getToken: () => {
        return {
          token: map.authentication.getToken()
        };
      }
    };

    // Create a Search client.
    const client = MapsSearch(credential, "6b603e52-a0de-41df-bfa2-464e262fa984");

    // Update the style of mouse cursor to a pointer
    map.getCanvasContainer().style.cursor = "pointer";

    // Create a popup
    const popup = new atlas.Popup();

    // Upon a mouse click, open a popup at the clicked location and render in the popup the address of the clicked location
    map.events.add("click", async (e) => {
      const position = [e.position[1], e.position[0]];

      // Execute the reverse address search query and open a popup once a response is received
      const response = await client.path("/search/address/reverse/{format}", "json").get({
        queryParameters: { query: position }
      });

      // Get address data from response
      const data = response.body.addresses;

      // Construct the popup
      var popupContent = document.createElement("div");
      popupContent.classList.add("popup-content");
      popupContent.innerHTML = data.length !== 0 ? data[0].address.freeformAddress : "No address for that location!";
      popup.setOptions({
        position: e.position,
        content: popupContent
      });

      // Render the popup on the map
      popup.open(map);
    });
  });
};

document.body.onload = onload;
