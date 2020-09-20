import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Collapse, Checkbox, List, ListItem, ListItemText, Radio } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { FacetsState } from '../states/FacetsState';

const FacetList = styled(List)({
    marginTop: '32px !important'
})

const FacetListItem = styled(ListItem)({
    paddingLeft: '36px !important',
})

const FacetValueListItem = styled(ListItem)({
    paddingLeft: '46px !important',
})

const FacetValuesList = styled(List)({
    maxHeight: 340,
    overflowY: 'auto !important',
    marginRight: '18px !important'
})

const RadioSpan = styled.span({
    float: 'right'    
})

const AndOrRadio = styled(Radio)({
    padding: '0px !important'
})

// Facets sidebar on the left
@observer
export class Facets extends React.Component<{ state: FacetsState, inProgress: boolean }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (
            <FacetList component="nav">

                {state.facets.map(facet => { return (<div key={facet.displayName}>

                    <FacetListItem disableRipple={true} button onClick={() => state.toggleExpand(facet.fieldName)}>
                        <ListItemText
                            primary={facet.displayName}
                            secondary={facet.allSelected ? `All ${facet.values.length} selected` : `${facet.selectedCount} of ${facet.values.length} selected`}
                        />
                        {!!facet.isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </FacetListItem>

                    <Collapse in={facet.isExpanded && !!facet.values.length} timeout={200} unmountOnExit>
                        <FacetValuesList component="div" disablePadding>

                            <FacetValueListItem key={facet.fieldName} dense disableGutters>
                                {facet.isArrayField ? (
                                    <Radio edge="start" disableRipple
                                        disabled={this.props.inProgress}
                                        checked={facet.allSelected}
                                        onChange={(evt) => facet.allSelected = evt.target.checked}
                                    />
                                ): (
                                    <Checkbox edge="start" disableRipple
                                        disabled={this.props.inProgress}
                                        checked={facet.allSelected}
                                        onChange={(evt) => facet.allSelected = evt.target.checked}
                                    />
                                )}
                                <ListItemText primary="[ALL]" />
                            </FacetValueListItem>

                            {facet.isArrayField && (
                                <FacetValueListItem key={facet.fieldName + "-or-and"} dense disableGutters>
                                    <Radio edge="start" disableRipple
                                        disabled={this.props.inProgress || facet.allSelected}
                                        checked={!facet.allSelected && !facet.useAndOperator}
                                        onChange={(evt) => facet.useAndOperator = false}
                                    />
                                    <ListItemText primary="[ANY OF]" />

                                    <Radio edge="start" disableRipple
                                        disabled={this.props.inProgress || facet.allSelected}
                                        checked={!facet.allSelected && facet.useAndOperator}
                                        onChange={(evt) => facet.useAndOperator = true}
                                    />
                                    <ListItemText primary="[ALL OF]" />
                                </FacetValueListItem>
                            )}

                            {facet.values.map(facetValue => { return (

                                <FacetValueListItem key={facetValue.value} dense disableGutters>
                                    <Checkbox edge="start" disableRipple
                                        disabled={this.props.inProgress}
                                        checked={facetValue.isSelected}
                                        onChange={(evt) => facetValue.isSelected = evt.target.checked}
                                    />
                                    <ListItemText primary={`${facetValue.value} (${facetValue.count})`} />
                                </FacetValueListItem>
                                
                            );})}

                        </FacetValuesList>
                    </Collapse>
                    
                </div>); })}
                
            </FacetList>
        );
    }
}
