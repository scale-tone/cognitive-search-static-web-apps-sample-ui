import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import { Slider } from '@material-ui/core';

import { NumericFacetState } from '../states/NumericFacetState';

// Renders facet for a numeric field
@observer
export class NumericFacet extends React.Component<{ state: NumericFacetState, inProgress: boolean }> {

    static getHintText(state: NumericFacetState): string {
        return `From ${state.range[0]} to ${state.range[1]}`;
    }
    
    render(): JSX.Element {
        const state = this.props.state;
        var marks = null, step = null;

        // If the number of distinct values is too large, the slider's look becomes messy.
        // So we have to switch to a fixed step
        if (state.values.length > 200) {
            step = (state.maxValue - state.minValue) / 100;
        } else {
            marks = state.values.map(v => { return { value: v } });
        }

        return (<SliderDiv>
            <Slider
                disabled={this.props.inProgress}
                value={state.range}
                marks={marks}
                step={step}
                min={state.minValue}
                max={state.maxValue}
                onChange={(evt, newValue) => {
                    state.range = newValue as number[];
                }}
                onChangeCommitted={(evt, newValue) => {
                    state.range = newValue as number[];
                    state.apply()
                }}
                valueLabelDisplay="on"
            />
        </SliderDiv>);
    }
}

const SliderDiv = styled.div({
    paddingTop: 40,
    paddingLeft: 46,
    paddingRight: 30
});
