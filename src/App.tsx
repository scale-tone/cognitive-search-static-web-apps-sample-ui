//import './App.css';

import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { AppBar, Box, Button, Link, Menu, MenuItem, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';

import logo from './logo.svg';

import { SearchResultsMap } from './components/SearchResultsMap';
import { SearchResults } from './components/SearchResults';
import { FilterBox } from './components/FilterBox';
import { SearchTextBox } from './components/SearchTextBox';
import { Facets } from './components/Facets';
import { DetailsDialog } from './components/DetailsDialog';
import { LoginIcon } from './components/LoginIcon';

import { AppState } from './states/AppState';

const SidebarWidth = '300px';

const Sidebar = styled.div({
    width: SidebarWidth,
    float: 'left',
})

const Main = styled.div({
    marginLeft: SidebarWidth
})

const LandingDiv = styled.div({
    margin: 150
})

const ToolbarSearchBoxDiv = styled.div({
    width: '100%'
})

const TitleTypography = styled(Typography)({
    width: 220
})

const FilterDiv = styled.div({
    paddingLeft: SidebarWidth
})

// Main app page
@observer
export class App extends React.Component<{ state: AppState }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (<>

            <AppBar position="static" color="default">
                <Toolbar>

                    {state.searchResultsState.isInInitialState ? (<>

                        <img src={logo} width="30px" />
                        <Box width={15} />
                        <Typography variant="h4" color="inherit">
                            Cognitive Search Demo
                        </Typography>
                        
                    </>) : (<>

                        <Link href="/" color="inherit">
                            <img src={logo} width="30px" />
                        </Link>
                        <Box width={15} />
                        <Link href="/" color="inherit">
                            <TitleTypography variant="h6" color="inherit">
                                    Cognitive Search Demo
                            </TitleTypography>
                        </Link>
                        <Box width={15} />
                        <ToolbarSearchBoxDiv>
                            <SearchTextBox state={state.searchResultsState} inProgress={state.inProgress} />
                        </ToolbarSearchBoxDiv>
                            
                    </>)}
                    
                    <Typography style={{ flex: 1 }} />
                    <Box width={30} />
                    <LoginIcon state={state}/>

                </Toolbar>

                <FilterDiv>
                    <FilterBox state={state.searchResultsState.facetsState} inProgress={state.inProgress} />
                </FilterDiv>
            </AppBar>

            {state.searchResultsState.isInInitialState ? (<LandingDiv>

                <SearchTextBox state={state.searchResultsState} inProgress={state.inProgress} />

            </LandingDiv>) : (<>

                <Sidebar>
                    <Facets state={state.searchResultsState.facetsState} inProgress={state.inProgress} />
                </Sidebar>

                <Main>
                    <SearchResultsMap state={state.mapResultsState} />
                    <SearchResults state={state.searchResultsState} inProgress={state.inProgress} />
                </Main>

            </>)}

            {!!state.detailsState && (
                <DetailsDialog state={state.detailsState} hideMe={() => state.hideDetails()} />
            )}

        </>);
    }
}

export default App;
