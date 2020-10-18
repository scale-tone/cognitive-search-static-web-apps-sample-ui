import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Chip,  Typography } from '@material-ui/core';

import { FacetsState } from '../states/FacetsState';
import { FacetTypeEnum } from '../states/FacetState';
import { StringFacetState } from '../states/StringFacetState';
import { StringCollectionFacetState } from '../states/StringCollectionFacetState';
import { NumericFacetState } from '../states/NumericFacetState';
import { BooleanFacetState } from '../states/BooleanFacetState';
import { DateFacetState } from '../states/DateFacetState';

import { FilterSummaryDateFacetChipId } from './DateFacet';

// Facet filter visualization on the toolbar
@observer
export class FilterSummaryBox extends React.Component<{ state: FacetsState, inProgress: boolean }> {

    render(): JSX.Element {

        const state = this.props.state;
        const appliedFacets = state.facets.filter(f => f.state?.isApplied);

        return (<div style={{ paddingBottom: !!appliedFacets.length ? 10 : 0}} >
            
            {appliedFacets.map(facet => {
                
                const facetType = facet.state.facetType;
                const booleanFacet = facet.state as BooleanFacetState;
                const numericFacet = facet.state as NumericFacetState;
                const dateFacet = facet.state as DateFacetState;
                const stringFacet = facet.state as StringFacetState;
                const stringCollectionFacet = facet.state as StringCollectionFacetState;
                
                return (
                    <FacetChipsDiv key={facet.displayName}>

                        <FacetNameTypography variant="subtitle2">{facet.displayName}:</FacetNameTypography>

                        {facetType === FacetTypeEnum.BooleanFacet && (
                            <Chip
                                label={booleanFacet.value ? 'TRUE' : 'FALSE'}
                                size="small"
                                onDelete={() => booleanFacet.reset()}
                                disabled={this.props.inProgress}
                            />
                        )}
                        
                        {facetType === FacetTypeEnum.NumericFacet && (
                            <Chip
                                label={`from ${numericFacet.range[0]} to ${numericFacet.range[1]}`}
                                size="small"
                                onDelete={() => numericFacet.reset()}
                                disabled={this.props.inProgress}
                            />
                        )}

                        {facetType === FacetTypeEnum.DateFacet && (
                            <Chip
                                id={FilterSummaryDateFacetChipId}
                                label={`from ${dateFacet.from.toLocaleDateString()} to ${dateFacet.till.toLocaleDateString()}`}
                                size="small"
                                onDelete={() => dateFacet.reset()}
                                disabled={this.props.inProgress}
                            />
                        )}
                        
                        {facetType === FacetTypeEnum.StringFacet && stringFacet.values.filter(v => v.isSelected).map((facetValue, i) => {
                            return (<>

                                {i > 0 && (<OperatorTypography variant="body1">
                                    OR
                                </OperatorTypography>)}

                                <Chip
                                    key={facetValue.value}
                                    label={facetValue.value}
                                    size="small"
                                    onDelete={() => facetValue.isSelected = false}
                                    disabled={this.props.inProgress}
                                />
                            </>)
                        })}
                        
                        {facetType === FacetTypeEnum.StringCollectionFacet && stringCollectionFacet.values.filter(v => v.isSelected).map((facetValue, i) => {
                            return (<>

                                {i > 0 && (<OperatorTypography variant="body1">
                                    {stringCollectionFacet.useAndOperator ? 'AND' : 'OR'}
                                </OperatorTypography>)}

                                <Chip
                                    key={facetValue.value}
                                    label={facetValue.value}
                                    size="small"
                                    onDelete={() => facetValue.isSelected = false}
                                    disabled={this.props.inProgress}
                                />
                            </>)
                        })}

                    </FacetChipsDiv>
                )
            })}                
        </div>);
    }
}

const FacetChipsDiv = styled.div({
    paddingLeft: 40,
    paddingBottom: 10,
    display: 'flex',
    flexWrap: 'wrap'
})

const FacetNameTypography: typeof Typography = styled(Typography)({
    marginRight: '10px !important',
    fontWeight: 'bold'
})

const OperatorTypography: typeof Typography = styled(Typography)({
    marginLeft: '10px !important',
    marginRight: '10px !important',
    marginBottom: '3px !important',
})
