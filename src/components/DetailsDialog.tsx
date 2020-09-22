import React from 'react';
import { observer } from 'mobx-react';
import styled from 'styled-components';

import {
    Chip, Button, Dialog, DialogActions, DialogContent, DialogTitle,
    LinearProgress, Paper, Tabs, Tab, Typography
} from '@material-ui/core';

import CloseIcon from '@material-ui/icons/Close';

import { DetailsDialogMap, DetailsDialogMapHeight } from './DetailsDialogMap';
import { TranscriptViewer } from './TranscriptViewer';
import { MetadataViewer } from './MetadataViewer';

import { DetailsDialogState, DetailsTabEnum } from '../states/DetailsDialogState';

// Showing document details in a dialog
@observer
export class DetailsDialog extends React.Component<{ state: DetailsDialogState, hideMe: () => void }> {

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

                    <CloseButton variant="ghost_icon" onClick={() => this.props.hideMe()}>
                        <CloseIcon/>
                    </CloseButton>

                </DetailsDialogTitle>

                <DialogContent>

                    {!!state.errorMessage && (
                        <ErrorChip variant="error" onDelete={state.HideError}>{state.errorMessage}</ErrorChip>
                    )}

                    <Tabs value={state.selectedTab}
                        onChange={(ev: React.ChangeEvent<{}>, val: DetailsTabEnum) => state.selectedTab = val}
                    >
                        <Tab label="Transcript"  />
                        <Tab label="Metadata" />
                        <Tab label="Map" />
                    </Tabs>

                    <DetailsPaper>
                    
                        {state.selectedTab === DetailsTabEnum.Transcript && !state.inProgress && 
                            (<TranscriptViewer state={state}/>)
                        }

                        {state.selectedTab === DetailsTabEnum.Metadata && !state.inProgress &&
                            (<MetadataViewer state={state}/>)
                        }
                        
                        {state.selectedTab === DetailsTabEnum.Map && !state.inProgress && (<>

                            {!!state.coordinates ? (
                                <DetailsDialogMap name={state.name} coordinates={state.coordinates} />
                            ) : (
                                <MessageTypography variant="h1" >Document has no geo coordinates</MessageTypography>
                            )}

                        </>)}

                    </DetailsPaper>

                    {!!state.inProgress && (<LinearProgress />)}
                    
                </DialogContent>

                <DetailsDialogActions>
                </DetailsDialogActions>

            </Dialog>
        );
    }
}

const DetailsDialogActions = styled(DialogActions)({
    padding: '20px !important'
})

const DetailsPaper = styled(Paper)({
    padding: 10,
    height: DetailsDialogMapHeight,
    overflow: 'hidden'
})

const CloseButton = styled(Button)({
    float: 'right'
})

const DetailsDialogTitle = styled(DialogTitle)({
    paddingBottom: '0px !important'
})

const MessageTypography = styled(Typography)({
    textAlign: 'center',
    marginTop: 50
})

const ErrorChip = styled(Chip)({
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20
})