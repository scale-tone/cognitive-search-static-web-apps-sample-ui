import { observable, computed } from 'mobx'

import { FacetTypeEnum } from './FacetState'
import { FacetValueState, isValidFacetValue, encodeFacetValue, decodeFacetValue } from './FacetValueState'

// Facet for a field containing an array of strings
export class StringCollectionFacetState {

    readonly facetType: FacetTypeEnum = FacetTypeEnum.StringCollectionFacet;

    @computed
    get values(): FacetValueState[] { return this._values; };

    // Whether selected values should be combined with OR (false) or AND (true).
    // Only makes sense for array fields
    @computed
    get useAndOperator(): boolean { return this._useAndOperator; };
    set useAndOperator(val: boolean) {
        this._useAndOperator = val;
        this._onChanged();
    }

    @computed
    get selectedCount(): number {
        return this._values.filter(v => v.isSelected).length;
    }

    @computed
    get allSelected(): boolean {
        return this._values.every(v => !v.isSelected);
    }
    set allSelected(val: boolean) {
        for (const v of this._values) {
            v.unsetSilently();
        }
        this._useAndOperator = false;
        this._onChanged();
    }

    @computed
    get isApplied(): boolean {
        return !this.allSelected;
    }

    constructor(private _onChanged: () => void, readonly fieldName: string) {
    }

    populateFacetValues(facetValues: { value: string, count: number }[], filterClause: string) {

        this._valuesSet = {};

        // If there was a $filter expression in the URL, then parsing and applying it
        const parsedFilterClause = this.parseFilterExpression(filterClause);

        // Replacing the entire array, for faster rendering
        this._values = facetValues
            .filter(fv => isValidFacetValue(fv.value as string))
            .map(fv => {

                const facetValue = new FacetValueState(fv.value as string, fv.count, this._onChanged, !!parsedFilterClause.selectedValues[fv.value]);
                this._valuesSet[fv.value] = facetValue;

                return facetValue;
            });

        // Filter clause from query string can still contain some values, that were not returned by Cognitive Search.
        // So we have to add them explicitly as well.
        for (const fv in parsedFilterClause.selectedValues) {

            if (!!this._valuesSet[fv]) {
                continue;
            }

            const facetValue = new FacetValueState(fv, 1, this._onChanged, true);
            this._valuesSet[fv] = facetValue;

            this._values.push(facetValue);
        }

        this._useAndOperator = parsedFilterClause.useAndOperator;
    }

    updateFacetValueCounts(facetValues: { value: string, count: number }[]) {

        // converting array into a map, for faster lookup
        const valuesMap = facetValues.reduce((map: { [v: string]: number }, kw) => {
            map[kw.value] = kw.count;
            return map;
        }, {});

        // recreating the whole array, for faster rendering
        this._values = this._values.map(fv => {

            const count = valuesMap[fv.value];

            const facetValue = new FacetValueState(fv.value, !!count ? count : 0, this._onChanged, fv.isSelected);

            // Also storing this FacetValueState object in a set, for faster access
            this._valuesSet[fv.value] = facetValue;

            return facetValue;
        });
    }

    getFilterExpression(): string {

        const selectedValues = this.values.filter(v => v.isSelected).map(v => encodeFacetValue(v.value));
        if (selectedValues.length <= 0) {
            return '';
        }

        return this._useAndOperator ?
            selectedValues.map(v => `${this.fieldName}/any(f: search.in(f, '${v}', '|'))`).join(' and ') :
            `${this.fieldName}/any(f: search.in(f, '${selectedValues.join('|')}', '|'))`;
    }

    @observable
    private _values: FacetValueState[] = [];

    @observable
    private _useAndOperator: boolean;

    private _valuesSet: { [k: string]: FacetValueState } = {};

    private parseFilterExpression(filterClause: string): { selectedValues: { [v: string]: string }, useAndOperator: boolean } {
        const result = {
            selectedValues: {},
            useAndOperator: false
        };

        if (!filterClause) {
            return result;
        }

        const regex = new RegExp(`${this.fieldName}/any\\(f: search.in\\(f, '([^']+)', '\\|'\\)\\)( and )?`, 'gi');
        var match: RegExpExecArray | null;
        var matchesCount = 0;
        while (!!(match = regex.exec(filterClause))) {
            matchesCount++;

            const facetValues = match[1].split('|');
            for (const facetValue of facetValues.map(fv => decodeFacetValue(fv))) {
                result.selectedValues[facetValue] = facetValue;
            }
        }

        // if AND operator was used to combine selected values, then there should be at least two regex matches in the $filter clause
        result.useAndOperator = matchesCount > 1;

        return result;
    }
}