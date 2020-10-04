import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import {
    Chip, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    LinearProgress, Paper, Tabs, Tab
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

import { DetailsDialogMap, DetailsDialogMapHeight } from './DetailsDialogMap';
import { TranscriptViewer } from './TranscriptViewer';
import { MetadataViewer } from './MetadataViewer';

import { DetailsDialogState, DetailsTabEnum } from '../states/DetailsDialogState';

// Showing document details in a dialog
@observer
export class DetailsDialog extends React.Component<{ state: DetailsDialogState, hideMe: () => void, azureMapSubscriptionKey: string }> {

    render(): JSX.Element {

        const state = this.props.state;

        return (
            <Dialog
                open={true}
                onClose={() => this.props.hideMe()}
                fullWidth={true}
                maxWidth="xl"
            >
                <DetailsDialogTitle>
                    {state.name}

                    <CloseButton onClick={() => this.props.hideMe()}>
                        <CloseIcon/>
                    </CloseButton>

                </DetailsDialogTitle>

                <DialogContent>

                    {!!state.errorMessage && (
                        <ErrorChip color="secondary" label={state.errorMessage} onDelete={state.HideError} />
                    )}

                    <Tabs value={state.selectedTab}
                        onChange={(ev: React.ChangeEvent<{}>, val: DetailsTabEnum) => state.selectedTab = val}
                    >
                        <Tab label="Transcript"  />
                        <Tab label="Metadata" />
                        {!!state.coordinates && (<Tab label="Map" />)}
                    </Tabs>

                    <DetailsPaper>
                    
                        {state.selectedTab === DetailsTabEnum.Transcript && !state.inProgress && 
                            (<TranscriptViewer state={state}/>)
                        }

                        {state.selectedTab === DetailsTabEnum.Metadata && !state.inProgress &&
                            (<MetadataViewer state={state}/>)
                        }
                        
                        {state.selectedTab === DetailsTabEnum.Map && !state.inProgress &&
                            (<DetailsDialogMap name={state.name} coordinates={state.coordinates} azureMapSubscriptionKey={this.props.azureMapSubscriptionKey} />)
                        }

                    </DetailsPaper>

                    {!!state.inProgress && (<LinearProgress />)}
                    
                </DialogContent>

                <DetailsDialogActions/>

            </Dialog>
        );
    }
}

const DetailsDialogActions: typeof DialogActions = styled(DialogActions)({
    padding: '20px !important'
})

const DetailsPaper: typeof Paper = styled(Paper)({
    padding: 10,
    height: DetailsDialogMapHeight,
    overflow: 'hidden'
})

const CloseButton: typeof Button = styled(Button)({
    float: 'right'
})

const DetailsDialogTitle: typeof DialogTitle = styled(DialogTitle)({
    paddingBottom: '0px !important'
})

const ErrorChip: typeof Chip = styled(Chip)({
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20
})