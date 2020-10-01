import React from 'react';
import styled from 'styled-components';

import { Table, TableBody, TableRow, TableCell } from '@material-ui/core';

import { DetailsDialogState } from '../states/DetailsDialogState';

// Displays document's metadata
export class MetadataViewer extends React.Component<{ state: DetailsDialogState }> {

    render(): JSX.Element {
        const state = this.props.state;

        return state.details && (
            <OverflowDiv>
                <Table>
                    <TableBody>
                        {Object.keys(state.details).map(fieldName => {
                            return (
                                <TableRow key={fieldName}>
                                    <FieldNameCell>{fieldName}</FieldNameCell>
                                    <FieldValueCell>{JSON.stringify(state.details[fieldName])}</FieldValueCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </OverflowDiv>
        );
    }
}

const OverflowDiv = styled.div({
    height: '100%',
    overflow: 'auto'
})

const FieldNameCell: typeof TableCell = styled(TableCell)({
    width: 200
})

const FieldValueCell: typeof TableCell = styled(TableCell)({
    overflowWrap: 'anywhere'
})