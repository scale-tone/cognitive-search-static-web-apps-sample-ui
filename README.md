# Azure AI Search Static Web Apps sample

![screenshot1](https://raw.githubusercontent.com/scale-tone/cognitive-search-static-web-apps-sample-ui/master/public/screenshot1.png)

A simple sample UI for your [Azure AI Search](https://azure.microsoft.com/en-us/services/search/) index. Similar to [this official sample](https://github.com/Azure-Samples/azure-search-knowledge-mining/tree/master/02%20-%20Web%20UI%20Template), but is implemented as a [Azure Static Web App](https://docs.microsoft.com/en-us/azure/static-web-apps/) and built with React and TypeScript. Implements the so called *faceted search* user experience, when the user first enters their search phrase and then narrows down search resuls with facets on the left sidebar. 

[![Azure Static Web Apps CI/CD](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/actions/workflows/azure-static-web-apps-calm-cliff-07e291203.yml/badge.svg)](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/actions/workflows/azure-static-web-apps-calm-cliff-07e291203.yml)

The [client part](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/src) is a typical React-based SPA (Single-Page App) written in TypeScript with extensive use of [MobX](https://mobx.js.org/README.html) and [Material-UI](https://material-ui.com/). And it doesn't have a [backend](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/api) as such, all requests to [Azure AI Search REST API](https://docs.microsoft.com/en-us/azure/search/search-query-overview) are transparently propagated through an Azure Function, that appends the Azure AI Search **api-key** to each request - so the  **api-key** is not exposed to the clients. 

Queries made by user are also reflected in the browser's address bar. This serves three purposes: makes those links sharable, enables navigation history ("Back" and "Forward" buttons) and also helps you learn Azure AI Search REST API's query syntax. 

List of search results supports infinite scrolling. If your documents have geo coordinates attached, then search results are also visualized with an [Azure Maps](https://azure.microsoft.com/en-us/services/azure-maps/) control. Clicking on a search result produces the *Details* view, the *Trascript* tab of it highlights all occurences of your search phrase in the document and allows to navigate across them.

## Live demo

https://calm-cliff-07e291203.5.azurestaticapps.net

That deployment is pointed to [the official Azure AI Search Sample Data](https://docs.microsoft.com/en-us/samples/azure-samples/azure-search-sample-data/azure-search-sample-data/) index (some sample hotel info in there), which is publicly available. You could point your deployment to that one as well, but normally you would like to build your own index [as described here](https://docs.microsoft.com/en-us/azure/search/search-get-started-portal#step-1---start-the-import-data-wizard-and-create-a-data-source).

## Config settings

This code requires the following settings to be provided. When running locally on your devbox, you configure them via your **/api/local.settings.json** file (you'll need to create this file first). After deploying to Azure you'll need to configure these values via your Static Web App's **Configuration** tab in Azure Portal.

* **SearchServiceName** - the name of your Azure AI Search service instance, e.g. `azs-playground`.
* **SearchIndexName** - the name of your search index, e.g. `hotels`. You can use your existing index if any, or you can create a sample index [as described here](https://docs.microsoft.com/en-us/azure/search/search-get-started-portal#step-1---start-the-import-data-wizard-and-create-a-data-source).
* **SearchApiKey** - your Azure AI Search query **api-key**. Find it on your Azure AI Search service's *Keys* tab in Azure Portal.
* **AzureMapSubscriptionKey** - (optional) a subscription key for your Azure Maps account (Azure Maps is used for visualizing geolocation data). Please, get your own key [as described here](https://docs.microsoft.com/en-us/azure/azure-maps/azure-maps-authentication). If not specified, the map will not be shown.

* **CognitiveSearchKeyField** - name of the field in your search index, that uniquely identifies a document. E.g. `HotelId`.
* **CognitiveSearchNameField** - name of the field in your search index, that contains a short title of a document. E.g. `HotelName`. You can also put a comma-delimited list of field names here.
* **CognitiveSearchGeoLocationField** - (optional) name of the field in your search index, that contains geo coordinates for each document. E.g. `Location`.
* **CognitiveSearchOtherFields** - comma-separated list of other fields to be shown on search result cards. E.g. `Tags,Description,Description_fr,Category,LastRenovationDate`. If you include an *array-type* field (a field that contains an array of values, like the **Tags** field in the sample **hotels** index), it will be shown as a list of clickable chips.
* **CognitiveSearchFacetFields** - comma-separated list of fields to be shown as facets on the left sidebar. Please, append a trailing star ('\*') to the name of the field, if that field is an *array-type* field. E.g. `Tags*,Rating,Category,ParkingIncluded,LastRenovationDate`. NOTE: all fields mentioned here need to be *facetable* and *filterable*. 
* **CognitiveSearchSuggesterName** - (optional) name of the [autocomplete suggester](https://docs.microsoft.com/en-us/azure/search/index-add-suggesters) to be used. E.g. `sg`. Create and configure a suggester for your search index and put its name here - then the search query textbox will start showing suggestions as you type.
* **CognitiveSearchTranscriptFields** - (optional) comma-separated list of fields to be shown on the *Transcript* tab of the *Details* dialog. E.g. `HotelName,Description,Description_fr`. The fields, that you specify in this setting need to be *searchable*, because they are also used to get the [hit highlights](https://docs.microsoft.com/en-us/azure/search/search-pagination-page-layout#hit-highlighting). If not specified, that tab will simply show all string-type fields and get hit highlights from the search string.

## How to run locally

As per prerequisites, you will need:
- [Node.js](https://nodejs.org/en).
- [Azure Functions Core Tools](https://github.com/Azure/azure-functions-core-tools#installing) package installed **globally** (`npm i -g azure-functions-core-tools`).

Clone this repo to your devbox, then in the **/api** folder create a **local.settings.json** file, which should look like this:
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
        "CognitiveSearchFacetFields": "Tags*,Rating,Category,ParkingIncluded,LastRenovationDate",
        "CognitiveSearchTranscriptFields": "HotelName,Description,Description_fr",
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

- **Fork** this repo (a fork is needed, because Static Web Apps deployment needs to have write access to the repo).
- Make sure GitHub Actions are enabled for your newly forked repo:

    <img src="https://user-images.githubusercontent.com/5447190/152656025-7fecc05e-2c30-4e89-8a39-9b6f65ed317e.png" width="600px"/>

- Use this button:

    [![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fscale-tone%2Fcognitive-search-static-web-apps-sample-ui%2Fmaster%2Farm-template.json) 

Alternative deployment methods are described [here](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=react#create-a-static-web-app). 
But then you'll need to manually configure the above-described Application Settings via your Static Web App's **Configuration** tab in Azure Portal. The tab should then look like this:

![screenshot2](https://raw.githubusercontent.com/scale-tone/cognitive-search-static-web-apps-sample-ui/master/public/screenshot2.png)

## Authentication/Authorization

By default there will be **no authentication** configured for your Static Web App instance, so anyone could potentially access it. You can then explicitly configure authentication/authorization rules [as described here](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization). E.g. to force every user to authenticate with their Microsoft Account just replace `anonymous` with `authenticated` in [this section](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/staticwebapp.config.json#L5) of `staticwebapp.config.json` file. Note though, that `authenticated` is a built-in role, which refers to anybody anyhow authenticated. To restrict the list of allowed users further, you will need to [define and assign your own custom roles and routes](https://learn.microsoft.com/en-us/azure/static-web-apps/configuration#routes). Also, when using Microsoft Accounts, you [might want to configure and use your own AAD application](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom?tabs=aad%2Cinvitations#configure-a-custom-identity-provider) (instead of the global default one).

## Implementation details

Thanks to [MobX](https://mobx.js.org/README.html), this React app looks very much like a typical [MVVM](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel) app. It has a [hierarchy of state objects](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/src/states) (aka viewmodels) and a corresponding [hierarchy of pure (stateless) React components](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/src/components) (aka views). These two hierarchies are welded together at the root level [here](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/index.tsx#L11). For example, [here](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/states/SearchResultsState.ts) is the state object, that represents the list of search results, and [here](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/components/SearchResults.tsx) is its markup.

[HTTP GET requests](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/states/DetailsDialogState.ts#L102) to Azure AI Search REST API are made by means of [axios](https://www.npmjs.com/package/axios) and are transparently proxied through a [lightweight Azure Functions-based backend](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/api) - this is where the **api-key** is being applied to them.

The list of facets and their possible values on the left sidebar is [generated dynamically](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/states/FacetsState.ts#L15), based on **CognitiveSearchFacetFields** config value and results returned by Azure AI Search. The type of each faceted field (and the way it needs to be visualized) is also detected dynamically [here](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/states/FacetState.ts#L49). Multiple faceted field types is currently supported already, and more support is coming.

User's authentication/authorization relies entirely on what [Azure Static Web Apps offer today](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization), and that in turn relies on what is known as [EasyAuth server-directed login flow](https://github.com/cgillum/easyauth/wiki/Login#server-directed-login). That's why there're no any client-side JavaScript auth libraries and/or custom code for authenticating users. The only login-related code resides in [this state object](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/src/states/LoginState.ts), and it only tries to fetch the current user's nickname, but for that code to work the authN/authZ rules need to be configured [as explained here](https://docs.microsoft.com/en-us/azure/static-web-apps/authentication-authorization).

As usual with Azure Static Web Apps, deployment to Azure is done with GitHub Actions. There's a couple of workflows [in this folder](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/tree/master/.github/workflows), that are currently being used for deploying this repo to demo environments. A good idea would be to remove them from your copy after cloning/forking (so that they don't annoy you with failed runs).
