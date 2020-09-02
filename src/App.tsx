import React from 'react';

export default class App extends React.Component {

    render(): JSX.Element {

        const uri = `${process.env.REACT_APP_BACKEND_BASE_URI}/HttpTest`;

        return (<button onClick={() => {
            fetch(uri)
                .then(response => response.text())
                .then(text => alert(text))

        }}>
            Press me to call {uri}
        </button>);
    }
}
