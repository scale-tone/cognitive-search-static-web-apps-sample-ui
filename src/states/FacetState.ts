import { observable, computed } from 'mobx'

import { StringFacetState } from './StringFacetState'
import { StringCollectionFacetState } from './StringCollectionFacetState'
import { NumericFacetState } from './NumericFacetState'
import { isArrayFieldName, extractFieldName } from './SearchResult';

export enum FacetTypeEnum {
    StringFacet,
    StringCollectionFacet,
    NumericFacet
}

// State of each specific facet on the left
export class FacetState {

    // State of facet values extracted into a separate object, to avail from polymorphism
    @computed
    get state(): StringFacetState | StringCollectionFacetState | NumericFacetState { return this._valuesState; };

    // Dynamically determined type of underlying facet field
    @computed
    get facetType(): FacetTypeEnum { return this._valuesState?.facetType; };

    // Whether the sidebar tab is currently expanded
    @observable
    isExpanded: boolean;

    get fieldName(): string { return this._fieldName; }
    get displayName(): string { return this._fieldName; }

    constructor(
        private _onChanged: () => void,
        fieldName: string,
        isInitiallyExpanded: boolean) {

        this._isArrayField = isArrayFieldName(fieldName);
        this._fieldName = extractFieldName(fieldName);
        this.isExpanded = isInitiallyExpanded;
    }

    // Dynamically creates the values state object from the search result
    populateFacetValues(facetValues: { value: string | number, count: number }[], filterClause: string) {

        this._valuesState = null;
        if (!facetValues.length) {
            return;
        }

        if (facetValues.every(fv => typeof fv.value === 'number')) {

            // If this is a numeric facet
            this._valuesState = new NumericFacetState(this._onChanged, this.fieldName);

        } else if (this._isArrayField) {

            // If this is a field containing arrays of strings
            this._valuesState = new StringCollectionFacetState(this._onChanged, this.fieldName);
        } else {

            //If this is a plain string field
            this._valuesState = new StringFacetState(this._onChanged, this.fieldName);
        }

        this._valuesState.populateFacetValues(facetValues, filterClause);
    }

    // Updates number of occurences for each value in the facet
    updateFacetValueCounts(facetValues: { value: string | number, count: number }[]) {
        this._valuesState?.updateFacetValueCounts(facetValues);
    }

    // Formats the $filter expression out of currently selected facet values
    getFilterExpression(): string {
        return this._valuesState?.getFilterExpression();
    }

    @observable
    private _valuesState: StringFacetState | StringCollectionFacetState | NumericFacetState;
    
    private readonly _fieldName: string;
    private readonly _isArrayField: boolean;
}