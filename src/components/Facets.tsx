import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Collapse, Checkbox, List, ListItem, ListItemText, Radio, Slider } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { FacetsState } from '../states/FacetsState';
import { FacetState, FacetTypeEnum } from '../states/FacetState';
import { StringFacetState } from '../states/StringFacetState';
import { StringCollectionFacetState } from '../states/StringCollectionFacetState';
import { NumericFacetState } from '../states/NumericFacetState';
import { BooleanFacetState } from '../states/BooleanFacetState';

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

                        {facet.facetType === FacetTypeEnum.BooleanFacet && this.renderBooleanValues(facet.state as BooleanFacetState)}
                        {facet.facetType === FacetTypeEnum.NumericFacet && this.renderSlider(facet.state as NumericFacetState)}
                        {facet.facetType === FacetTypeEnum.StringFacet && this.renderStringValues(facet.state as StringFacetState)}
                        {facet.facetType === FacetTypeEnum.StringCollectionFacet && this.renderStringCollectionValues(facet.state as StringCollectionFacetState)}

                    </Collapse>
                    
                </div>); })}
                
            </FacetList>
        );
    }

    private getHintText(facet: FacetState): string {
        switch (facet.facetType) {

            case FacetTypeEnum.BooleanFacet:
                const booleanFacet = facet.state as BooleanFacetState;
                return booleanFacet.isApplied ? (booleanFacet.value ? 'true' : 'false' ) : 'any';
            case FacetTypeEnum.NumericFacet:
                const numericFacet = facet.state as NumericFacetState;
                return `From ${numericFacet.range[0]} to ${numericFacet.range[1]}`;
            case FacetTypeEnum.StringFacet:
            case FacetTypeEnum.StringCollectionFacet:
                const stringFacet = facet.state as StringFacetState | StringCollectionFacetState;
                return stringFacet.allSelected ? `All ${stringFacet.values.length} selected` : `${stringFacet.selectedCount} of ${stringFacet.values.length} selected`;
            default:
                return '';
        }
    }

    private renderSlider(facet: NumericFacetState): JSX.Element {

        return (<SliderDiv>
            <Slider
                disabled={this.props.inProgress}
                value={facet.range}
                marks={facet.values.map(v => { return { value: v } })}
                min={facet.minValue}
                max={facet.maxValue}
                onChange={(evt, newValue) => {
                    facet.range = newValue as number[];
                }}
                onChangeCommitted={(evt, newValue) => {
                    facet.range = newValue as number[];
                    facet.apply()
                }}
                step={null} valueLabelDisplay="on"
            />
        </SliderDiv>);
    }

    private renderStringValues(facet: StringFacetState): JSX.Element {
        return (
            <FacetValuesList component="div" disablePadding>

                <FacetValueListItem key={facet.fieldName} dense disableGutters>
                    <Checkbox edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={facet.allSelected}
                        onChange={(evt) => facet.allSelected = evt.target.checked}
                    />
                    <ListItemText primary="[ALL]" />
                </FacetValueListItem>

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

    private renderStringCollectionValues(facet: StringCollectionFacetState): JSX.Element {
        return (
            <FacetValuesList component="div" disablePadding>

                <FacetValueListItem key={facet.fieldName} dense disableGutters>
                        <Radio edge="start" disableRipple
                            disabled={this.props.inProgress}
                            checked={facet.allSelected}
                            onChange={(evt) => facet.allSelected = evt.target.checked}
                        />
                    <ListItemText primary="[ALL]" />
                </FacetValueListItem>

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

    private renderBooleanValues(facet: BooleanFacetState): JSX.Element {
        return (
            <FacetValuesList component="div" disablePadding>

                <FacetValueListItem dense disableGutters>
                    <Radio edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={!facet.isApplied}
                        onChange={(evt) => facet.value = null}
                    />
                    <ListItemText primary="[ANY]" />
                </FacetValueListItem>
                <FacetValueListItem dense disableGutters>
                    <Radio edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={facet.value === true}
                        onChange={(evt) => facet.value = true}
                    />
                    <ListItemText primary={`TRUE(${facet.trueCount})`} />
                </FacetValueListItem>
                <FacetValueListItem dense disableGutters>
                    <Radio edge="start" disableRipple
                        disabled={this.props.inProgress}
                        checked={facet.value === false}
                        onChange={(evt) => facet.value = false}
                    />
                    <ListItemText primary={`FALSE(${facet.falseCount})`} />
                </FacetValueListItem>

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
