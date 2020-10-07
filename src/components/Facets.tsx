import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Collapse, Checkbox, List, ListItem, ListItemText, Radio, Slider } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { FacetsState } from '../states/FacetsState';
import { FacetState } from '../states/FacetState';

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
                            secondary={this.getHintText(facet)}
                        />
                        {!!facet.isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </FacetListItem>

                    <Collapse in={facet.isExpanded} timeout={200} unmountOnExit>

                        {!!facet.numericValues && this.renderSlider(facet)}
                        {!!facet.values.length && this.renderFacetValues(facet)}

                    </Collapse>
                    
                </div>); })}
                
            </FacetList>
        );
    }

    private getHintText(facet: FacetState): string {

        if (!!facet.numericValues) {
            return `From ${facet.numericRange[0]} to ${facet.numericRange[1]}`;
        }

        return facet.allSelected ? `All ${facet.values.length} selected` : `${facet.selectedCount} of ${facet.values.length} selected`;
    }

    private renderSlider(facet: FacetState): JSX.Element {

        return (<SliderDiv>
            <Slider
                disabled={this.props.inProgress}
                value={facet.numericRange}
                marks={facet.numericValues.map(v => { return { value: v } })}
                min={Math.min(...facet.numericValues)} max={Math.max(...facet.numericValues)}
                onChange={(evt, newValue) => {
                    facet.numericRange = newValue as number[];
                }}
                onChangeCommitted={(evt, newValue) => {
                    facet.numericRange = newValue as number[];
                    facet.apply()
                }}
                step={null} valueLabelDisplay="on"
            />
        </SliderDiv>);
    }

    private renderFacetValues(facet: FacetState): JSX.Element {
        return (
            <FacetValuesList component="div" disablePadding>

                <FacetValueListItem key={facet.fieldName} dense disableGutters>
                    {facet.isArrayField ? (
                        <Radio edge="start" disableRipple
                            disabled={this.props.inProgress}
                            checked={facet.allSelected}
                            onChange={(evt) => facet.allSelected = evt.target.checked}
                        />
                    ) : (
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

                {facet.values.map(facetValue => {
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

            </FacetValuesList>
        );
    }
}

const FacetList: typeof List = styled(List)({
    marginTop: '32px !important'
})

const FacetListItem: typeof ListItem = styled(ListItem)({
    paddingLeft: '36px !important',
})

const FacetValueListItem: typeof ListItem = styled(ListItem)({
    paddingLeft: '46px !important',
});

const FacetValuesList: typeof List = styled(List)({
    maxHeight: 340,
    overflowY: 'auto !important',
    marginRight: '18px !important'
})

const SliderDiv = styled.div({
    paddingTop: 40,
    paddingLeft: 46,
    paddingRight: 30
});
