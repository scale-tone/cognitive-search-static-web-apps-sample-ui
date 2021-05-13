import * as atlas from 'azure-maps-control';

import { FacetState, FacetTypeEnum } from './FacetState';
import { StringCollectionFacetState } from './StringCollectionFacetState';
import { IServerSideConfig } from './ServerSideConfig';

export const MaxFacetValues = 500;

// State of facets on the left
export class FacetsState {

    // Facets to be displayed on the left
    get facets(): FacetState[] { return this._facets; }

    // Gets current bounding box
    getRegionAsString(): string {

        if (!this._geoRegion) {
            return '';
        }

        const topLeft = atlas.data.BoundingBox.getNorthWest(this._geoRegion);
        const bottomRight = atlas.data.BoundingBox.getSouthEast(this._geoRegion);

        return `[${topLeft[0].toFixed(3)},${topLeft[1].toFixed(3)}] - [${bottomRight[0].toFixed(3)},${bottomRight[1].toFixed(3)}]`;
    }

    // Bounding box for geo filtering
    get geoRegion(): atlas.data.BoundingBox { return this._geoRegion; }
    set geoRegion(r: atlas.data.BoundingBox) {
        this._geoRegion = r;
        this._onChanged();
    }

    constructor(private _onChanged: () => void, private _config: IServerSideConfig) { 
        // Dynamically creating the facet states out of config settings
        this.createFacetStates();
    }
    
    // Expands this facet and collapses all others.
    toggleExpand(facetName: string) {
        
        const selectedFacet = this._facets.find(f => f.fieldName === facetName);

        if (!!selectedFacet.isExpanded) {
            selectedFacet.isExpanded = false;
            return;
        }

        for (const facet of this._facets) {
            facet.isExpanded = false;
        }
        selectedFacet.isExpanded = true;
    }

    // Fills facets with values returned by Cognitive Search
    populateFacetValues(facetResults: any, firstSearchResult: any, filterClause: string) {

        this._geoRegion = this.parseGeoFilterExpression(filterClause);
        
        for (const facetState of this._facets) {
            
            const facetValues = facetResults[facetState.fieldName];
            const fieldValue = firstSearchResult[facetState.fieldName];

            facetState.populateFacetValues(!!facetValues ? facetValues : [], fieldValue, filterClause);
        }
    }

    // Updates counters for facet values
    updateFacetValueCounts(facetResults: any) {

        for (const facetState of this._facets) {

            const facetValues = facetResults[facetState.fieldName];
            if (!!facetValues) {
                facetState.updateFacetValueCounts(facetValues);
            }
        }
    }
    
    // Constructs $filter clause for a search request
    getFilterExpression(): string {

        const filterExpressions = this._facets
            .map(f => f.getFilterExpression())
            .concat(this.getGeoFilterExpression())
            .filter(f => (!!f));
        
        return !!filterExpressions.length ? `&$filter=${filterExpressions.join(' and ')}` : '';
    }
    
    // Selects a value in the specified facet
    filterBy(fieldName: string, fieldValue: string) {

        const facet = this._facets.find(f => f.fieldName === fieldName);
        if (!facet || facet.facetType !== FacetTypeEnum.StringCollectionFacet ) {
            return;
        }

        const stringCollectionFacet = facet.state as StringCollectionFacetState;

        stringCollectionFacet.values.forEach(v => { 
            if (v.value === fieldValue) {
                v.isSelected = true;
            }
        });
    }

    private _facets: FacetState[] = [];
    private _geoRegion: atlas.data.BoundingBox;

    // Dynamically generates facets from 'CognitiveSearchFacetFields' config parameter
    private createFacetStates() {

        const facetFields = this._config.CognitiveSearchFacetFields.split(',').filter(f => !!f);

        // Leaving the first facet expanded and all others collapsed
        var isFirstFacet = true;

        for (var facetField of facetFields) {
            this._facets.push(new FacetState(this._onChanged, facetField, isFirstFacet));
            isFirstFacet = false;
        }
    }

    private getGeoFilterExpression(): string {

        if (!this._geoRegion) {
            return '';
        }

        const topLeft = atlas.data.BoundingBox.getNorthWest(this._geoRegion);
        const bottomLeft = atlas.data.BoundingBox.getSouthWest(this._geoRegion);
        const bottomRight = atlas.data.BoundingBox.getSouthEast(this._geoRegion);
        const topRight = atlas.data.BoundingBox.getNorthEast(this._geoRegion);

        const points = `${topLeft[0]} ${topLeft[1]}, ${bottomLeft[0]} ${bottomLeft[1]}, ${bottomRight[0]} ${bottomRight[1]}, ${topRight[0]} ${topRight[1]}, ${topLeft[0]} ${topLeft[1]}`;
        return `geo.intersects(${this._config.CognitiveSearchGeoLocationField},geography'POLYGON((${points}))')`;
    }

    private parseGeoFilterExpression(filterClause: string): atlas.data.BoundingBox {

        if (!filterClause) {
            return null;
        }

        const regex = new RegExp(`geo.intersects\\(${this._config.CognitiveSearchGeoLocationField},geography'POLYGON\\(\\(([0-9\\., -]+)\\)\\)'\\)`, 'gi');
        const match = regex.exec(filterClause);
        if (!match) {
            return null;
        }

        const positions = match[1].split(',').slice(0, 4).map(s => s.split(' ').filter(s => !!s));
        if (positions.length < 4) {
            return null;
        }

        const bottomLeft = positions[1].map(s => Number(s));
        const topRight = positions[3].map(s => Number(s));

        const boundingBox = new atlas.data.BoundingBox(bottomLeft, topRight);
        return boundingBox;
    }
}