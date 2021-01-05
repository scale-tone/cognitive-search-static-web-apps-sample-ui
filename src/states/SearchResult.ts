import { isValidFacetValue } from './FacetValueState';
import { IServerSideConfig } from './ServerSideConfig';

// Maps raw search results. 
export class SearchResult {

    readonly key: string;
    readonly name: string;
    readonly keywordsFieldName: string;
    readonly keywords: string[] = [];
    readonly coordinates: number[];
    readonly otherFields: string[] = [];
    readonly highlightedWords: string[] = [];
    
    constructor(rawResult: any, private _config: IServerSideConfig) {

        this.key = rawResult[this._config.CognitiveSearchKeyField];
        this.coordinates = this.extractCoordinates(rawResult);
        this.highlightedWords = this.extractHighlightedWords(rawResult);

        this.name = this._config.CognitiveSearchNameField
            .split(',')
            .map(fieldName => rawResult[fieldName])
            .join(',');
        
        // Collecting other fields
        for (var fieldName of this._config.CognitiveSearchOtherFields.split(',').filter(f => !!f)) {

            const fieldValue = rawResult[fieldName];

            if (!fieldValue) {
                continue;
            }
            
            // If the field contains an array, then treating it as a list of keywords
            if (fieldValue.constructor === Array) {
                this.keywordsFieldName = extractFieldName(fieldName);
                this.keywords = fieldValue
                    .filter(isValidFacetValue)
                    .filter((val, index, self) => self.indexOf(val) === index); // getting distinct values
                continue;
            }

            // otherwise collecting all other fields into a dictionary
            this.otherFields.push(fieldValue.toString());
        }
    }

    // Extracts coordinates by just treating the very first array-type field as an array of coordinates
    private extractCoordinates(rawResult: any): number[] {

        const coordinatesValue = rawResult[this._config.CognitiveSearchGeoLocationField];
        if (!!coordinatesValue && coordinatesValue.constructor === Array) {
            return coordinatesValue;
        }

        for (const fieldName in coordinatesValue) {
            const fieldValue = coordinatesValue[fieldName];

            if (!!fieldValue && fieldValue.constructor === Array) {
                return fieldValue;
            }
        }

        return null;
    }

    // Tries to extract highlighted words from the @search.highlights field returned by Cognitive Search (if returned)
    private extractHighlightedWords(rawResult: any): string[] {

        var result: string[] = [];

        const searchHighlights = rawResult['@search.highlights'];
        if (!searchHighlights) {
            return result;
        }

        for (const fieldName in searchHighlights) {
            const highlightsArray = searchHighlights[fieldName] as string[];

            for (const highlightString of highlightsArray) {

                const regex = /<em>([^</]+)<\/em>/gi;
                var match: RegExpExecArray | null;
                while (!!(match = regex.exec(highlightString))) {
                    result.push(match[1]);
                }
            }
        }

        return result;
    }
}

// Checks whether this field name represents an array-type field (those field names are expected to have a trailing star)
export function isArrayFieldName(fieldName: string): boolean {
    return fieldName.endsWith('*');
}

// Removes trailing star (if any) from a field name
export function extractFieldName(str: string): string {
    return str.endsWith('*') ? str.substr(0, str.length - 1) : str;
}
