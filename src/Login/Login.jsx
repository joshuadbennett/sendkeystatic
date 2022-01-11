import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import decode from 'jwt-decode';
import Configuration from '../Utils/config';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            errorOccurred: false,
            errorMessage: '',
            clientName : Configuration().clientName
        }
        this.handleCloseError = this.handleCloseError.bind(this);
    }

    componentDidMount() {
        if (localStorage.token) {
            var decoded = decode(localStorage.token);
            if (this.GetTimeInEpochFormat() < decoded.exp)
            {
                this.props.history.push("/Layout/Dashboard");
            }
        }
    }

    GetTimeInEpochFormat() {
        return Math.floor(Date.now() / 1000)
    }

    handleClick(event) {
        event.preventDefault();
        var apiBaseUrl = Configuration().apiUrl;
        
        var payload = {
            "Username": this.state.username,
            "Password": this.state.password
        }

        let that = this;
        axios.post(apiBaseUrl + 'api/Login', payload)
            .then(function (response) {
                if (response.status === 401) {
                    that.handleError(response.statusText);
                }
                else if (response.status === 200) {
                    //console.log("Login successful");
                    that.handleSuccess(response.data);
                }
                else {
                    console.log("Username does not exist.");
                    that.handleError("Username does not exist.");
                }
            })
            .catch(function (error) {
                var errorMessage = "Request Error";
                if (error != null) {
                    console.log(error.message);
                    console.log(error.response);
                    if (error.message === "Network Error") {
                        errorMessage = "Network unavailable. Check connectivity and configuration.";
                    } else if (error.response != null) {
                        errorMessage = error.response.statusText;
                        if (401 === error.response.status) {
                            errorMessage = "Unauthorized";
                        }
                    }
                }
                that.handleError(errorMessage);
                console.log(error);
            });
    }

    handleSuccess(value) {
        SetAuthorizationToken(value);
        //localStorage.setItem('token', value);
        this.props.history.push("/Layout/Dashboard");
        window.location.reload();
        //window.location.href = '/';
    }

    handleUsername(value) {
        this.setState({
            username: value
        });
    }

    handleError(value) {
        this.setState({
            errorOccurred: true,
            errorMessage: value
        });
    }

    handleCloseError(event) {
        this.setState({
            errorOccurred: false
        });
    }

    handlePassword(value) {
        this.setState({
            password: value
        });
    }

    render() {
        const logoURL = process.env.PUBLIC_URL + "/app-assets/images/logo/logo_large.png";
        const logoFullURL = process.env.PUBLIC_URL + "/app-assets/images/logo/SendKeyFull.png";
        return (
            <div>
                <section>
                    <div className="app-content content container-fluid">
                        <div className="content-wrapper">
                            <div className="content-body"><section className="flexbox-container">
                                <div className="col-md-4 offset-md-3 col-xs-10 offset-xs-1  box-shadow-2 p-0">
                                    <div className="card border-grey border-lighten-3 m-0">
                                        <div className="card-header no-border pb-0">
                                            <div className="card-title text-xs-center">
                                                {this.state.errorOccurred && <div className="alert alert-danger alert-dismissible fade in mb-2" role="alert">
                                                    <button type="button" className="close" onClick={this.handleCloseError} aria-label="Close">
                                                        <span aria-hidden="true" >&times;</span>
                                                    </button>
                                                    <strong>{this.state.errorMessage}</strong>
                                                </div>}
                                                <img alt="Sendkey logo" src={logoURL} className="brand-logo" />
                                                <br /><br />
                                                <img alt="Sendkey logo" src={logoFullURL} className="brand-logo" />
                                            </div>
                                            <h6 className="card-subtitle line-on-side text-muted text-xs-center font-small-3 pt-2"><span>{this.state.clientName}</span></h6>
                                        </div>
                                        <div className="card-body collapse in">
                                            <div className="card-block">
                                                <form className="loginForm" onSubmit={(event) => { this.handleClick(event); } }>
                                                <div className="form-horizontal form-simple" action="Login">
                                                    <fieldset className="form-group position-relative has-icon-left mb-0">
                                                            <input type="text" className="form-control form-control-accentblue form-control-lg input-lg" id="user-name" placeholder="Your Username" required data-validation-required-message="Please enter your username." value={this.state.username} onChange={(e) => this.handleUsername(e.target.value)} />
                                                        <div className="form-control-position">
                                                            <i className="ft-user" />
                                                        </div>
                                                    </fieldset>
                                                    <br />
                                                    <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="password" className="form-control form-control-accentblue form-control-lg input-lg" id="user-password" placeholder="Enter Password" data-validation-required-message="Please enter valid passwords." required value={this.state.password} onChange={(e) => this.handlePassword(e.target.value)} />
                                                        <div className="form-control-position">
                                                            <i className="fa fa-key" />
                                                        </div>
                                                    </fieldset>
                                                    <fieldset className="form-group row">
                                                                {/*<div className="col-md-6 col-xs-12 text-xs-center text-md-left">
                                                            <fieldset>
                                                                <input type="checkbox" id="remember-me" className="chk-remember" /> &nbsp;
                                                                <label htmlFor="remember-me"> Remember Me</label>
                                                            </fieldset>
                                                        </div>*/}
                                                                <div className="col-md-6 col-xs-12 text-xs-center text-md-left"><Link to="ForgotPassword" className="card-link text-accentblue">Forgot Password?</Link></div>
                                                    </fieldset>
                                                    <button type="submit" className="btn btn-accentblue btn-lg btn-block" onClick={(event) => this.handleClick(event)} ><i className="ft-unlock" /> Login</button>
                                                </div>
                                              </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}


