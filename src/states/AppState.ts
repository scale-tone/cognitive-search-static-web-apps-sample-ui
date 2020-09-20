import { action, observable, computed } from 'mobx'
import axios from 'axios';

import { DetailsDialogState } from './DetailsDialogState';
import { MapResultsState } from './MapResultsState';
import { SearchResultsState } from './SearchResultsState';
import { SearchResult } from './SearchResult';

const BackendUri = process.env.REACT_APP_BACKEND_BASE_URI as string;

// The root object in app's state hierarchy
export class AppState {

    // Currently logged in user's name
    @computed
    get userName(): string { return this._userName; }

    // Whether there was a login or not
    @computed
    get isLoggedInAnonymously(): boolean { return !this._userName; };

    // Progress flag
    @computed
    get inProgress(): boolean { return this.mapResultsState.inProgress || this.searchResultsState.inProgress; }

    // State of search results shown as a list
    readonly searchResultsState: SearchResultsState = new SearchResultsState(
        r => this.showDetails(r), s => this.mapResultsState.loadResults(s))

    // State of search results shown on a map
    readonly mapResultsState: MapResultsState = new MapResultsState(r => this.showDetails(r));
    
    // Details dialog's state
    get detailsState(): DetailsDialogState { return this._detailsState; };

    // Needed to anchor popup menu to
    @observable
    menuAnchorElement?: Element;

    constructor() {
        this.initializeAuth();
        this.parseAndApplyQueryString();
    }

    // Redirects user to EasyAuth's logout endpoint (so that they can choose a different login)
    logout() {
        this.menuAnchorElement = undefined;
        window.location.href = `${BackendUri}/.auth/logout`
    }

    // Shows Details dialog
    showDetails(result: SearchResult) {
        this._detailsState = new DetailsDialogState(this.searchResultsState.searchString, result);
    }

    // Hides Details dialog
    hideDetails() {
        this._detailsState = null;
    }

    @observable
    private _detailsState: DetailsDialogState;

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

    private parseAndApplyQueryString(): void {
        
        const queryString = window.location.search;
        if (!queryString) {
            return;
        }

        // If there is an incoming query string, we first run query without $filter clause, to collect facet values,
        // and then run the query again, this time with incoming $filter applied. It is slower, but makes Facets tab
        // look correct.
        var filterClause: string = null;

        const filterMatch = /[?&]?\$filter=([^&]+)/i.exec(window.location.search);
        if (!!filterMatch) {
            filterClause = decodeURIComponent(filterMatch[1]);
        }

        const searchQueryMatch = /[?&]?search=([^&]*)/i.exec(window.location.search);
        if (!!searchQueryMatch) {
            this.searchResultsState.searchString = decodeURIComponent(searchQueryMatch[1]);
            this.searchResultsState.search(filterClause);
        }
    }
}