import { observable, computed } from 'mobx'
import axios from 'axios';

const BackendUri = process.env.REACT_APP_BACKEND_BASE_URI as string;

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
        window.location.href = `${BackendUri}/.auth/logout`
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

        // Making request to EasyAuth's service endpoint, to get to know current user's name.
        // So far we're leveraging the simplest option - 'Server-Directed Login flow' (https://github.com/cgillum/easyauth/wiki/Login),
        // so no client-side JS libraries required and all auth is done with HTTP redirects/cookies.
        // TODO: the drawback of this approach is that cookies do expire, and that expiration isn't handled
        // here yet. Need to handle 401/403 responses from server and do a page refresh upon them.
        axios.get(`${BackendUri}/.auth/me`).then(result => {

            if (!result.data || !result.data.length) {
                return;
            }

            const me = result.data[0];
            this._userName = me.user_id;
        });        
    }
}