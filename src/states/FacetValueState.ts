import { observable, computed } from 'mobx'

export const MaxFacetValueLength = 50;

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

// Checks if a facet value looks pretty
export function isValidFacetValue(value: string): boolean {

    // Filtering out garbage
    return (value.length < MaxFacetValueLength)
        && (!/ {2}|\n|\t/.test(value))
}

// Need to deal with special characters and replace one single quote with two single quotes
export function encodeFacetValue(v: string): string {
    return encodeURIComponent(v.replace('\'', '\'\''));
}

// Need to deal with special characters and replace one single quote with two single quotes
export function decodeFacetValue(v: string): string {
    return decodeURIComponent(v).replace('\'\'', '\'');
}
