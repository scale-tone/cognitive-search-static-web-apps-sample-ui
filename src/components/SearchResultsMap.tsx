import * as React from 'react';
import { autorun } from 'mobx'
import { observer } from 'mobx-react';

import * as atlas from 'azure-maps-control';

import styled from 'styled-components';

import { Chip, LinearProgress, Typography } from '@material-ui/core';

import { MapResultsState } from '../states/MapResultsState';
import { SimpleScaleBarControl } from './SimpleScaleBarControl';

// I have no idea, why this CSS needs to be imported explicitly
import '../atlas.css';

const MapDiv = styled.div({

    background: '#bebebe',
    height: '350px'

})

const CountersDiv = styled.div({
    height: 40
})

const TopLinearProgress = styled(LinearProgress)({
    top: 20
})

const CountersTypography = styled(Typography)({
    float: 'right',
    width: 'auto',
    margin: '10px !important'
})

const ErrorChip = styled(Chip)({
    position: 'absolute',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 50,
    marginLeft: 50,
    marginRight: 50,
})

// This object is produced by a dedicated Functions Proxy and contains parameters 
// configured on the backend side. Backend produces it in form of a script, which is included into index.html.
// Here we just assume that the object exists.
declare const ServerSideConfig: { AzureMapSubscriptionKey: string };

// Azure Maps component for showing search results on
@observer
export class SearchResultsMap extends React.Component<{ state: MapResultsState }> { 

    componentDidMount() {

        const state = this.props.state;

        var map = new atlas.Map('MapDiv', {

            style: "road_shaded_relief",
            language: 'en-US',

            authOptions: {
                authType: atlas.AuthenticationType.subscriptionKey,
                subscriptionKey: ServerSideConfig.AzureMapSubscriptionKey
            }
        });

        map.events.add('ready', () => {

            //Add a metric scale bar to the map.
            map.controls.add(
                [
                    new atlas.control.ZoomControl()
                ],
                { position: atlas.ControlPosition.BottomRight }
            );

            map.controls.add(
                [
                    new SimpleScaleBarControl({ units: 'metric' }),
                ],
                { position: atlas.ControlPosition.TopRight }
            );


            map.sources.add(state.mapDataSource);

            const layer = new atlas.layer.SymbolLayer(state.mapDataSource, null,
                {
                    textOptions: {
                        // Corresponds to MapSearchResult.name field
                        textField: ['get', 'name'],
                        offset: [0, 1.2]
                    }
                }
            );
            map.layers.add(layer);

            map.events.add('click', layer, (e: atlas.MapMouseEvent) => {

                if (!e.shapes || e.shapes.length <= 0) {
                    return;
                }

                const shape = e.shapes[0] as atlas.Shape;
                if (shape.getType() !== 'Point') {
                    return;
                }

                const properties = shape.getProperties();
                state.showDetails(properties);
            });
        });

        // Also adding an observer, that reacts on any change in state.mapBounds. This will zoom the map to that bounding box.
        autorun(() => {
            map.setCamera({ bounds: state.mapBounds, padding: 40 });
        });
    }

    render(): JSX.Element {

        const state = this.props.state;

        return (<>

            <CountersDiv>
                <CountersTypography variant="caption" >
                    {state.resultsShown} results shown on map
                </CountersTypography>

                {!!state.inProgress && (<TopLinearProgress />)}
            </CountersDiv>

            {!!state.errorMessage && (
                <ErrorChip variant="error" onDelete={state.HideError}>{state.errorMessage}</ErrorChip>
            )}

            <MapDiv id="MapDiv" />
        </>);
    }
}
