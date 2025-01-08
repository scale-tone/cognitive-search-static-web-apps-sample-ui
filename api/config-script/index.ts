import { AzureFunction, Context } from "@azure/functions"

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {

    const serverSideConfig = {
        SearchServiceName: process.env.SearchServiceName,
        SearchIndexName: process.env.SearchIndexName,
        AzureMapSubscriptionKey: process.env.AzureMapSubscriptionKey,
        CognitiveSearchKeyField: process.env.CognitiveSearchKeyField,
        CognitiveSearchNameField: process.env.CognitiveSearchNameField,
        CognitiveSearchGeoLocationField: process.env.CognitiveSearchGeoLocationField,
        CognitiveSearchOtherFields: process.env.CognitiveSearchOtherFields,
        CognitiveSearchTranscriptFields: process.env.CognitiveSearchTranscriptFields,
        CognitiveSearchFacetFields: process.env.CognitiveSearchFacetFields,
        CognitiveSearchSuggesterName: process.env.CognitiveSearchSuggesterName
    };

    context.res = {
        body: `const ServerSideConfig = ${JSON.stringify(serverSideConfig)}`,
        
        headers: {
            "Content-Type": "application/javascript; charset=UTF-8"
        }
    };
};

export default httpTrigger;