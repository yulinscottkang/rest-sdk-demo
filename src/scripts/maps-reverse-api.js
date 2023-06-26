import * as atlas from "azure-maps-control";
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
    // Update the style of mouse cursor to a pointer
    map.getCanvasContainer().style.cursor = "pointer";

    // Create a popup
    const popup = new atlas.Popup();

    // Upon a mouse click, open a popup at the clicked location and render in the popup the address of the clicked location
    map.events.add("click", async (e) => {
      //Send a request to Azure Maps reverse address search API
      let url = "https://atlas.microsoft.com/search/address/reverse/json?";
      url += "&api-version=1.0";
      url += "&query=" + e.position[1] + "," + e.position[0];

      // Process request
      fetch(url, {
        headers: {
          Authorization: "Bearer " + map.authentication.getToken(),
          "x-ms-client-id": "6b603e52-a0de-41df-bfa2-464e262fa984"
        }
      })
        .then((response) => response.json())
        .then((response) => {
          const popupContent = document.createElement("div");
          popupContent.classList.add("popup-content");
          const address = response["addresses"];
          popupContent.innerHTML =
            address.length !== 0 ? address[0]["address"]["freeformAddress"] : "No address for that location!";
          popup.setOptions({
            position: e.position,
            content: popupContent
          });
          // render the popup on the map
          popup.open(map);
        });
    });
  });
};

document.body.onload = onload;
