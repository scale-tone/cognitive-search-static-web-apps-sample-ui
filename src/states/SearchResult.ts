import { isValidFacetValue } from './FacetValueState';
import { IServerSideConfig } from '../states/IServerSideConfig';

// This object is produced by a dedicated Functions Proxy and contains parameters 
// configured on the backend side. Backend produces it in form of a script, which is included into index.html.
// Here we just assume that the object exists.
declare const ServerSideConfig: IServerSideConfig;

// Maps raw search results. 
export class SearchResult {

    readonly key: string;
    readonly name: string;
    readonly keywordsFieldName: string;
    readonly keywords: string[] = [];
    readonly coordinates: number[];
    readonly otherFields: string[] = [];
    
    static get SearchResultFields(): string {
        return `${ServerSideConfig.CognitiveSearchKeyField},${ServerSideConfig.CognitiveSearchNameField},${ServerSideConfig.CognitiveSearchOtherFields}`;
    }

    static get MapSearchResultFields(): string {
        return `${ServerSideConfig.CognitiveSearchKeyField},${ServerSideConfig.CognitiveSearchNameField},${ServerSideConfig.CognitiveSearchGeoLocationField}`;
    }

    constructor(rawResult: any) {

        this.key = rawResult[ServerSideConfig.CognitiveSearchKeyField];
        this.name = rawResult[ServerSideConfig.CognitiveSearchNameField];
        this.coordinates = rawResult[ServerSideConfig.CognitiveSearchGeoLocationField]?.coordinates;

        // Collecting other fields
        for (var fieldName of ServerSideConfig.CognitiveSearchOtherFields.split(',')) {

            const fieldValue = rawResult[fieldName];

            if (!fieldValue) {
                continue;
            }
            
            if (fieldValue.constructor === Array) {
                // If the field contains an array, then treating it as a list of keywords
                this.keywordsFieldName = fieldName;
                this.keywords = fieldValue.filter(isValidFacetValue);
                continue;
            }

            // otherwise collecting all other fields into a dictionary
            this.otherFields.push(fieldValue.toString());
        }
    }
}