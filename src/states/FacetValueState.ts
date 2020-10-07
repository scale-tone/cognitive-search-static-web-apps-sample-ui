import { observable, computed } from 'mobx'

export const MaxFacetValueLength = 50;

// Checks if a facet value looks pretty
export function isValidFacetValue(value: string): boolean {

    // Filtering out garbage
    return (value.length < MaxFacetValueLength)
        && (!/ {2}|\n|\t/.test(value))
}

// State of each specific facet value on the left
export class FacetValueState {

    @computed
    get isSelected(): boolean { return this._isSelected; }
    set isSelected(val: boolean) {
        this._isSelected = val;
        this._onChanged();
    }

    unsetSilently() {
        this._isSelected = false;
    }

    constructor(readonly value: string, readonly count: number, private _onChanged: () => void, isSelected: boolean = false) {
        this._isSelected = isSelected;
    }

    @observable
    private _isSelected: boolean = false;
}