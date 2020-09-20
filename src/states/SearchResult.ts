import { isValidFacetValue } from './FacetValueState';

// Maps raw search results. 
export class SearchResult {

    readonly key: string;
    readonly name: string;
    readonly keywords: string[] = [];
    readonly coordinates: number[];
    readonly otherFields: string[] = [];

    static readonly OtherFields = 'Description,Category,keyphrases';

    static readonly KeyField = 'HotelId';
    static readonly NameField = 'HotelName';
    static readonly GeoLocationField = 'Location';

    static get SearchResultFields(): string {
        return `${SearchResult.KeyField},${SearchResult.NameField},${SearchResult.OtherFields}`;
    }

    static get MapSearchResultFields(): string {
        return `${SearchResult.KeyField},${SearchResult.NameField},${SearchResult.GeoLocationField}`;
    }

    constructor(rawResult: any) {

        this.key = rawResult[SearchResult.KeyField];
        this.name = rawResult[SearchResult.NameField];
        this.coordinates = rawResult[SearchResult.GeoLocationField]?.coordinates;

        // Collecting other fields
        for (var fieldName of SearchResult.OtherFields.split(',')) {

            const fieldValue = rawResult[fieldName];

            if (!fieldValue) {
                continue;
            }
            if (fieldValue.constructor === Array) {
                // If the field contains an array, then treating it as a list of keywords
                this.keywords = fieldValue.filter(isValidFacetValue);

            } else {
                // otherwise collecting all other fields into a dictionary
                this.otherFields.push(fieldValue.toString());
            }
        }
    }
}