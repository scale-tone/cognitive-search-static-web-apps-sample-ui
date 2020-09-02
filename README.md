# ReactTsBasic

A GitHub template for quickly bootstrapping an [Azure Static Web App](https://docs.microsoft.com/en-us/azure/static-web-apps/) project with React and TypeScript.

Similar to [the official one](https://github.com/staticwebdev/react-basic), but uses TypeScript instead. Also has a pre-initialized [Azure Functions project](https://docs.microsoft.com/en-us/azure/static-web-apps/add-api) in the /api folder, written in TypeScript as well.

## How to run

### `npm install`
### `npm run start-with-backend`

The latter command also compiles and starts the /api project under the local 'http://localhost:7071/api' URL.

## How to deploy to Azure

Exactly as described [here](https://docs.microsoft.com/en-us/azure/static-web-apps/getting-started?tabs=react#create-a-static-web-app).

## Important

Exclude [env.development.local](https://github.com/scale-tone/react-ts-basic/blob/master/.env.development.local) and [local.settings.json](https://github.com/scale-tone/react-ts-basic/blob/master/api/local.settings.json) once ready.
