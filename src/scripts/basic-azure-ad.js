import MapsSearch from "@azure-rest/maps-search";
import { InteractiveBrowserCredential } from "@azure/identity";

const clientId = process.env.AZURE_CLIENT_ID || "";
const tenantId = process.env.AZURE_TENANT_ID || "";
const credential = new InteractiveBrowserCredential({
  tenantId,
  clientId
});
const client = MapsSearch(credential, "6b603e52-a0de-41df-bfa2-464e262fa984");

const onload = async () => {
  const html = [];
  const response = await client
    .path("/search/address/{format}", "json")
    .get({ queryParameters: { query: "1 microsoft way, redmond, wa" } });

  // Display the total results.
  html.push("Total results: ", response.body.summary.numResults, "<br/><br/>");

  // Create a table of the results.
  html.push("<table><tr><td>Result</td><td>Latitude</td><td>Longitude</td></tr>");
  response.body.results.forEach((result) => {
    html.push(
      "<tr><td>",
      result.address.freeformAddress,
      "</td><td>",
      result.position.lat,
      "</td><td>",
      result.position.lon,
      "</td></tr>"
    );
  });

  html.push("</table>");

  // Add the resulting HTML to the body of the page.
  document.body.innerHTML = html.join("");
};

document.body.onload = onload;
