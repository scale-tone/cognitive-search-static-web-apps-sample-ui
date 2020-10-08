import { observable, computed } from 'mobx'

import { FacetTypeEnum } from './FacetState'

// Facet for a numeric field
export class NumericFacetState {

    readonly facetType: FacetTypeEnum = FacetTypeEnum.NumericFacet;

    @computed
    get values(): number[] { return this._values; };

    @computed
    get minValue(): number { return this._minValue; };

    @computed
    get maxValue(): number { return this._maxValue; };
    
    @observable
    range: number[] = [0, 0];

    @computed
    get isApplied(): boolean {

        return this.range[0] !== this._minValue || this.range[1] !== this._maxValue;
    }

    constructor(
        private _onChanged: () => void, readonly fieldName: string) {
    }

    apply(): void {
        this._onChanged();
    }

    reset(): void {
        this.range = [this._minValue, this._maxValue];
        this._onChanged();
    }

    populateFacetValues(facetValues: { value: string | number, count: number }[], filterClause: string) {

        this._values = facetValues.map(fv => fv.value as number);
        this._minValue = Math.min(...this._values);
        this._maxValue = Math.max(...this._values);

        // If there was a $filter expression in the URL, then parsing and applying it
        var numericRange = this.parseFilterExpression(filterClause);

        if (!numericRange) {
            numericRange = [this._minValue, this._maxValue];
        }

        this.range = numericRange;
    }

    updateFacetValueCounts(facetValues: { value: string | number, count: number }[]) {
        // doing nothing for now
    }

    getFilterExpression(): string {

        if (!this.isApplied) {
            return '';
        }

        return `${this.fieldName} ge ${this.range[0]} and ${this.fieldName} le ${this.range[1]}`;
    }

    @observable
    private _values: number[] = [];
    @observable
    private _minValue: number;
    @observable
    private _maxValue: number;

    private parseFilterExpression(filterClause: string): number[] {

        if (!filterClause) {
            return null;
        }

        const regex = new RegExp(`${this.fieldName} ge ([0-9.]+) and ${this.fieldName} le ([0-9.]+)`, 'gi');
        const match = regex.exec(filterClause);
        return !match ? null : [Number(match[1]), Number(match[2])];
    }
}