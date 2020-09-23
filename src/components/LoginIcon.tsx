import React from 'react';
import { observer } from 'mobx-react';

import { Button, Menu, MenuItem, Tooltip } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';

import { LoginState } from '../states/LoginState';

// Shows current login status
@observer
export class LoginIcon extends React.Component<{ state: LoginState }> {

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