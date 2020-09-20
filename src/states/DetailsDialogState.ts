import { observable, computed } from 'mobx'
import axios from 'axios';

import { ErrorMessageState } from './ErrorMessageState';
import { SearchResult } from './SearchResult';

const BackendUri = process.env.REACT_APP_BACKEND_BASE_URI as string;

// Enum describing tabs on the Details dialog
export enum DetailsTabEnum {
    Transcript = 0,
    Metadata,
    Map
}

// Typed response of the /lookup endpoint
interface IDetailsResult {
    HotelName: string;
    Description: string;
    Location: { coordinates: number[] }
}

// A pair of positions in a text
interface ITextInterval {
    start: number;
    stop: number;
}

// Represents a fragment inside document's text
interface ITextFragment {
    readonly text: ITextInterval;
    readonly textBefore?: ITextInterval;
    readonly textAfter?: ITextInterval;
}

// Num of symbols to take before and after the search keyword
const TextFragmentLength = 100;

// State of the Details dialog
export class DetailsDialogState extends ErrorMessageState {

    // Tab currently selected
    @observable
    selectedTab: DetailsTabEnum = DetailsTabEnum.Transcript;

    // Raw text split into fragments like <some-text><search-keyword><some-more-text><another-search-keyword><etc>
    @computed
    get textFragments(): ITextFragment[] {

        if (this.searchWords.length <= 0) {
            return [{ text: { start: 0, stop: this._text.length } }];
        }

        const results: ITextFragment[] = []
        var prevIndex = 0;

        // searching for any of search keywords...
        const regex = new RegExp(this.searchWords.join('|'), 'gi');
        var match: RegExpExecArray | null;
        while (match = regex.exec(this._text)) {

            const keyword = { start: match.index, stop: match.index + match[0].length };

            if (keyword.start > prevIndex) {
                results.push({ text: { start: prevIndex, stop: keyword.start } });
            }

            // A fragment with textBefore and textAfter denotes a keyword (which is to be highlighted by markup)
            results.push({
                textBefore: { start: keyword.start - TextFragmentLength, stop: keyword.start },
                text: keyword,
                textAfter: { start: keyword.stop, stop: keyword.stop + TextFragmentLength }
            });

            prevIndex = keyword.stop;
        }

        if (this._text.length > prevIndex) {
            results.push({ text: { start: prevIndex, stop: this._text.length } });
        }

        return results;
    }

    // Progress flag
    @computed
    get inProgress(): boolean { return this._inProgress; }

    // Document's display name
    @computed
    get name(): string { return this._searchResult.name; }
    
    // Document's coordinates
    @computed
    get coordinates(): number[] { return this._details?.Location?.coordinates; }

    // All document's properties
    @computed
    get details(): IDetailsResult { return this._details; }

    // Search query split into words (for highlighting)
    readonly searchWords: string[];

    constructor(searchQuery: string, private _searchResult: SearchResult) {
        super();

        this.searchWords = this.extractSearchWords(searchQuery);

        axios.get(`${BackendUri}/lookup/${_searchResult.key}`).then(lookupResponse => {

            this._details = lookupResponse.data;
            console.log(this._details);

            this._text = this._details.Description;

        }, err => {

            this.ShowError(`Failed to load details. ${err}`);
                
        }).finally(() => {
            this._inProgress = false;
        });
    }

    // Returns a piece of text within specified boundaries
    getPieceOfText(interval: ITextInterval): string {

        const start = interval.start > 0 ? interval.start : 0;
        const stop = interval.stop > this._text.length ? this._text.length : interval.stop;

        return this._text.slice(start, stop);
    }

    @observable
    private _details: IDetailsResult;

    @observable
    private _inProgress: boolean = true;

    private _text: string = '';

    private extractSearchWords(searchQuery: string): string[] {

        // Skipping search query operators
        const queryOperators = ["and", "or"];

        const regex = /\w+/gi
        const results: string[] = [];

        var match: RegExpExecArray | null;
        while (match = regex.exec(searchQuery)) {

            if (!queryOperators.includes(match[0].toLowerCase())) {
                results.push(match[0]);
            }
        }

        return results;
    }
}
