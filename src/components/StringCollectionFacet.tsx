import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Checkbox, List, ListItem, ListItemText, Radio } from '@material-ui/core';

import { StringCollectionFacetState } from '../states/StringCollectionFacetState';

// Renders facet for a string array field
@observer
export class StringCollectionFacet extends React.Component<{ state: StringCollectionFacetState, inProgress: boolean }> {

    static getHintText(state: StringCollectionFacetState): string {
        return state.allSelected ? `All ${state.values.length} selected` : `${state.selectedCount} of ${state.values.length} selected`;
    }
    
    render(): JSX.Element {
        const state = this.props.state;
        return (<FacetValuesList component="div" disablePadding>

            <FacetValueListItem key={state.fieldName} dense disableGutters>
                <Radio edge="start" disableRipple
                    disabled={this.props.inProgress}
                    checked={state.allSelected}
                    onChange={(evt) => state.allSelected = evt.target.checked}
                />
                <ListItemText primary="[ALL]" />
            </FacetValueListItem>

            <FacetValueListItem key={state.fieldName + "-or-and"} dense disableGutters>
                <Radio edge="start" disableRipple
                    disabled={this.props.inProgress || state.allSelected}
                    checked={!state.allSelected && !state.useAndOperator}
                    onChange={(evt) => state.useAndOperator = false}
                />
                <ListItemText primary="[ANY OF]" />

                <Radio edge="start" disableRipple
                    disabled={this.props.inProgress || state.allSelected}
                    checked={!state.allSelected && state.useAndOperator}
                    onChange={(evt) => state.useAndOperator = true}
                />
                <ListItemText primary="[ALL OF]" />
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