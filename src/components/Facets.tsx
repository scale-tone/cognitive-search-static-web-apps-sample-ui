import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Collapse, List, ListItem, ListItemText } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';

import { BooleanFacet } from './BooleanFacet';
import { NumericFacet } from './NumericFacet';
import { DateFacet } from './DateFacet';
import { StringFacet } from './StringFacet';
import { StringCollectionFacet } from './StringCollectionFacet';

import { FacetsState } from '../states/FacetsState';
import { FacetTypeEnum } from '../states/FacetState';
import { StringFacetState } from '../states/StringFacetState';
import { StringCollectionFacetState } from '../states/StringCollectionFacetState';
import { NumericFacetState } from '../states/NumericFacetState';
import { BooleanFacetState } from '../states/BooleanFacetState';
import { DateFacetState } from '../states/DateFacetState';

// Facets sidebar on the left
@observer
export class Facets extends React.Component<{ state: FacetsState, inProgress: boolean }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (<FacetList component="nav">

            {state.facets.map(facetState => {

                var facetComponent: JSX.Element = null;
                switch (facetState.facetType) {
                    case FacetTypeEnum.BooleanFacet:
                        facetComponent = (<BooleanFacet state={facetState.state as BooleanFacetState} inProgress={this.props.inProgress} />);
                    break;
                    case FacetTypeEnum.NumericFacet:
                        facetComponent = (<NumericFacet state={facetState.state as NumericFacetState} inProgress={this.props.inProgress} />);
                    break;
                    case FacetTypeEnum.DateFacet:
                        facetComponent = (<DateFacet state={facetState.state as DateFacetState} inProgress={this.props.inProgress} />);
                    break;
                    case FacetTypeEnum.StringFacet:
                        facetComponent = (<StringFacet state={facetState.state as StringFacetState} inProgress={this.props.inProgress} />);
                    break;
                    case FacetTypeEnum.StringCollectionFacet:
                        facetComponent = (<StringCollectionFacet state={facetState.state as StringCollectionFacetState} inProgress={this.props.inProgress} />);
                    break;
                }

                // Getting reference to a proper getHintText method in this a bit unusual and not very strongly typed way
                const getHintTextFunc = facetComponent?.type.getHintText;

                return (<div key={facetState.displayName}>
                
                    <FacetListItem disableRipple={true} button onClick={() => state.toggleExpand(facetState.fieldName)}>
                        <ListItemText
                            primary={facetState.displayName}
                            secondary={getHintTextFunc ? getHintTextFunc(facetState.state) : ''}
                        />
                        {!!facetState.isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </FacetListItem>

                    <Collapse in={facetState.isExpanded} timeout={200} unmountOnExit>
                        {facetComponent}
                    </Collapse>
                    
                </div>);
            })}
                
        </FacetList>);
    }
}

const FacetList: typeof List = styled(List)({
    marginTop: '32px !important'
})

const FacetListItem: typeof ListItem = styled(ListItem)({
    paddingLeft: '36px !important',
})