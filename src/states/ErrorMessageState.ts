import { observable, computed } from 'mobx'

// Base class for all states, that might display error messages
export class ErrorMessageState {

    @computed
    get errorMessage(): string { return this._errorMessage; }

    HideError() {
        this._errorMessage = '';
    }

    protected ShowError(msg: string) {
        this._errorMessage = msg;
    }

    @observable
    private _errorMessage: string;
}
