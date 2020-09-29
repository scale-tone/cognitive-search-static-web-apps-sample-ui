
// This object is produced by a dedicated Functions Proxy and contains parameters 
// configured on the backend side. Backend produces it in form of a script, which is included into index.html.
export interface IServerSideConfig {
    AzureMapSubscriptionKey: string;
    CognitiveSearchKeyField: string;
    CognitiveSearchNameField: string;
    CognitiveSearchGeoLocationField: string;
    CognitiveSearchOtherFields: string;
    CognitiveSearchFacetFields: string;
    CognitiveSearchSuggesterName: string;
}

// Checks if the value is defined in the backend's config settings
export function isConfigSettingDefined(value: string) {
    return !!value && !(
        value.startsWith('%') && value.endsWith('%') // if this parameter isn't specified in Config Settings, the proxy returns env variable name instead
    );
}