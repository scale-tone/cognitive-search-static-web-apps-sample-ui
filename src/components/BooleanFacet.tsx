import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { List, ListItem, ListItemText, Radio } from '@material-ui/core';

import { BooleanFacetState } from '../states/BooleanFacetState';

// Renders facet for a boolean field
@observer
export class BooleanFacet extends React.Component<{ state: BooleanFacetState, inProgress: boolean }> {

    static getHintText(state: BooleanFacetState): string {
        return state.isApplied ? (state.value ? 'true' : 'false') : 'any';
    }

    render(): JSX.Element {
        const state = this.props.state;
        return (
            <FacetValuesList component="div" disablePadding>

                <FacetValueListItem dense disableGutters>
                    <Radio edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={!state.isApplied}
                        onChange={(evt) => state.value = null}
                    />
                    <ListItemText primary="[ANY]" />
                </FacetValueListItem>
                <FacetValueListItem dense disableGutters>
                    <Radio edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={state.value === true}
                        onChange={(evt) => state.value = true}
                    />
                    <ListItemText primary={`TRUE(${state.trueCount})`} />
                </FacetValueListItem>
                <FacetValueListItem dense disableGutters>
                    <Radio edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={state.value === false}
                        onChange={(evt) => state.value = false}
                    />
                    <ListItemText primary={`FALSE(${state.falseCount})`} />
                </FacetValueListItem>

            </FacetValuesList>
        );
    }
}

const FacetValueListItem: typeof ListItem = styled(ListItem)({
    paddingLeft: '46px !important',
});

const FacetValuesList: typeof List = styled(List)({
    maxHeight: 340,
    overflowY: 'auto !important',
    marginRight: '18px !important'
})