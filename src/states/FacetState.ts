import { observable, computed } from 'mobx'

import { StringFacetState } from './StringFacetState'
import { StringCollectionFacetState } from './StringCollectionFacetState'
import { NumericFacetState } from './NumericFacetState'
import { BooleanFacetState } from './BooleanFacetState'
import { DateFacetState } from './DateFacetState'
import { isArrayFieldName, extractFieldName } from './SearchResult';

export enum FacetTypeEnum {
    StringFacet,
    StringCollectionFacet,
    NumericFacet,
    BooleanFacet,
    DateFacet
}

// State of each specific facet on the left
export class FacetState {

    // State of facet values extracted into a separate object, to avail from polymorphism
    @computed
    get state(): StringFacetState | StringCollectionFacetState | NumericFacetState | BooleanFacetState | DateFacetState {
        return this._valuesState;
    };

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
    populateFacetValues(facetValues: { value: string | number | boolean, count: number }[], fieldValue: any, filterClause: string) {

        this._valuesState = null;
        if (!facetValues.length) {
            return;
        }

        // Dynamically detecting facet field type by analyzing first non-empty value
        const firstFacetValue = facetValues.map(v => v.value).find(v => v !== null && v !== undefined );

        if (typeof firstFacetValue === 'boolean') {

            // If this is a boolean facet
            this._valuesState = new BooleanFacetState(this._onChanged, this.fieldName);

        }
        else if (typeof firstFacetValue === 'number') {

            // If this is a numeric facet
            this._valuesState = new NumericFacetState(this._onChanged, this.fieldName);

        } else if (FacetState.JsonDateRegex.test(firstFacetValue)) {

            // If this looks like a Date facet
            this._valuesState = new DateFacetState(this._onChanged, this.fieldName);
        
        } else if (this._isArrayField || (!!fieldValue && fieldValue.constructor === Array)) {

            // If this is a field containing arrays of strings
            this._valuesState = new StringCollectionFacetState(this._onChanged, this.fieldName);

        } else {

            //If this is a plain string field
            this._valuesState = new StringFacetState(this._onChanged, this.fieldName);
        }

        this._valuesState.populateFacetValues(facetValues as any, filterClause);
    }

    // Updates number of occurences for each value in the facet
    updateFacetValueCounts(facetValues: { value: string | number, count: number }[]) {
        this._valuesState?.updateFacetValueCounts(facetValues as any);
    }

    // Formats the $filter expression out of currently selected facet values
    getFilterExpression(): string {
        return this._valuesState?.getFilterExpression();
    }

    @observable
    private _valuesState: StringFacetState | StringCollectionFacetState | NumericFacetState | BooleanFacetState | DateFacetState;
    
    private readonly _fieldName: string;
    private readonly _isArrayField: boolean;

    private static JsonDateRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/;
}