import { observable, computed } from 'mobx'

import { FacetTypeEnum } from './FacetState'

// Facet for a field containing dates
export class DateFacetState {

    readonly facetType: FacetTypeEnum = FacetTypeEnum.DateFacet;

    @computed
    get from(): Date { return this._from; }
    @computed
    get till(): Date { return this._till; }

    @computed
    get isApplied(): boolean {

        return this._from !== this._minDate || this._till !== this._maxDate;
    }

    @observable
    currentFrom: Date = new Date();
    @observable
    currentTill: Date = new Date();

    constructor(
        private _onChanged: () => void, readonly fieldName: string) {
    }

    apply(): void {

        if (this._from === this.currentFrom && this._till === this.currentTill) {
            return;
        }

        this._from = this.currentFrom;
        this._till = this.currentTill;
        this._onChanged();
    }

    reset(): void {
        this._from = this.currentFrom = this._minDate;
        this._till = this.currentTill = this._maxDate;
        this._onChanged();
    }

    populateFacetValues(facetValues: { value: string, count: number }[], filterClause: string) {

        const dates = facetValues.map(fv => new Date(fv.value).getTime());

        this._minDate = new Date(Math.min(...dates));
        if (isNaN(this._minDate.valueOf())) {
            this._minDate = new Date(0);
        }

        this._maxDate = new Date(Math.max(...dates));
        if (isNaN(this._maxDate.valueOf())) {
            this._maxDate = new Date();
        }

        // If there was a $filter expression in the URL, then parsing and applying it
        const dateRange = this.parseFilterExpression(filterClause);

        if (!!dateRange) {
            
            this._from = dateRange[0];
            this._till = dateRange[1];

        } else {

            this._from = this._minDate;
            this._till = this._maxDate;
        }

        this.currentFrom = this._from;
        this.currentTill = this._till;
    }

    updateFacetValueCounts(facetValues: { value: string, count: number }[]) {
        // doing nothing for now
    }

    getFilterExpression(): string {

        if (!this.isApplied) {
            return '';
        }

        return `${this.fieldName} ge ${this._from.toJSON().slice(0, 10)} and ${this.fieldName} le ${this._till.toJSON().slice(0, 10)}`;
    }

    @observable
    private _minDate: Date;
    @observable
    private _maxDate: Date;
    @observable
    private _from: Date = new Date();
    @observable
    private _till: Date = new Date();

    private parseFilterExpression(filterClause: string): Date[] {

        if (!filterClause) {
            return null;
        }

        const regex = new RegExp(`${this.fieldName} ge ([0-9-]+) and ${this.fieldName} le ([0-9-]+)`, 'gi');
        const match = regex.exec(filterClause);
        return !match ? null : [new Date(match[1]), new Date(match[2])];
    }
}