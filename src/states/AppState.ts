import { observable, computed } from 'mobx';

import { LoginState } from './LoginState';
import { DetailsDialogState } from './DetailsDialogState';
import { MapResultsState } from './MapResultsState';
import { SearchResultsState } from './SearchResultsState';
import { SearchResult } from './SearchResult';
import { GetServerSideConfig } from './ServerSideConfig';

// The root object in app's state hierarchy
export class AppState {

    // Object with server-side configuration values
    readonly serverSideConfig = GetServerSideConfig();

    // Progress flag
    @computed
    get inProgress(): boolean { return this.searchResultsState.inProgress || this.mapResultsState?.inProgress; }

    // Login state and user info
    readonly loginState: LoginState = new LoginState();

    // State of search results shown as a list
    readonly searchResultsState: SearchResultsState = new SearchResultsState(
        r => this.showDetails(r), s => this.mapResultsState?.loadResults(s), this.serverSideConfig)
    
    // State of search results shown on a map
    readonly mapResultsState: MapResultsState = this.areMapResultsEnabled ? new MapResultsState(r => this.showDetails(r), this.serverSideConfig) : null;
    
    // Details dialog's state
    get detailsState(): DetailsDialogState { return this._detailsState; };

    // Needed to anchor popup menu to
    @observable
    menuAnchorElement?: Element;

    constructor() {
        this.parseAndApplyQueryString();
    }

    // Shows Details dialog
    showDetails(result: SearchResult) {
        this._detailsState = new DetailsDialogState(this.searchResultsState.searchString,
            result,
            this.areMapResultsEnabled ? this.serverSideConfig.CognitiveSearchGeoLocationField : null,
            this.serverSideConfig.CognitiveSearchTranscriptFields
        );
    }

    // Hides Details dialog
    hideDetails() {
        this._detailsState = null;
    }

    @observable
    private _detailsState: DetailsDialogState;

    private get areMapResultsEnabled(): boolean {
        return !!this.serverSideConfig.CognitiveSearchGeoLocationField
            && !!this.serverSideConfig.AzureMapSubscriptionKey;
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