import React from 'react';
import { Link } from 'react-router-dom';
import Configuration from '../Utils/config';
import axios from 'axios'
import Validation from '../Components/Validation.jsx';

export default class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            showVerifyPin: false,
            userSecretKey: '',
            showResetPassword: false,
            password: '',
            confirmPassword: '',
            errorOccurred: false,
            errorMessage: '',
            EmailErrors: null,
            PasswordErrors: null,
            ConfirmPasswordErrors: null
        }
        this.validation = new Validation();
    }

    getEmailErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));        
        if (!this.validation.patternValid(value, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/, "")) errors.push("Must be an email address.");
        if (!this.validation.patternValid(value, /^\S*$/, "")) errors.push("Must not contain spaces.");
        return errors;
    }

    getPasswordErrors = (value) => {
        let errors = [];
        let minLength = 6, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.patternValid(value, /^(?=.*[A-Za-z])/, "")) errors.push("Must contain at least one alphabetical character.");
        if (!this.validation.patternValid(value, /^(?=.*[0-9])/, "")) errors.push("Must contain at least one numerical character.");
        // eslint-disable-next-line
        if (!this.validation.patternValid(value, /^(?=.*[!@#\$ %\^&\*\(\)_\-\+=\[\]\{\}\|\\:;"'<\,>\.\?/~`])/, "")) errors.push("Must contain at least one special character. (!@#$ %^&*()_-+=[]{}|\\:;\"'<,>.?~`)");
        return errors;
    }

    getConfirmPasswordErrors = (value, otherValue) => {
        let errors = [];
        if (!this.validation.stringEqualToValid(value, otherValue)) errors.push("Must match.");
        return errors;
    }

    getFormValid = (...args) => {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    handleChange = (e) => {
        let emailErrors = this.state.EmailErrors;
        let passwordErrors = this.state.PasswordErrors;
        let confirmPasswordErrors = this.state.ConfirmPasswordErrors;
        switch (e.target.name) {
            case "email":
                if (emailErrors != null) emailErrors = this.getEmailErrors(e.target.value);
                break;
            case "password":
                passwordErrors = this.getPasswordErrors(e.target.value, this.state.confirmPassword);
                confirmPasswordErrors = this.getConfirmPasswordErrors(this.state.confirmPassword, e.target.value);
                break;
            case "confirmPassword":
                passwordErrors = this.getPasswordErrors(this.state.password, e.target.value);
                confirmPasswordErrors = this.getConfirmPasswordErrors(e.target.value, this.state.password);
                break;
            default:
                break;
        }
        this.setState({
            [e.target.name]: e.target.value,
            EmailErrors: emailErrors,
            PasswordErrors: passwordErrors,
            ConfirmPasswordErrors: confirmPasswordErrors
        });
    }

    handleForgotPassword = (e) => {
        e.preventDefault();

        let emailErrors = this.getEmailErrors(this.state.email);
        if (emailErrors.length > 0) {
            this.setState({
                EmailErrors: emailErrors
            });
            return;
        }

        let apiBaseUrl = Configuration().apiUrl;
        let payload = {
            "Email": this.state.email
        }

        let that = this;
        axios.post(apiBaseUrl + 'api/Users/ForgotPassword', payload)
            .then((response) => {
                if (response.status === 401) {
                    that.handleError(response.statusText);
                }
                else if (response.status === 200) {
                    that.handleForgotPasswordSuccess();
                }
                else {
                    console.log("Username does not exist.");
                    that.handleError("Username does not exist.");
                }
            })
            .catch((error) => {
                console.log(error);
                if (error != null && error.response != null && (401 === error.response.status || 409 === error.response.status)) {
                    that.handleError(error.response.statusText);
                }
                console.log(error.response);
            });
    }

    handleSecretKey = (e) => {
        e.preventDefault();
        let apiBaseUrl = Configuration().apiUrl;
        let payload = {
            "Email": this.state.email,
            "PIN": this.state.userSecretKey
        }

        let that = this;
        axios.post(apiBaseUrl + 'api/Users/VerifyPIN', payload)
            .then((response) => {
                if (response.status === 401) {
                    that.handleError(response.statusText);
                }
                else if (response.status === 200) {
                    that.handlePinVerificationSuccess();
                }
                else {
                    console.log("Username does not exist.");
                    that.handleError("Username does not exist.");
                }
            })
            .catch((error) => {
                if (error != null && error.response != null && (401 === error.response.status || 409 === error.response.status)) {
                    that.handleError(error.response.statusText);
                }
                console.log(error.response);
            });
    }

    handleResetPassword = (e) => {
        e.preventDefault();
        let apiBaseUrl = Configuration().apiUrl;
        let payload = {
            "Email": this.state.email,
            "Password": this.state.password,
        }

        let that = this;
        axios.post(apiBaseUrl + 'api/Users/ResetPassword', payload)
            .then((response) => {
                if (response.status === 401) {
                    that.handleError(response.statusText);
                }
                else if (response.status === 200) {
                    that.handleResetSuccess(response);
                }
                else {
                    that.handleError("Username does not exist.");
                }
            })
            .catch((error) => {
                if (error != null && error.response != null && 401 === error.response.status) {
                    that.handleError(error.response.statusText);
                }
                console.log(error.response);
            });
    }

    handleForgotPasswordSuccess = () => {
        this.setState({
            showVerifyPin: true
        });
    }

    handleResetSuccess = (value) => {
        this.props.history.push("Login");
    }

    handlePinVerificationSuccess = () => {
        this.setState({
            showResetPassword: true
        });
    }

    handleUserSecretKey = (value) => {
        this.setState({
            userSecretKey: value
        });
    }

    handleError = (value) => {
        this.setState({
            errorOccurred: true,
            errorMessage: value
        });
    }

    handleCloseError = (event) => {
        this.setState({
            errorOccurred: false
        });
    }

    validate = (event) => {
        let passwordErrors = !this.state.PasswordErrors ? this.getPasswordErrors(this.state.password, this.state.confirmPassword) : this.state.PasswordErrors;
        let confirmPasswordErrors = !this.state.ConfirmPasswordErrors ? this.getConfirmPasswordErrors(this.state.confirmPassword, this.state.password) : this.state.ConfirmPasswordErrors;
        let formValid = this.getFormValid(passwordErrors, confirmPasswordErrors);
        if (formValid) {
            this.handleResetPassword(event);
        } else {
            this.setState({
                alertType: '',
                alertMessage: '',
                PasswordErrors: passwordErrors,
                ConfirmPasswordErrors: confirmPasswordErrors
            });
        }
    }

    render() {
        const logoURL = process.env.PUBLIC_URL + "/app-assets/images/logo/logo_large.png";
        const logoFullURL = process.env.PUBLIC_URL + "/app-assets/images/logo/SendKeyFull.png";
        let PasswordErrors = this.state.PasswordErrors;
        let ConfirmPasswordErrors = this.state.ConfirmPasswordErrors;
        return (
            <div className="app-content content container-fluid">
                <div className="content-wrapper">
                    <div className="content-body"><section className="flexbox-container">
                        <div className="col-md-4 offset-md-3 col-xs-10 offset-xs-1 box-shadow-2 p-0">
                            <div className="card border-grey border-lighten-3 m-0">
                                <div className="card-header no-border pb-0">
                                    <div className="card-title text-xs-center">
                                        {this.state.errorOccurred && <div className="alert alert-danger alert-dismissible fade in mb-2" role="alert">
                                            <button type="button" className="close" onClick={this.handleCloseError} aria-label="Close">
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                            <strong>{this.state.errorMessage}</strong>
                                        </div>}
                                        <img alt="Sendkey logo" src={logoURL} className="brand-logo" />
                                        <br /><br />
                                        <img alt="SendKey logo" src={logoFullURL} className="brand-logo" />
                                    </div>
                                    <h6 className="card-subtitle line-on-side text-muted text-xs-center font-small-3 pt-2">
                                        <span>Login Help</span>
                                    </h6>
                                </div>
                                {!this.state.showResetPassword ?
                                    (!this.state.showVerifyPin ?
                                        <div>
                                            <div className="card-body collapse in">
                                                <div className="card-block">
                                                    <p>Enter your email address, click Generate PIN, and we'll send you a verification code.</p>
                                                    <form className="form-horizontal">
                                                        <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="text" className="form-control form-control-lg input-lg" id="user-email" name="email" placeholder="Your Email Address" required value={this.state.email} onChange={this.handleChange} />
                                                            <div className="invalid-block">
                                                                {this.validation.getClass(this.state.EmailErrors) === " invalid" ?
                                                                    <ul className="invalid" role="alert">
                                                                        {this.state.EmailErrors.map(function (error, index) {
                                                                            return <li key={index}>{error}</li>;
                                                                        })}
                                                                    </ul>
                                                                    :
                                                                    ""
                                                                }
                                                            </div>
                                                            <div className="form-control-position">
                                                                <i className="ft-mail" />
                                                            </div>
                                                        </fieldset>
                                                        <button type="submit" className="btn btn-outline-primary btn-lg btn-block" onClick={this.handleForgotPassword}><i className="ft-unlock" /> Generate PIN</button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <div>
                                            <div className="card-body collapse in">
                                                <div className="card-block">
                                                    <p>Enter the verification code we sent.</p>
                                                    <form className="form-horizontal" noValidate>
                                                        <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="text" className="form-control form-control-lg input-lg" id="user-secret" placeholder="Verification Code" required value={this.state.userSecretKey} onChange={(e) => this.handleUserSecretKey(e.target.value)} />
                                                            <div className="form-control-position">
                                                                <i className="ft-pocket" />
                                                            </div>
                                                        </fieldset>
                                                        {this.state.userSecretKey !== '' ? <button type="submit" className="btn btn-outline-primary btn-lg btn-block" onClick={(event) => this.handleSecretKey(event)}><i className="ft-unlock" />Reset Password</button> : null}
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                    :
                                    <div>
                                        <div className="card-body collapse in">
                                            <div className="card-block">
                                                <p>Provide a new password and confirm it.</p>
                                                <form className="form-horizontal" noValidate>
                                                    <fieldset className="form-group position-relative has-icon-left">
                                                        <input type="password" className={"form-control form-control-lg input-lg" + this.validation.getClass(PasswordErrors)} name="password" id="user-password" placeholder="Enter Password" data-validation-required-message="Please enter valid passwords." required value={this.state.password} onChange={this.handleChange} />
                                                        <div className="invalid-block">
                                                            {this.validation.getClass(PasswordErrors) === " invalid" ?
                                                                <ul className="invalid" role="alert">
                                                                    {PasswordErrors.map(function (error, index) {
                                                                        return <li key={index}>{error}</li>;
                                                                    })}
                                                                </ul>
                                                                :
                                                                ""}
                                                        </div>
                                                        <div className="form-control-position">
                                                            <i className="fa fa-key" />
                                                        </div>
                                                    </fieldset>
                                                    <fieldset className="form-group position-relative has-icon-left">
                                                        <input type="password" className={"form-control form-control-lg input-lg" + this.validation.getClass(ConfirmPasswordErrors)} name="confirmPassword" id="confirm-password" placeholder="Confirm Password" data-validation-required-message="Please enter valid passwords." required value={this.state.confirmPassword} onChange={this.handleChange} />
                                                        <div className="invalid-block">
                                                            {this.validation.getClass(ConfirmPasswordErrors) === " invalid" ?
                                                                <ul className="invalid" role="alert">
                                                                    {ConfirmPasswordErrors.map(function (error, index) {
                                                                        return <li key={index}>{error}</li>;
                                                                    })}
                                                                </ul>
                                                                :
                                                                ""}
                                                        </div>
                                                        <div className="form-control-position">
                                                            <i className="fa fa-key" />
                                                        </div>
                                                    </fieldset>
                                                    {this.state.password === this.state.confirmPassword && this.state.confirmPassword !== '' && this.state.password !== '' ? <button type="submit" className="btn btn-outline-primary btn-lg btn-block" onClick={this.validate}><i className="ft-unlock" /> Reset Password</button> : null}
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                }
                              
                                <div className="card-footer no-border">
                                    <div>

                                        <p className="card-subtitle line-on-side text-muted text-xs-center font-small-3 mx-2 my-1"><span>Already a User ?</span></p>
                                        <div>
                                            <Link to="login" className="btn btn-accentblue btn-lg btn-block btn-lg mt-3"><i className="ft-unlock" /> Login</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    </div>
                </div>
            </div>
        );
    }
}