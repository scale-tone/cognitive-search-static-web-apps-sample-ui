import React from 'react';

import { Button, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';

import { AppState } from '../states/AppState';

// Shows current login status
export class LoginIcon extends React.Component<{ state: AppState }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (<>

            <Button color={state.isLoggedInAnonymously ? "secondary" : "inherit"}
                onClick={evt => state.menuAnchorElement = evt.currentTarget}
            >
                <Tooltip title={state.isLoggedInAnonymously ? "ANONYMOUS" : state.userName}>
                    <AccountCircle />
                </Tooltip>
            </Button>

            <Menu
                anchorEl={state.menuAnchorElement}
                open={!state.isLoggedInAnonymously && !!state.menuAnchorElement}
                onClose={() => state.menuAnchorElement = undefined}
            >
                <MenuItem onClick={() => state.logout()}>Login under a different name</MenuItem>
            </Menu>
            
        </>);
    }
}