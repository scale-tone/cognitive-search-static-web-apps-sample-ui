import React from 'react';
import { action } from 'mobx'
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Chip, TextField, Button, Typography } from '@material-ui/core';

import { SearchResultsState } from '../states/SearchResultsState';

const SearchTextBoxDiv = styled.div({
    overflow: 'hidden',
    paddingLeft: 35,
    paddingRight: 20
})


const SearchButton = styled(Button)({
    float: 'right',
    width: 150,
    height: 40
});

const SearchTextWrapper = styled.div({
    height: '100%',
    paddingTop: 20,
    paddingBottom: 20,
});

const FacetChipsDiv = styled.div({
    paddingLeft: 40,
    paddingTop: 15,
    display: 'flex',
    flexWrap: 'wrap'
})

const FacetChip = styled(Chip)({
    marginLeft: '10px !important',
    marginBottom: '10px !important'
})

const FacetNameTypography = styled(Typography)({
    marginTop: '3px !important'
})

const OperatorTypography = styled(Typography)({
    marginLeft: '10px !important',
    marginTop: '5px !important',
})

// TextBox for entering search query into
@observer
export class SearchTextBox extends React.Component<{ state: SearchResultsState, inProgress: boolean }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (
            <SearchTextWrapper>

                <SearchButton variant="contained" color="primary" disabled={this.props.inProgress} onClick={() => state.search()}>
                    Search
                </SearchButton>
                
                <SearchTextBoxDiv>

                    <TextField
                        variant="outlined"
                        size="small"
                        fullWidth={true}
                        placeholder="What are you searching for today?"
                        value={state.searchString}
                        onChange={(evt) => state.searchString = evt.target.value as string}
                        onKeyPress={this.handleKeyPress}
                        disabled={this.props.inProgress}
                    />

                </SearchTextBoxDiv>

            </SearchTextWrapper>
        );
    }

    @action.bound
    private handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter') {
            // Otherwise the event will bubble up and the form will be submitted
            event.preventDefault();

            this.props.state.search();
        }
    }
}