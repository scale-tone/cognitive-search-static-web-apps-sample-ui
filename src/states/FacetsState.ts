import { FacetState, FacetTypeEnum } from './FacetState';
import { StringCollectionFacetState } from './StringCollectionFacetState';
import { IServerSideConfig } from './IServerSideConfig';

export const MaxFacetValues = 500;

// State of facets on the left
export class FacetsState {

    // Facets to be displayed on the left
    get facets(): FacetState[] { return this._facets; }

    constructor(private _onChanged: () => void, private _config: IServerSideConfig) { 
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
    populateFacetValues(facetResults: any, firstSearchResult: any, filterClause: string) {
        
        for (const facetState of this._facets) {
            
            const facetValues = facetResults[facetState.fieldName];
            const fieldValue = firstSearchResult[facetState.fieldName];

            facetState.populateFacetValues(!!facetValues ? facetValues : [], fieldValue, filterClause);
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
        if (!facet || facet.facetType !== FacetTypeEnum.StringCollectionFacet ) {
            return;
        }

        const stringCollectionFacet = facet.state as StringCollectionFacetState;

        stringCollectionFacet.values.forEach(v => { 
            if (v.value === fieldValue) {
                v.isSelected = true;
            }
        });
    }

    private _facets: FacetState[] = [];

    // Dynamically generates facets from 'CognitiveSearchFacetFields' config parameter
    private createFacetStates() {

        const facetFields = this._config.CognitiveSearchFacetFields.split(',').filter(f => !!f);

        // Leaving the first facet expanded and all others collapsed
        var isFirstFacet = true;

        for (var facetField of facetFields) {
            this._facets.push(new FacetState(this._onChanged, facetField, isFirstFacet));
            isFirstFacet = false;
        }
    }
}