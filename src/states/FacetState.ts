import { observable, computed } from 'mobx'

import { FacetValueState, isValidFacetValue } from './FacetValueState'

// State of each specific facet on the left
export class FacetState {

    @computed
    get values(): FacetValueState[] { return this._values; };

    @computed
    get numericValues(): number[] { return this._numericValues; };

    @observable
    numericRange: number[] = [0, 0];

    @observable
    isExpanded: boolean;

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

        if (!!this._numericValues) {
            return this.numericRange[0] !== Math.min(...this._numericValues) || this.numericRange[1] !== Math.max(...this._numericValues);
        }

        return !this.allSelected;
    }

    constructor(
        private _onChanged: () => void,
        readonly fieldName: string,
        readonly displayName: string,
        readonly isArrayField: boolean,
        isInitiallyExpanded: boolean) {
        
        this.isExpanded = isInitiallyExpanded;        
    }

    apply(): void {
        this._onChanged();
    }

    reset(): void {
        this.numericRange = [Math.min(...this._numericValues), Math.max(...this._numericValues)];
        this._onChanged();
    }

    populateFacetValues(facetValues: { value: string | number, count: number }[], filterClause: string) {

        this._valuesSet = {};
        this._numericValues = null;

        // If there was a $filter expression in the URL, then parsing and applying it
        const parsedFilterClause = this.parseFilterExpression(filterClause);

        // If this is a numeric facet
        if (!!facetValues.length && facetValues.every(fv => typeof fv.value === 'number')) {

            this._numericValues = facetValues.map(fv => fv.value as number);

            if (!!parsedFilterClause.numericRange) {
                this.numericRange = parsedFilterClause.numericRange;
            } else {
                this.numericRange = [Math.min(...this._numericValues), Math.max(...this._numericValues)];
            }

            return;
        }

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

    updateFacetValueCounts(facetValues: { value: string | number, count: number }[]) {

        // If this is a numeric facet
        if (!!this._numericValues) {
            return;
        }

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

        // If this is a numeric facet
        if (!!this._numericValues) {
            return `${this.fieldName} ge ${this.numericRange[0]} and ${this.fieldName} le ${this.numericRange[1]}`;
        }

        const selectedValues = this.values.filter(v => v.isSelected).map(v => this.encodeFacetValue(v.value));
        if (selectedValues.length <= 0) {
            return '';
        }

        if (!this.isArrayField) {
            return `search.in(${this.fieldName}, '${selectedValues.join('|')}', '|')`;
        }

        if (this._useAndOperator) {
            return selectedValues.map(v => `${this.fieldName}/any(f: search.in(f, '${v}', '|'))`).join(' and ');
        }

        return `${this.fieldName}/any(f: search.in(f, '${selectedValues.join('|')}', '|'))`;
    }

    @observable
    private _values: FacetValueState[] = [];

    @observable
    private _useAndOperator: boolean;

    @observable
    private _numericValues: number[] = null;

    private _valuesSet: { [k: string]: FacetValueState } = {};

    private parseFilterExpression(filterClause: string): { numericRange: number[], selectedValues: { [v: string]: string }, useAndOperator: boolean } {
        const result = {
            numericRange: null,
            selectedValues: {},
            useAndOperator: false
        };

        if (!filterClause) {
            return result;
        }

        // If this is a numeric field
        var match: RegExpExecArray | null;
        const numericRegex = new RegExp(`${this.fieldName} ge ([0-9.]+) and ${this.fieldName} le ([0-9.]+)`, 'gi');
        if (!!(match = numericRegex.exec(filterClause))) {
            
            result.numericRange = [match[1], match[2]];
            return result;
        }

        const regex = this.isArrayField ?
            new RegExp(`${this.fieldName}/any\\(f: search.in\\(f, '([^']+)', '\\|'\\)\\)( and )?`, 'gi') :
            new RegExp(`search.in\\(${this.fieldName}, '([^']+)', '\\|'\\)( and )?`, 'gi');
        
        var matchesCount = 0;
        while (!!(match = regex.exec(filterClause))) {
            matchesCount++;

            const facetValues = match[1].split('|');
            for (const facetValue of facetValues.map(fv => this.decodeFacetValue(fv))) {
                result.selectedValues[facetValue] = facetValue;
            }
        }

        // if AND operator was used to combine selected values, then there should be at least two regex matches in the $filter clause
        result.useAndOperator = this.isArrayField && (matchesCount > 1);

        return result;
    }

    // Need to deal with special characters and replace one single quote with two single quotes
    private encodeFacetValue(v: string): string {
        return encodeURIComponent(v.replace('\'', '\'\''));
    }

    private decodeFacetValue(v: string): string {
        return decodeURIComponent(v).replace('\'\'', '\'');
    }
}
