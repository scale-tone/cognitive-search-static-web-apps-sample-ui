import { observable, computed } from 'mobx'
import axios from 'axios';

// Handles login stuff
export class LoginState {

    // Currently logged in user's name
    @computed
    get userName(): string { return this._userName; }

    // Whether there was a login or not
    @computed
    get isLoggedInAnonymously(): boolean { return !this._userName; };

    // Needed to anchor popup menu to
    @observable
    menuAnchorElement?: Element;

    constructor() {
        this.initializeAuth();
    }

    // Redirects user to EasyAuth's logout endpoint (so that they can choose a different login)
    logout() {
        this.menuAnchorElement = undefined;
        window.location.href = `/.auth/logout`
    }

    @observable
    private _userName: string;

    private initializeAuth(): void {

        // Auth cookies do expire. Here is a primitive way to forcibly re-authenticate the user 
        // (by refreshing the page), if that ever happens.
        axios.interceptors.response.use(response => response, err => {

            if (err.message === 'Network Error') {
                window.location.reload(true);
                return;
            }

            return Promise.reject(err);
        });

        // Trying to obtain user info, as described here: https://docs.microsoft.com/en-us/azure/static-web-apps/user-information?tabs=javascript
        axios.get(`/.auth/me`).then(result => {

            this._userName = result.data?.clientPrincipal?.userDetails;
        });        
    }
}