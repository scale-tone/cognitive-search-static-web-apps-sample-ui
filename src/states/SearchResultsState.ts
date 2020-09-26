import { observable, computed } from 'mobx'
import axios from 'axios';

import { ErrorMessageState } from './ErrorMessageState';
import { FacetsState, MaxFacetValues } from './FacetsState';
import { SearchResult } from './SearchResult';

const BackendUri = process.env.REACT_APP_BACKEND_BASE_URI as string;

const PageSize = 30;

// State of the list of search results
export class SearchResultsState extends ErrorMessageState {

    // String to search for
    @observable
    searchString: string = '';

    // Results loaded so far
    @observable
    searchResults: SearchResult[] = [];

    // When page is just loaded, returns true. Later on returns false. Used to show a landing page.
    @computed
    get isInInitialState(): boolean { return this._isInInitialState; }
    
    // Progress flag
    @computed
    get inProgress(): boolean { return this._inProgress; }

    // Total number of documents matching the current query
    @computed
    get totalResults(): number { return this._totalResults; }

    // State of facets on the left
    get facetsState(): FacetsState { return this._facetsState; }

    constructor(readonly showDetails: (r: SearchResult) => void, private loadMapResults: (s) => void) {
        super();
        this.initializeWindowOnPopState();
    }

    // Proceed with search
    search(filterClauseFromQueryString: string = null) {

        if (this._inProgress) {
            return;
        }

        // Moving from the initial landing page
        this._isInInitialState = false;

        // Resetting the facets tree
        this._facetsState.populateFacetValues({}, null);

        // Caching $filter clause, that came from URL, if any. We will apply it later on.
        this._filterClauseFromQueryString = filterClauseFromQueryString;

        this.reloadResults(true);
    }

    // Try loading the next page of results
    loadMoreResults(isInitialSearch: boolean = false) {

        if (this._inProgress || this._allResultsLoaded) {
            return;
        }

        const facetsClause = this._facetsState.facets.map(f => `facet=${f.fieldName},count:${MaxFacetValues}`).join('&');

        const uri = `${BackendUri}${this.searchClauseAndQueryType}${this._filterClause}&${facetsClause}&$select=${SearchResult.SearchResultFields}&$top=${PageSize}&$skip=${this.searchResults.length}`;

        this._inProgress = true;
        axios.get(uri).then(response => {

            this._totalResults = response.data['@odata.count'];

            if (!!isInitialSearch) {
                
                // Only re-populating facets after Search button has actually been clicked
                this._facetsState.populateFacetValues(response.data['@search.facets'], this._filterClauseFromQueryString);

                if (!!this._filterClauseFromQueryString) {
                    this._filterClauseFromQueryString = null;

                    // Causing the previous query to cancel and triggering a new query, now with $filter clause applied.
                    // Yes, this is a bit more slowly, but we need the first query to be without $filter clause, because
                    // we need to have full set of facet values loaded.
                    this._inProgress = false;
                    this.reloadResults(false);
                    return;
                }

            } else {
                // Otherwise only updating counters for each facet value
                this._facetsState.updateFacetValueCounts(response.data['@search.facets']);
            }

            const results: SearchResult[] = response.data.value?.map(r => new SearchResult(r));

            if (!results || !results.length) {
                this._allResultsLoaded = true;
            } else {
                this.searchResults.push(...results);
            }

            this._inProgress = false;
        }, (err) => {

            this.ShowError(`Loading search results failed. ${err}`);
            this._allResultsLoaded = true;
            this._inProgress = false;
               
        });
    }

    private get searchClause(): string { return `?search=${this.searchString}`; }
    private get searchClauseAndQueryType(): string { return `/search${this.searchClause}&$count=true&queryType=full`; }

    @observable
    private _isInInitialState: boolean = true;
    
    @observable
    private _inProgress: boolean = false;

    @observable
    private _totalResults: number = 0;
    
    private _facetsState = new FacetsState(() => this.reloadResults(false));

    private _filterClause: string = '';
    private _filterClauseFromQueryString: string = null;
    private _doPushState: boolean = true;
    private _allResultsLoaded: boolean = false;

    private reloadResults(isInitialSearch: boolean) {

        this.HideError();
        this.searchResults = [];
        this._totalResults = 0;
        this._allResultsLoaded = false;

        this._filterClause = this._facetsState.getFilterExpression();

        this.loadMoreResults(isInitialSearch);

        // Triggering map results to be loaded only if we're currently not handling an incoming query string.
        // When handling an incoming query string, the search query will be submitted twice, and we'll reload the map
        // during the second try.
        if (!!this._filterClauseFromQueryString) {
            return;
        }

        if (!!this.loadMapResults) {
            this.loadMapResults(BackendUri + this.searchClauseAndQueryType + this._filterClause);
        }

        // Placing the search query into browser's address bar, to enable Back button and URL sharing
        this.pushStateWhenNeeded();
    }

    private pushStateWhenNeeded() {

        if (this._doPushState) {

            const pushState = {
                query: this.searchString,
                filterClause: this._filterClause
            };
            window.history.pushState(pushState, '', this.searchClause + this._filterClause);
        }
        this._doPushState = true;
    }
    
    private initializeWindowOnPopState() {
        
        // Enabling Back arrow
        window.onpopstate = (evt: PopStateEvent) => {

            const pushState = evt.state;

            if (!pushState) {
                this._isInInitialState = true;
                return;
            }

            // When handling onPopState we shouldn't be re-pushing current URL into history
            this._doPushState = false;
            this.searchString = pushState.query;
            this.search(pushState.filterClause);
        }
    }
}