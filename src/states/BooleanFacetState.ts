import { observable, computed } from 'mobx'

import { FacetTypeEnum } from './FacetState'

// Facet for a boolean field
export class BooleanFacetState {

    readonly facetType: FacetTypeEnum = FacetTypeEnum.BooleanFacet;

    @computed
    get value(): boolean | null {
        return this._value;
    }
    set value(val: boolean | null) {
        this._value = val;
        this._onChanged();
    }

    @computed
    get trueCount(): number {
        return this._trueCount;
    }

    @computed
    get falseCount(): number {
        return this._falseCount;
    }

    @computed
    get isApplied(): boolean {
        return this._value !== null;
    }

    constructor(
        private _onChanged: () => void, readonly fieldName: string) {
    }

    reset(): void {
        this._value = null;
        this._onChanged();
    }

    populateFacetValues(facetValues: { value: boolean, count: number }[], filterClause: string) {

        this.updateFacetValueCounts(facetValues);
        this._value = this.parseFilterExpression(filterClause);
    }

    updateFacetValueCounts(facetValues: { value: boolean, count: number }[]) {

        this._trueCount = facetValues.find(fv => fv.value === true)?.count ?? 0;
        this._falseCount = facetValues.find(fv => fv.value === false)?.count ?? 0;
    }

    getFilterExpression(): string {

        if (!this.isApplied) {
            return '';
        }

        return `${this.fieldName} eq ${this._value}`;
    }

    @observable
    private _value?: boolean = null;

    @observable
    private _trueCount: number = 0;

    @observable
    private _falseCount: number = 0;

    private parseFilterExpression(filterClause: string): boolean | null {

        if (!filterClause) {
            return null;
        }

        const regex = new RegExp(`${this.fieldName} eq (true|false)`, 'gi');
        const match = regex.exec(filterClause);
        return !match ? null : match[1] === 'true';
    }
}