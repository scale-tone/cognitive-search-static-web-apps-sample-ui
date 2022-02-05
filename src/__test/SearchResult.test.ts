import { SearchResult } from '../states/SearchResult';
import { IServerSideConfig } from '../states/ServerSideConfig';

test('parses raw result', async () => {

    // arrange

    const config: IServerSideConfig = {

        SearchServiceName: 'mySearchService',
        SearchIndexName: 'mySearchIndex',
        AzureMapSubscriptionKey: undefined,
        CognitiveSearchKeyField: 'myKeyField',
        CognitiveSearchNameField: 'myNameField1,myNameField2',
        CognitiveSearchGeoLocationField: 'myCoordinatesField',
        CognitiveSearchOtherFields: 'myField1,myField2,myField3,myKeywordsField',
        CognitiveSearchTranscriptFields: undefined,
        CognitiveSearchFacetFields: undefined,
        CognitiveSearchSuggesterName: undefined
    };

    const rawSearchResult = {
        myKeyField: 'key123',
        myNameField1: 'First Name',
        myNameField2: 'Second Name',
        myField1: 'value1',
        myField2: 'value2',
        myField3: 'value3',
        myCoordinatesField: [12.34, 56.78],
        myKeywordsField: ['keyword1', 'keyword2', 'invalid  keyword', 'keyword1']
    };

    rawSearchResult['@search.highlights'] = {
        myField1: ['Lorem <em>ipsum</em> dolor sit amet', 'consectetur <em>adipiscing elit</em>'],
        myField2: ['<em>sed do eiusmod</em> tempor incididunt ut labore et dolore magna aliqua'],
    };

    // act

    const searchResult = new SearchResult(rawSearchResult, config);

    // assert

    expect(searchResult.key).toBe(rawSearchResult.myKeyField);
    expect(searchResult.name).toBe(`${rawSearchResult.myNameField1},${rawSearchResult.myNameField2}`);

    expect(searchResult.coordinates.length).toBe(rawSearchResult.myCoordinatesField.length);
    expect(searchResult.coordinates[0]).toBe(rawSearchResult.myCoordinatesField[0]);
    expect(searchResult.coordinates[1]).toBe(rawSearchResult.myCoordinatesField[1]);

    expect(searchResult.highlightedWords.length).toBe(3);
    expect(searchResult.highlightedWords[0]).toBe('ipsum');
    expect(searchResult.highlightedWords[1]).toBe('adipiscing elit');
    expect(searchResult.highlightedWords[2]).toBe('sed do eiusmod');

    expect(searchResult.keywordsFieldName).toBe('myKeywordsField');
    expect(searchResult.keywords.length).toBe(2);
    expect(searchResult.keywords[0]).toBe('keyword1');
    expect(searchResult.keywords[1]).toBe('keyword2');
});
  