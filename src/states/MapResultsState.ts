import { observable, computed } from 'mobx'
import axios from 'axios';
import * as atlas from 'azure-maps-control';

import { ErrorMessageState } from './ErrorMessageState';
import { SearchResult } from './SearchResult';
import { MaxFacetValues } from './FacetsState';
import { IServerSideConfig } from './ServerSideConfig';

const MapPageSize = 500;
const MaxMapResults = 5000;

const MapInitialCoordinates: atlas.data.Position[] = [[-115, 50], [-95, 20]];

// State of search results shown on a map
export class MapResultsState extends ErrorMessageState {
    
    // Progress flag
    @computed
    get inProgress(): boolean { return this._inProgress; }

    // Number of results fetched so far
    @computed
    get resultsShown(): number { return this._resultsShown; }

    // Azure Maps DataSource object
    get mapDataSource(): atlas.source.DataSource { return this._mapDataSource; }

    @observable
    mapBounds: atlas.data.BoundingBox = atlas.data.BoundingBox.fromPositions(MapInitialCoordinates);

    constructor(readonly showDetails: (r: SearchResult) => void, private _config: IServerSideConfig) { 
        super();
    }

    // Proceed with search
    loadResults(searchUrl: string) {

        this.HideError();
        this._totalResults = 0;
        this._resultsLoaded = 0;
        this._mapDataSource.clear();
        this._collectedCoordinates = [];
        this._resultsShown = 0;
        this._inProgress = true;

        this.loadMoreResults(searchUrl);
    }

    private loadMoreResults(searchUrl: string) {

        const fields = `${this._config.CognitiveSearchKeyField},${this._config.CognitiveSearchNameField},${this._config.CognitiveSearchGeoLocationField}`;
        const uri = `${searchUrl}&$select=${fields}&$top=${MapPageSize}&$skip=${this._resultsLoaded}`;

        axios.get(uri).then(response => {

            this._totalResults = Math.min(MaxMapResults, response.data['@odata.count']);
            const results = response.data.value;

            for (const rawResult of results) {

                const result = new SearchResult(rawResult, this._config);

                if (!result.coordinates || !result.key) {
                    continue;
                }
                
                // Not showing more than what is shown in facets
                if (this._resultsShown >= MaxFacetValues) {
                    break;
                }

                this._mapDataSource.add(new atlas.data.Feature(
                    new atlas.data.Point(result.coordinates),
                    result));
                
                this._collectedCoordinates.push(result.coordinates);
                this._resultsShown++;
            }
            this._resultsLoaded += results.length;

            if (!results.length || this._resultsLoaded >= this._totalResults || this._resultsShown >= MaxFacetValues) {

                this._inProgress = false;

                // Causing the map to be zoomed to this bounding box
                this.mapBounds = atlas.data.BoundingBox.fromPositions(this._collectedCoordinates);
                
            } else {

                // Keep loading until no more found or until we reach the limit
                this.loadMoreResults(searchUrl);
            }

        }, (err) => {

            this.ShowError(`Loading map results failed. ${err}`);
            this._inProgress = false;
        });
    }
    
    @observable
    private _inProgress: boolean = false;

    @observable
    private _resultsShown: number = 0;
    
    private _totalResults: number = 0;
    private _resultsLoaded: number = 0;

    private _mapDataSource = new atlas.source.DataSource();

    // Also storing collected coordinates, to eventually zoom the map to
    private _collectedCoordinates: atlas.data.Position[] = [];
}