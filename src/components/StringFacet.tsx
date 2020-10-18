import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Checkbox, List, ListItem, ListItemText } from '@material-ui/core';

import { StringFacetState } from '../states/StringFacetState';
import { StringCollectionFacetState } from '../states/StringCollectionFacetState';

// Renders facet for a string field
@observer
export class StringFacet extends React.Component<{ state: StringFacetState, inProgress: boolean }> {

    static getHintText(state: StringCollectionFacetState): string {
        return state.allSelected ? `All ${state.values.length} selected` : `${state.selectedCount} of ${state.values.length} selected`;
    }
    
    render(): JSX.Element {
        const state = this.props.state;
        return (<FacetValuesList component="div" disablePadding>

            <FacetValueListItem key={state.fieldName} dense disableGutters>
                <Checkbox edge="start" disableRipple
                    disabled={this.props.inProgress}
                    checked={state.allSelected}
                    onChange={(evt) => state.allSelected = evt.target.checked}
                />
                <ListItemText primary="[ALL]" />
            </FacetValueListItem>

            {state.values.map(facetValue => {
                return (

                    <FacetValueListItem key={facetValue.value} dense disableGutters>
                        <Checkbox edge="start" disableRipple
                            disabled={this.props.inProgress}
                            checked={facetValue.isSelected}
                            onChange={(evt) => facetValue.isSelected = evt.target.checked}
                        />
                        <ListItemText primary={`${facetValue.value} (${facetValue.count})`} />
                    </FacetValueListItem>

                );
            })}

        </FacetValuesList>);
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