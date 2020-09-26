import { FacetState } from './FacetState'
import { IServerSideConfig } from '../states/IServerSideConfig';

// This object is produced by a dedicated Functions Proxy and contains parameters 
// configured on the backend side. Backend produces it in form of a script, which is included into index.html.
// Here we just assume that the object exists.
declare const ServerSideConfig: IServerSideConfig;

export const MaxFacetValues = 500;

// State of facets on the left
export class FacetsState {

    // Facets to be displayed on the left
    get facets(): FacetState[] { return this._facets; }

    constructor(private _onChanged: () => void) { 
        // Dynamically creating the facet states out of config settings
        this.createFacetStates();
    }
    
    // Expands this facet and collapses all others.
    toggleExpand(facetName: string) {
        
        const selectedFacet = this._facets.find(f => f.fieldName === facetName);

        if (!!selectedFacet.isExpanded) {
            selectedFacet.isExpanded = false;
            return;
        }

        for (const facet of this._facets) {
            facet.isExpanded = false;
        }
        selectedFacet.isExpanded = true;
    }

    // Fills facets with values returned by Cognitive Search
    populateFacetValues(facetResults: any, filterClause: string) {
        
        for (const facetState of this._facets) {
            
            const facetValues = facetResults[facetState.fieldName];
            facetState.populateFacetValues(!!facetValues ? facetValues : [], filterClause);
        }
    }

    // Updates counters for facet values
    updateFacetValueCounts(facetResults: any) {

        for (const facetState of this._facets) {

            const facetValues = facetResults[facetState.fieldName];
            if (!!facetValues) {
                facetState.updateFacetValueCounts(facetValues);
            }
        }
    }
    
    // Constructs $filter clause for a search request
    getFilterExpression(): string {

        const filterClause = this._facets
            .map(f => f.getFilterExpression())
            .filter(f => (!!f))
            .join(' and ');

        return !!filterClause ? `&$filter=${filterClause}` : '';
    }
    
    // Selects a value in the specified facet
    filterBy(fieldName: string, fieldValue: string) {

        const facet = this._facets.find(f => f.fieldName === fieldName);
        if (!facet) {
            return;
        }

        facet.values.forEach(v => { 
            if (v.value === fieldValue) {
                v.isSelected = true;
            }
        });
    }

    private _facets: FacetState[] = [];

    // Dynamically generates facets from 'CognitiveSearchFacetFields' config parameter
    private createFacetStates() {

        const facetFields = ServerSideConfig.CognitiveSearchFacetFields.split(',');
        var isFirstFacet = true;

        for (var facetField of facetFields) {
            
            // Array-type fields are expected to have a star at the end
            const isArrayField = facetField.endsWith('*');
            if (isArrayField) {
                facetField = facetField.substr(0, facetField.length - 1);
            }

            this._facets.push(new FacetState(this._onChanged, facetField, facetField, isArrayField, isFirstFacet));
            isFirstFacet = false;
        }
    }
}

