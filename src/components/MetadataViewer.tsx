import React from 'react';
import styled from 'styled-components';

import {
    Table, TableBody, TableRow, TableCell, 
} from '@material-ui/core';

import { DetailsDialogState } from '../states/DetailsDialogState';

const OverflowDiv = styled.div({
    height: '100%',
    overflow: 'auto'
})

const FieldNameCell = styled(TableCell)({
    width: 200
})

const FieldValueCell = styled(TableCell)({
    overflowWrap: 'anywhere'
})

// Displays document's metadata
export class MetadataViewer extends React.Component<{ state: DetailsDialogState }> {

    render(): JSX.Element {
        const state = this.props.state;

        if (!state.details) {
            return null;
        }

        return (
            <OverflowDiv>
                <Table>
                    <TableBody>
                        <TableRow>
                            <FieldNameCell>Location</FieldNameCell>
                            <FieldValueCell>{JSON.stringify(state.details.Location?.coordinates)}</FieldValueCell>
                        </TableRow>
                        <TableRow>
                            <FieldNameCell>Some other field</FieldNameCell>
                            <FieldValueCell>Some other value</FieldValueCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </OverflowDiv>
        );
    }
}