import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { TextField } from '@material-ui/core';

import { DateFacetState } from '../states/DateFacetState';

// An id of the filter summary chip for this facet. Need to handle blur events from it separately.
export const FilterSummaryDateFacetChipId = 'FilterSummaryDateFacetChipId';

// Renders facet for a Date field
@observer
export class DateFacet extends React.Component<{ state: DateFacetState, inProgress: boolean }> {

    static getHintText(state: DateFacetState): string {
        return `from ${state.from.toLocaleDateString()} to ${state.till.toLocaleDateString()}`;
    }
    
    render(): JSX.Element {
        const state = this.props.state;

        return (<>
            <DateTextField type="date"
                label="From"
                value={this.formatDate(state.currentFrom)}
                onChange={(evt) => { state.currentFrom = this.getDateValue(evt); }}
                onBlur={(evt) => this.handleBlur(evt)}
                onKeyPress={(evt) => this.handleKeyPress(evt)}
            />

            <DateTextField type="date"
                label="Till"
                value={this.formatDate(state.currentTill)}
                onChange={(evt) => { state.currentTill = this.getDateValue(evt); }}                
                onBlur={(evt) => this.handleBlur(evt)}
                onKeyPress={(evt) => this.handleKeyPress(evt)}
            />            
        </>);
    }

    private formatDate(dt: Date) {
        return dt.toJSON().slice(0, 10);
    }

    private getDateValue(evt: any): Date {

        var dt = new Date(evt.target.value.slice(0, 10));

        // If invalid date entered, then setting it to current date
        if (isNaN(dt.valueOf())) {
            dt = new Date();
        }

        return dt;
    }

    private handleBlur(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {

        // Skipping this event, if user jumped from date textbox straight to the corresponding chip on FilterSummaryBox
        if (!!event.relatedTarget && (event.relatedTarget as any).id === FilterSummaryDateFacetChipId) {
            return;
        }

        this.props.state.apply();
    }    

    private handleKeyPress(event: React.KeyboardEvent<HTMLDivElement>) {

        if (event.key === 'Enter') {
            // Otherwise the event will bubble up and the form will be submitted
            event.preventDefault();
            this.props.state.apply();
        }
    }    
}

const DateTextField: typeof TextField = styled(TextField)({
    marginBottom: 10,
    marginLeft: 50
});
