import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Chip,  Typography } from '@material-ui/core';

import { FacetsState } from '../states/FacetsState';

const FacetChipsDiv = styled.div({
    paddingLeft: 40,
    paddingBottom: 10,
    display: 'flex',
    flexWrap: 'wrap'
})

const FacetNameTypography = styled(Typography)({
    marginRight: '10px !important',
    fontWeight: 'bold'
})

const OperatorTypography = styled(Typography)({
    marginLeft: '10px !important',
    marginRight: '10px !important',
    marginBottom: '3px !important',
})

// Facet filter visualization
@observer
export class FilterBox extends React.Component<{ state: FacetsState, inProgress: boolean }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (
            <>

                {state.facets.filter(f => !f.allSelected).map(facet => {
                    return (
                        <FacetChipsDiv key={facet.displayName}>

                            <FacetNameTypography variant="subtitle2">{facet.displayName}:</FacetNameTypography>

                            {facet.values.filter(v => v.isSelected).map((facetValue, i) => {
                                return (<>

                                    {i > 0 && (<OperatorTypography variant="body1">
                                        {facet.useAndOperator ? 'AND' : 'OR'}
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
                
            </>
        );
    }
}