# Cognitive Search Static Web Apps sample

![screenshot](https://raw.githubusercontent.com/scale-tone/cognitive-search-static-web-apps-sample-ui/master/public/screenshot1.png)

A simple sample UI for your [Azure Cognitive Search](https://azure.microsoft.com/en-us/services/search/) index. Similar to [this official sample](https://github.com/Azure-Samples/azure-search-knowledge-mining/tree/master/02%20-%20Web%20UI%20Template), but is implemented as a [Azure Static Web App](https://docs.microsoft.com/en-us/azure/static-web-apps/) and built with React and TypeScript. Doesn't have a backend as such, all requests to Cognitive Search API are transparently propagated through an [Azure Functions Proxy](https://github.com/scale-tone/cognitive-search-static-web-apps-sample-ui/blob/master/api/proxies.json), that appends the Cognitive Search **api-key** to each request - so the  **api-key** is not exposed to the clients.

## Live demo

https://lively-sand-033e9ec03.azurestaticapps.net 

This deployment is pointed to [the official Azure Cognitive Search Sample Data](https://docs.microsoft.com/en-us/samples/azure-samples/azure-search-sample-data/azure-search-sample-data/) index (some sample hotel info in there).

## How to run

```
npm install
npm run start-with-backend
```

The latter command also compiles and starts the /api project under the local 'http://localhost:7071/api' URL.

## How to deploy to Azure

Exactly as described [here](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=react#create-a-static-web-app).