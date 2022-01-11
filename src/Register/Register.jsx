import React, { Component } from 'react';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import Validation from '../Components/Validation.jsx';
import Captcha from '../Utils/Captcha';

export default class Register extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            objectName: "User",
            action: "Register",
            complete: false,
            UserName: '',
            Password: '',
            ConfirmPassword: '',
            FirstName: '',
            LastName: '',
            Email: '',
            PhoneNumber: '',
            FirstNameErrors: null,
            LastNameErrors: null,
            UserNameErrors: null,
            EmailErrors: null,
            PhoneNumberErrors: null,
            PasswordErrors: null,
            ConfirmPasswordErrors: null,
            IsActive: false,
            PortalUsers: [],
            receivedData: false,
            alert: null
        };
        this.validation = new Validation();
    }

    componentDidMount() {
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Users')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                this.setState({
                    PortalUsers: JSON.parse(response.data),
                    receivedData: true
                })
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error)
            })
    }

    getFirstNameErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getLastNameErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getUserNameErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.uniqueValid(value, this.state.PortalUsers, "Username")) errors.push(this.validation.uniqueInvalidMessage(value));
        return errors;
    }

    getEmailErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.uniqueValid(value, this.state.PortalUsers, "Email")) errors.push(this.validation.uniqueInvalidMessage(value));
        if (!this.validation.patternValid(value, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/, "")) errors.push("Must be an email address.");
        if (!this.validation.patternValid(value, /^\S*$/, "")) errors.push("Must not contain spaces.");
        return errors;
    }

    getPhoneNumberErrors = (value) => {
        let errors = [];
        if (value == null || value.trim() === "") return errors;
        if (!this.validation.patternValid(value, /^\+?[1-9][0-9]{1,14}$/, "")) errors.push("Must be a valid E.164 number.");
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

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked });
    }

    handleChange = (e) => {
        let firstNameErrors = this.state.FirstNameErrors;
        let lastNameErrors = this.state.LastNameErrors;
        let userNameErrors = this.state.UserNameErrors;
        let emailErrors = this.state.EmailErrors;
        let phoneNumberErrors = this.state.PhoneNumberErrors;
        let passwordErrors = this.state.PasswordErrors;
        let confirmPasswordErrors = this.state.ConfirmPasswordErrors;
        let trimmedValue = e.target.value.trim();
        switch (e.target.name) {
            case "FirstName":
                firstNameErrors = this.getFirstNameErrors(trimmedValue);
                break;
            case "LastName":
                lastNameErrors = this.getLastNameErrors(trimmedValue);
                break;
            case "UserName":
                userNameErrors = this.getUserNameErrors(trimmedValue);
                break;
            case "Email":
                emailErrors = this.getEmailErrors(trimmedValue);
                break;
            case "PhoneNumber":
                phoneNumberErrors = this.getPhoneNumberErrors(trimmedValue);
                break;
            case "Password":
                passwordErrors = this.getPasswordErrors(e.target.value, this.state.ConfirmPassword);
                confirmPasswordErrors = this.getConfirmPasswordErrors(this.state.ConfirmPassword, e.target.value);
                break;
            case "ConfirmPassword":
                passwordErrors = this.getPasswordErrors(this.state.Password, e.target.value);
                confirmPasswordErrors = this.getConfirmPasswordErrors(e.target.value, this.state.Password);
                break;
            default:
                break;
        }
        this.setState({
            [e.target.name]: e.target.value,
            FirstNameErrors: firstNameErrors,
            LastNameErrors: lastNameErrors,
            UserNameErrors: userNameErrors,
            EmailErrors: emailErrors,
            PhoneNumberErrors: phoneNumberErrors,
            PasswordErrors: passwordErrors,
            ConfirmPasswordErrors: confirmPasswordErrors
        });
    }

    handleBlur = (e) => {
        this.setState({
            [e.target.name]: e.target.value.trim()
        });
    }

    validate = (e) => {
        let firstNameErrors = !this.state.FirstNameErrors ? this.getFirstNameErrors(this.state.FirstName) : this.state.FirstNameErrors;
        let lastNameErrors = !this.state.LastNameErrors ? this.getLastNameErrors(this.state.LastName) : this.state.LastNameErrors;
        let userNameErrors = !this.state.UserNameErrors ? this.getUserNameErrors(this.state.UserName) : this.state.UserNameErrors;
        let emailErrors = !this.state.EmailErrors ? this.getEmailErrors(this.state.Email) : this.state.EmailErrors;
        let phoneNumberErrors = !this.state.PhoneNumberErrors ? this.getPhoneNumberErrors(this.state.PhoneNumber) : this.state.PhoneNumberErrors;
        let passwordErrors = !this.state.PasswordErrors ? this.getPasswordErrors(this.state.Password, this.state.ConfirmPassword) : this.state.PasswordErrors;
        let confirmPasswordErrors = !this.state.ConfirmPasswordErrors ? this.getConfirmPasswordErrors(this.state.ConfirmPassword, this.state.Password) : this.state.ConfirmPasswordErrors;
        let formValid = this.getFormValid(firstNameErrors, lastNameErrors, userNameErrors, emailErrors, phoneNumberErrors, passwordErrors, confirmPasswordErrors);
        if (formValid) {
            let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Users/" + change;
            let payload = {
                "UserId": '',
                "Username": this.state.UserName.trim(),
                "Password": this.state.Password,
                "FirstName": this.state.FirstName.trim(),
                "LastName": this.state.LastName.trim(),
                "Email": this.state.Email.trim(),
                "PhoneNumber": this.state.PhoneNumber.trim(),
                "IsActive": this.state.IsActive,
                "ApiKey": ''
            }
            let note = this.state.editMode ? "This will update the selected " + subject.toLocaleLowerCase() + ".\n\n" : "";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK."
            this.setState({
                alert: (
                    <SweetAlert
                        input
                        showCancel
                        cancelBtnBsStyle="default"
                        confirmBtnBsStyle="danger"
                        title="Are you sure?"
                        placeholder="Confirmation Text"
                        onConfirm={(e) => this.recieveInput(payload, e, magicWord, action, change)}
                        onCancel={this.hideAlert.bind(this)}
                    >
                        {text}
                    </SweetAlert>
                )
            });
        } else {
            this.setState({
                FirstNameErrors: firstNameErrors,
                LastNameErrors: lastNameErrors,
                UserNameErrors: userNameErrors,
                EmailErrors: emailErrors,
                PhoneNumberErrors: phoneNumberErrors,
                PasswordErrors: passwordErrors,
                ConfirmPasswordErrors: confirmPasswordErrors
            });
        }
    }

    recieveInput = (payload, text, magicWord, action, verb) => {
        if (text === magicWord) {
            let subject = this.state.objectName;
            console.log(payload);
            //console.log("send", new Date());
            this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
            let apiActions = new ApiActions();
            let apiBaseUrl = Configuration().apiUrl;
            axios.post(apiBaseUrl + 'api/' + action, payload)
                .then((response) => {
                    clearTimeout(this.actionStatusTimer);
                    if (response.status === 401) {
                        this.handleError("", response.statusText);
                    }
                    else if (response.status === 204) {
                        //console.log("done", new Date());
                        console.log(subject + " " + verb + " Successful!");
                        SetAuthorizationToken(response.headers.token);
                        this.handleSuccess(subject, verb);
                    }
                    else {
                        console.log("Failed to " + verb.toLocaleLowerCase() + " " + subject.toLocaleLowerCase());
                        let responseMessage = apiActions.getResponseMessage(response);
                        this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", responseMessage);
                    }
                })
                .catch((error) => {
                    clearTimeout(this.actionStatusTimer);
                    if (error != null && error.response != null && error.response.status === 504) {
                        localStorage.removeItem('token');
                        this.props.history.push("/Login");
                    }
                    let errorMessage = apiActions.getErrorMessage(error);
                    this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                    console.log("error", error);
                });
        } else {
            this.setState({
                alert: (
                    <SweetAlert danger title={verb + " cancelled"} onConfirm={this.hideAlert.bind(this)}>
                        Confirmation text '{text}' doesn't match '{magicWord}'
                    </SweetAlert>
                )
            });
        }
    }

    handleProcessing = () => {
        this.setState({
            alert: (
                <SweetAlert
                    type="default"
                    showCancel={false}
                    showConfirm={false}
                    title="Processing ..."
                    onConfirm={this.hideAlert}
                >
                    <div>
                        <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                        <span className="sr-only">Processing...</span>
                    </div>
                </SweetAlert>
            )
        });
    }

    handleSuccess = (subject, verb) => {
        this.setState({
            complete: true,
            alert: (
                <SweetAlert success title={subject + " " + verb + " Successful!"} onConfirm={this.hideAlert}>
                </SweetAlert>
            )
        });
    }

    handleError = (title, message) => {
        this.setState({
            alert: (
                <SweetAlert danger title={title} onConfirm={this.hideAlert}>
                    {message}
                </SweetAlert>
            )
        });
    }

    hideAlert = (e) => {
        this.setState({ alert: null });
        // force redirect back to parent view
        if (this.state.complete) {
            this.props.history.push("/Layout/PortalUsers");
        }
    }

    render() {
        let FirstNameErrors = this.state.FirstNameErrors;
        let LastNameErrors = this.state.LastNameErrors;
        let UserNameErrors = this.state.UserNameErrors;
        let EmailErrors = this.state.EmailErrors;
        let PhoneNumberErrors = this.state.PhoneNumberErrors;
        let PasswordErrors = this.state.PasswordErrors;
        let ConfirmPasswordErrors = this.state.ConfirmPasswordErrors;

        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Add New User</h4>
                        </div>
                        <div className="card-body">
                            <div className="card-block">
                                <div className="row">
                                    <form className="form-horizontal" noValidate>
                                        <div className="row">
                                            <div className="col-xs-12 col-sm-6 col-md-6">
                                                        <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="text" name="FirstName" id="first_name" className={"form-control input-lg" + this.validation.getClass(FirstNameErrors)} placeholder="First Name" tabIndex={1} value={this.state.FirstName} onChange={this.handleChange} onBlur={this.handleBlur} />
                                                            <div className="invalid-block">
                                                                {this.validation.getClass(FirstNameErrors) === " invalid" ?
                                                                    <ul className="invalid" role="alert">
                                                                        {FirstNameErrors.map(function (error, index) {
                                                                            return <li key={index}>{error}</li>;
                                                                        })}
                                                                    </ul>
                                                                    :
                                                                    ""}
                                                            </div>
                                                    <div className="form-control-position">
                                                        <i className="ft-user" />
                                                    </div>
                                                </fieldset>
                                            </div>
                                            <div className="col-xs-12 col-sm-6 col-md-6">
                                                <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="text" name="LastName" id="last_name" className={"form-control input-lg" + this.validation.getClass(LastNameErrors)} placeholder="Last Name" tabIndex={2} value={this.state.LastName} onChange={this.handleChange} onBlur={this.handleBlur} />
                                                            <div className="invalid-block">
                                                                {this.validation.getClass(LastNameErrors) === " invalid" ?
                                                                    <ul className="invalid" role="alert">
                                                                        {LastNameErrors.map(function (error, index) {
                                                                            return <li key={index}>{error}</li>;
                                                                        })}
                                                                    </ul>
                                                                    :
                                                                    ""}
                                                            </div>
                                                    <div className="form-control-position">
                                                        <i className="ft-user" />
                                                    </div>
                                                </fieldset>
                                            </div>
                                        </div>
                                        <fieldset className="form-group position-relative has-icon-left">
                                                    <input type="text" name="UserName" id="display_name" className={"form-control input-lg" + this.validation.getClass(UserNameErrors)} placeholder="Display Name" tabIndex={3} value={this.state.UserName} onChange={this.handleChange} onBlur={this.handleBlur} />
                                                    <div className="invalid-block">
                                                        {this.validation.getClass(UserNameErrors) === " invalid" ?
                                                            <ul className="invalid" role="alert">
                                                                {UserNameErrors.map(function (error, index) {
                                                                    return <li key={index}>{error}</li>;
                                                                })}
                                                            </ul>
                                                            :
                                                            ""}
                                                    </div>
                                            <div className="form-control-position">
                                                <i className="ft-user" />
                                            </div>
                                            <div className="help-block font-small-3" />
                                        </fieldset>
                                        <fieldset className="form-group position-relative has-icon-left">
                                                    <input type="text" name="Email" id="email" className={"form-control input-lg" + this.validation.getClass(EmailErrors)} placeholder="Email Address" tabIndex={4} value={this.state.Email} onChange={this.handleChange} onBlur={this.handleBlur} />
                                                    <div className="invalid-block">
                                                        {this.validation.getClass(EmailErrors) === " invalid" ?
                                                            <ul className="invalid" role="alert">
                                                                {EmailErrors.map(function (error, index) {
                                                                    return <li key={index}>{error}</li>;
                                                                })}
                                                            </ul>
                                                            :
                                                            ""}
                                                    </div>
                                            <div className="form-control-position">
                                                <i className="ft-mail" />
                                            </div>
                                            <div className="help-block font-small-3" />
                                        </fieldset>
                                        <fieldset className="form-group position-relative has-icon-left">
                                            <input type="text" name="PhoneNumber" id="PhoneNumber" className={"form-control input-lg" + this.validation.getClass(PhoneNumberErrors)} placeholder="PhoneNumber" tabIndex={5} value={this.state.PhoneNumber} onChange={this.handleChange} onBlur={this.handleBlur} />
                                            <div className="invalid-block">
                                                {this.validation.getClass(PhoneNumberErrors) === " invalid" ?
                                                    <ul className="invalid" role="alert">
                                                        {PhoneNumberErrors.map(function (error, index) {
                                                            return <li key={index}>{error}</li>;
                                                        })}
                                                    </ul>
                                                    :
                                                    ""}
                                            </div>
                                            <div className="form-control-position">
                                                <i className="ft-phone" />
                                            </div>
                                            <div className="help-block font-small-3" />
                                        </fieldset>
                                        <div className="row">
                                            <div className="col-xs-12 col-sm-6 col-md-6">
                                                <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="password" name="Password" id="password" className={"form-control input-lg" + this.validation.getClass(PasswordErrors)} placeholder="Password" value={this.state.Password} onChange={this.handleChange} tabIndex={6} />
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
                                                    <div className="help-block font-small-3" />
                                                </fieldset>
                                            </div>
                                            <div className="col-xs-12 col-sm-6 col-md-6">
                                                <fieldset className="form-group position-relative has-icon-left">
                                                            <input type="password" name="ConfirmPassword" id="password_confirmation" className={"form-control input-lg" + this.validation.getClass(ConfirmPasswordErrors)} placeholder="Confirm Password" value={this.state.ConfirmPassword} onChange={this.handleChange} tabIndex={7} />
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
                                                    <div className="help-block font-small-3" />
                                                </fieldset>
                                            </div>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <div className="form-group">
                                                <label className="inline custom-control custom-checkbox block">
                                                    <input type="checkbox" className="custom-control-input" id="IsActive" name="IsActive" checked={this.state.IsActive} onChange={this.handleCheckboxChange} tabIndex={8} />
                                                    <span className="custom-control-indicator"></span>
                                                    <span className="custom-control-description ml-0">Active</span>
                                                </label>
                                            </div>
                                        </div>
                                    </form>
                                    <button type="submit" className="btn btn-primary btn-lg btn-block" onClick={this.validate} ><i className="ft-user" /> Add User</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {this.state.alert}
            </ContentPane>
        );
    }
}
