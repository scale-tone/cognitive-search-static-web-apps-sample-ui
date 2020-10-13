# Cognitive Search Static Web Apps sample

![screenshot1](https://raw.githubusercontent.com/scale-tone/cognitive-search-static-web-apps-sample-ui/master/public/screenshot1.png)

A simple sample UI for your [Azure Cognitive Search](https://azure.microsoft.com/en-us/services/search/) index. Similar to [this official sample](https://github.com/Azure-Samples/azure-search-knowledge-mining/tree/master/02%20-%20Web%20UI%20Template), but is implemented as a [Azure Static Web App](https://docs.microsoft.com/en-us/azure/static-web-apps/) and built with React and TypeScript. Implements the so called *faceted search* user experience, when the user first enters their search phrase and then narrows down search resuls with facets on the left sidebar. 

![build-status](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/workflows/Azure%20Static%20Web%20Apps%20CI/CD/badge.svg)

The [client part](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/src) is a typical React-based SPA (Single-Page App) written in TypeScript with extensive use of [MobX](https://mobx.js.org/README.html) and [Material-UI](https://material-ui.com/). And it doesn't have a [backend](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/api) as such, all requests to [Cognitive Search REST API](https://docs.microsoft.com/en-us/azure/search/search-query-overview) are transparently propagated through an [Azure Functions Proxy](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/api/proxies.json), that appends the Cognitive Search **api-key** to each request - so the  **api-key** is not exposed to the clients. Queries made by user are also reflected in the browser's address bar. This serves three purposes: makes those links sharable, enables navigation history ("Back" and "Forward" buttons) and also helps you learn Cognitive Search REST API's query syntax. List of search results supports infinite scrolling. If your documents have geo coordinates attached, then search results are also visualized with an [Azure Maps](https://azure.microsoft.com/en-us/services/azure-maps/) control. Clicking on a search result produces the *Details* view, the *Trascript* tab of it highlights all occurences of your search phrase in the document and allows to navigate across them.

Please, also see [this blog post](https://scale-tone.github.io/2020/09/28/cognitive-search-static-web-apps-demo).

## Live demo

https://lively-sand-033e9ec03.azurestaticapps.net 

That deployment is pointed to [the official Azure Cognitive Search Sample Data](https://docs.microsoft.com/en-us/samples/azure-samples/azure-search-sample-data/azure-search-sample-data/) index (some sample hotel info in there), which is publicly available. You could point your deployment to that one as well, but normally you would like to build your own index [as described here](https://docs.microsoft.com/en-us/azure/search/search-get-started-portal#step-1---start-the-import-data-wizard-and-create-a-data-source).

## Config settings

This code requires the following settings to be provided. When running locally on your devbox, you configure them via your **/api/local.settings.json** file (you'll need to create this file first). After deploying to Azure you'll need to configure these values via your Static Web App's **Configuration** tab in Azure Portal.

* **SearchServiceName** - the name of your Cognitive Search service instance, e.g. `azs-playground`.
* **SearchIndexName** - the name of your search index, e.g. `hotels`. You can use your existing index if any, or you can create a sample index [as described here](https://docs.microsoft.com/en-us/azure/search/search-get-started-portal#step-1---start-the-import-data-wizard-and-create-a-data-source).
* **SearchApiKey** - your Cognitive Search query **api-key**. Find it on your Cognitive Search service's *Keys* tab in Azure Portal.
* **AzureMapSubscriptionKey** - (optional) a subscription key for your Azure Maps account (Azure Maps is used for visualizing geolocation data). Please, get your own key [as described here](https://docs.microsoft.com/en-us/azure/azure-maps/azure-maps-authentication). If not specified, the map will not be shown.

* **CognitiveSearchKeyField** - name of the field in your search index, that uniquely identifies a document. E.g. `HotelId`.
* **CognitiveSearchNameField** - name of the field in your search index, that contains a short title of a document. E.g. `HotelName`.
* **CognitiveSearchGeoLocationField** - (optional) name of the field in your search index, that contains geo coordinates for each document. E.g. `Location`.
* **CognitiveSearchOtherFields** - comma-separated list of other fields to be shown on search result cards. E.g. `Tags,Description,Description_fr,Category,LastRenovationDate`. If you include an *array-type* field (a field that contains an array of values, like the **Tags** field in the sample **hotels** index), it will be shown as a list of clickable chips.
* **CognitiveSearchFacetFields** - comma-separated list of fields to be shown as facets on the left sidebar. Please, append a trailing star ('\*') to the name of the field, if that field is an *array-type* field. E.g. `Tags*,Rating,Category,ParkingIncluded`. NOTE: all fields mentioned here need to be *facetable* and *filterable*. 
* **CognitiveSearchSuggesterName** - (optional) name of the [autocomplete suggester](https://docs.microsoft.com/en-us/azure/search/index-add-suggesters) to be used. E.g. `sg`. Create and configure a suggester for your search index and put its name here - then the search query textbox will start showing suggestions as you type.

## How to run locally

As per prerequisites, you will need:
- [Node.js](https://nodejs.org/en).
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools#installing) package installed **globally** (`npm i -g azure-functions-core-tools`).

Clone this repo to your devbox, then in the **/api** folder create a **local.settings.json** file, which looks like this:
```
{
    "IsEncrypted": false,
    "Values": {
        "FUNCTIONS_WORKER_RUNTIME": "node",

        "SearchServiceName": "azs-playground",
        "SearchIndexName": "hotels",
        "SearchApiKey": "your-search-api-key",
        "AzureMapSubscriptionKey": "your-azure-map-subscription-key",
        
        "CognitiveSearchKeyField":"HotelId",
        "CognitiveSearchNameField": "HotelName",
        "CognitiveSearchGeoLocationField": "Location",
        "CognitiveSearchOtherFields": "Tags,Description,Description_fr,Category",
        "CognitiveSearchFacetFields": "Tags*,Rating,Category,ParkingIncluded",
        "CognitiveSearchSuggesterName": "sg"
    },
    "Host": {
        "CORS": "http://localhost:3000",
        "CORSCredentials": true
    }
}
```

Then type the following from the root folder:
```
npm install
npm run start-with-backend
```

The latter command also compiles and starts the /api project under the local 'http://localhost:7071/api' URL.

If a browser window doesn't open automatically, then navigate to http://localhost:3000.

## How to deploy to Azure

Fork this repo and then deploy it exactly as described [here](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=react#create-a-static-web-app). 
Then configure the above-described Application Settings via your Static Web App's **Configuration** tab in Azure Portal. The tab should then look like this:

![screenshot2](https://raw.githubusercontent.com/scale-tone/cognitive-search-static-web-apps-sample-ui/master/public/screenshot2.png)

NOTE: by default there will be **no authentication** configured for your Static Web App instance, so anyone could potentially access it. You can then explicitly configure authN/authZ rules [as described here](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization). E.g. to force every user to authenticate via AAD just add the following property: `"allowedRoles": [ "authenticated" ]` to the only one route that is currently defined in [routes.json](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/public/routes.json).
