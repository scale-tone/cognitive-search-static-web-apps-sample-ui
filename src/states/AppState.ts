import { observable, computed } from 'mobx'

import { LoginState } from './LoginState';
import { DetailsDialogState } from './DetailsDialogState';
import { MapResultsState } from './MapResultsState';
import { SearchResultsState } from './SearchResultsState';
import { SearchResult } from './SearchResult';

const BackendUri = process.env.REACT_APP_BACKEND_BASE_URI as string;

// The root object in app's state hierarchy
export class AppState {

    // Progress flag
    @computed
    get inProgress(): boolean { return this.searchResultsState.inProgress || this.mapResultsState?.inProgress; }

    // Login state and user info
    readonly loginState: LoginState = new LoginState();

    // State of search results shown as a list
    readonly searchResultsState: SearchResultsState = new SearchResultsState(
        r => this.showDetails(r), s => this.mapResultsState?.loadResults(s))

    // State of search results shown on a map
    readonly mapResultsState: MapResultsState = SearchResult.areMapResultsEnabled ? new MapResultsState(r => this.showDetails(r)) : null;
    
    // Details dialog's state
    get detailsState(): DetailsDialogState { return this._detailsState; };

    // Needed to anchor popup menu to
    @observable
    menuAnchorElement?: Element;

    constructor() {
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