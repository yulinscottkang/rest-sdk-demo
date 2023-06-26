import MapsSearch from "@azure-rest/maps-search";
import { AzureKeyCredential } from "@azure/core-auth";

const subscriptionKey = process.env.MAPS_SUBSCRIPTION_KEY || "";
const credential = new AzureKeyCredential(subscriptionKey);
const client = MapsSearch(credential);
// const client = MapsSearch(credential, { baseUrl: 'https://atlas.azure.us'});

const onload = async () => {
  // Search for Starbucks near Seattle
  const response = await client.path("/search/fuzzy/{format}", "json").get({
    queryParameters: {
      query: "Starbucks",
      lat: 47.6101,
      lon: -122.34255,
      countrySet: ["US"]
    }
  });

  response.body.results.forEach((result) => {
    const li = document.createElement("li");
    li.innerHTML = `${result.address.freeformAddress} (${result.position.lat}, ${result.position.lon})`;
    document.getElementById("results").appendChild(li);
  });
};

document.body.onload = onload;
