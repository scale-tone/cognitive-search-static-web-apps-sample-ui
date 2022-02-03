
// This object is produced by a dedicated Functions Proxy and contains parameters 
// configured on the backend side. Backend produces it in form of a script, which is included into index.html.
// Here we just assume that the object exists.
declare const ServerSideConfig: IServerSideConfig;

export interface IServerSideConfig {
    SearchServiceName: string;
    SearchIndexName: string;
    AzureMapSubscriptionKey: string;
    CognitiveSearchKeyField: string;
    CognitiveSearchNameField: string;
    CognitiveSearchGeoLocationField: string;
    CognitiveSearchOtherFields: string;
    CognitiveSearchTranscriptFields: string;
    CognitiveSearchFacetFields: string;
    CognitiveSearchSuggesterName: string;
}

// Produces a purified ServerSideConfig object
export function GetServerSideConfig(): IServerSideConfig {
    const result = ServerSideConfig;

    for (const fieldName in result) {
        if (!isConfigSettingDefined(result[fieldName])) {
            result[fieldName] = null;
        }
    }

    return result;
}

// Checks if the value is defined in the backend's config settings
function isConfigSettingDefined(value: string) {
    return !!value && !(
        value.startsWith('%') && value.endsWith('%') // if this parameter isn't specified in Config Settings, the proxy returns env variable name instead
    );
}