import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';
import { Avatar, Card, Chip, CardHeader, CardContent, Grid, Link, LinearProgress, Typography } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';

import { SearchResultsState } from '../states/SearchResultsState';

// List of search results
@observer
export class SearchResults extends React.Component<{ state: SearchResultsState, inProgress: boolean }> {

    componentDidMount() {
        
        // Doing a simple infinite scroll
        document.addEventListener('scroll', (evt) => {

            const scrollingElement = (evt.target as Document).scrollingElement;
            if (!scrollingElement) {
                return;
            }

            const scrollPos = scrollingElement.scrollHeight - window.innerHeight - scrollingElement.scrollTop;
            const scrollPosThreshold = 100;

            if (scrollPos < scrollPosThreshold) {
                this.props.state.loadMoreResults();
            }
        });


    }

    render(): JSX.Element {

        const state = this.props.state;

        var cards = state.searchResults.map(item => {

            return (
                <Grid key={item.key} item sm={12} md={6}>
                    <Card raised>
                        <CardHeader
                            avatar={
                                <Link onClick={() => state.showDetails(item)}>
                                    <Avatar><FolderIcon /></Avatar>
                                </Link>
                            }
                            title={<Link variant="h6" onClick={() => state.showDetails(item)}>{item.name}</Link>}
                        />                        
                        <CardContent>
                            {item.otherFields.map(val => { return (
                                <Typography variant="body2" key={val}>
                                    {val}
                                </Typography>
                            )})}
                        </CardContent>

                        <TagButtonsDiv>
                            {item.keywords.map(kw => { return (
                                <TagChip
                                    key={kw}
                                    label={kw}
                                    size="small"
                                    onClick={() => state.facetsState.filterBy(item.keywordsFieldName, kw)}
                                    disabled={this.props.inProgress}
                                />
                            ); })}
                        </TagButtonsDiv>

                    </Card>
                </Grid>
            );
        });

        return (<>
            <div>
                <CountersTypography variant="caption" >
                    {state.searchResults.length} of {state.totalResults} results shown 
                </CountersTypography>

                {!!state.inProgress && (<TopLinearProgress />)}
            </div>

            <ResultsGrid container spacing={3}>

                {!!state.errorMessage && (
                    <ErrorChip color="secondary" label={state.errorMessage} onDelete={state.HideError}/>
                )}

                {cards}
            </ResultsGrid>

            {(!!state.inProgress && !!state.searchResults.length) && (<LinearProgress />)}
        </>);
    }
}

const ResultsGrid = styled(Grid)({
    paddingRight: 30,
    paddingBottom: 20,

    // required for Edge :(((
    marginLeft: '0px !important',
})

const TagButtonsDiv = styled.div({
    marginRight: '15px !important',
    marginLeft: '5px !important',
    marginTop: '8px !important',
    marginBottom: '10px !important',
    display: 'flex',
    flexWrap: 'wrap'
})

const CountersTypography = styled(Typography)({
    float: 'right',
    width: 'auto',
    margin: '10px !important'
})

const TopLinearProgress = styled(LinearProgress)({
    top: 20
})

const TagChip = styled(Chip)({
    marginLeft: '10px !important',
    marginBottom: '10px !important'
})

const ErrorChip = styled(Chip)({
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginLeft: 50,
    marginRight: 50,
})
