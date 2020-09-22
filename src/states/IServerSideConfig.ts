
// This object is produced by a dedicated Functions Proxy and contains parameters 
// configured on the backend side. Backend produces it in form of a script, which is included into index.html.
export interface IServerSideConfig {
    AzureMapSubscriptionKey: string;
    CognitiveSearchKeyField: string;
    CognitiveSearchNameField: string;
    CognitiveSearchGeoLocationField: string;
    CognitiveSearchOtherFields: string;
    CognitiveSearchFacetFields: string;
}