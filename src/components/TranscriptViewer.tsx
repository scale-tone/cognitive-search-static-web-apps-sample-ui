import React from 'react';
import styled from 'styled-components';

import { List, ListItem, ListItemText } from '@material-ui/core';

import { DetailsDialogState } from '../states/DetailsDialogState';

const KeywordIdPrefix = 'keywordSpan';

// Shows document's raw text with some navigation supported
export class TranscriptViewer extends React.Component<{ state: DetailsDialogState }> {

    render(): JSX.Element { return (<>
        <FragmentsList>{this.getFragmentsMarkup()}</FragmentsList>
        <OverflowDiv><WrappedPre>{this.getTextMarkup()}</WrappedPre></OverflowDiv>
    </>);}

    private getTextMarkup(): (JSX.Element | string)[] {
        const state = this.props.state;

        // returning text with keywords highlighted
        var i = 0;
        return state.textFragments.map(fragment => {

            const text = state.getPieceOfText(fragment.text);

            if (!fragment.textBefore && !fragment.textAfter) {
                return text;
            }

            return (<HighlightedSpan id={`${KeywordIdPrefix}${i++}`}>{text}</HighlightedSpan>);
        });
    }

    private getFragmentsMarkup(): (JSX.Element | string)[] {
        const state = this.props.state;

        // Rendering keywords only
        const fragments = state.textFragments.filter(f => !!f.textBefore || !!f.textAfter);

        const resultMarkup: (JSX.Element | string)[] = [];
        var i = 0;
        while (i < fragments.length) {
            var fragment = fragments[i];

            const fragmentMarkup: (JSX.Element | string)[] = [];

            fragmentMarkup.push(state.getPieceOfText(fragment.textBefore));
            fragmentMarkup.push((
                <HighlightedSpan>{state.getPieceOfText(fragment.text)}</HighlightedSpan>
            ));

            // Also bringing the selected keyword (the first one in a chain) into view upon click
            const keywordSpanId = `${KeywordIdPrefix}${i}`;

            var concatenatedFragmentsCount = 0;
            var nextFragment = fragments[++i];
            // if next keyword fits into current fragment - keep concatenating fragments, but limiting this process to 5
            while (!!nextFragment && nextFragment.text.start < fragment.textAfter.stop && concatenatedFragmentsCount < 4) {

                fragmentMarkup.push(state.getPieceOfText({ start: fragment.text.stop, stop: nextFragment.text.start }));
                fragmentMarkup.push((
                    <HighlightedSpan>{state.getPieceOfText(nextFragment.text)}</HighlightedSpan>
                ));

                fragment = nextFragment;
                nextFragment = fragments[++i];
                concatenatedFragmentsCount++;
            }

            fragmentMarkup.push(state.getPieceOfText(fragment.textAfter));

            resultMarkup.push((
                <ListItem button onClick={() => document.getElementById(keywordSpanId).scrollIntoView(false)}>
                    <ListItemText secondary={fragmentMarkup} />
                </ListItem>
            ));
        }

        return resultMarkup;
    }
}

const OverflowDiv = styled.div({
    height: '100%',
    width: 'auto',
    overflow: 'auto'
})

const FragmentsList = styled(List)({
    float: 'right',
    width: 400,
    height: '100%',
    overflowY: 'auto',
    paddingLeft: '10px !important',
    overflowWrap: 'anywhere'
})

const HighlightedSpan = styled.span({
    background: 'bisque'
})

const WrappedPre = styled.pre({
    whiteSpace: 'pre-wrap'
})
