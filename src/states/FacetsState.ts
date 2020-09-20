import { FacetState } from './FacetState'

export const MaxFacetValues = 500;

// State of facets on the left
export class FacetsState {

    // Facets to be displayed on the left
    get facets(): FacetState[] { return this._facets; }

    constructor(private _onChanged: () => void) { }
    
    // Expands this facet and collapses all others.
    toggleExpand(facetName: string) {
        
        const selectedFacet = this._facets.find(f => f.fieldName == facetName);

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
    
    // Selects a value in 'Keywords' facet
    filterByKeyword(keyword: string) {

        const facet = this._facets.find(f => f.fieldName === 'keyphrases');

        facet.values.forEach(v => { 
            if (v.value === keyword) {
                v.isSelected = true;
            }
        });
    }

    private _facets: FacetState[] = [
        new FacetState(this._onChanged, 'keyphrases', 'Key Phrases', true, true),
        new FacetState(this._onChanged, 'Tags', 'Tags', true, false),
        new FacetState(this._onChanged, 'organizations', 'Organizations', true, false),
        new FacetState(this._onChanged, 'locations', 'Locations', true, false),
        new FacetState(this._onChanged, 'Category', 'Category', false, false),
        new FacetState(this._onChanged, 'language', 'Language', false, false),
    ];
}

