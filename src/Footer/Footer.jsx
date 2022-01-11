import React from 'react';
import axios from 'axios'
import Configuration from '../Utils/config';

export default class Footer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            version: '0.0.0'
        }
    }

    componentDidMount() {
        axios.get(Configuration().apiUrl + 'api/login/version/')
            .then(response => {
                this.setState({
                    version: response.data,
                })
            })
            .catch((error) => {
            });
    }

    render() {
        const logoURL = process.env.PUBLIC_URL + "/app-assets/images/logo/KeycentrixWebLogo.png";
        return (
            <footer className="navbar footer navbar-fixed-bottom footer-static footer-light navbar-border">
                <p className="clearfix blue-grey lighten-2 text-sm-center mb-0 px-2">
                    <span className="float-md-left d-block d-md-inline-block">{this.state.version} Copyright &copy; {new Date().getFullYear()} - Keycentrix, LLC.</span>
                    <span className="float-md-right d-block d-md-inline-blockd-none d-lg-block"><img src={logoURL} height="20px;" alt="logo" /></span>
                </p>
            </footer>
        );
    }
}