import React from 'react';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import Alert from '../Components/Alert.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Validation from '../Components/Validation.jsx';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            FirstName: '',
            LastName: '',
            Email: '',
            Username: '',
            UserId: '',
            IsActive: false,
            Password: '',
            ConfirmPassword: '',
            Roles: [],
            OtherPortalUsers: [],
            ShowAlert: false,
            alertMessage: '',
            alertType: '',
            FirstNameErrors: null,
            LastNameErrors: null,
            EmailErrors: null,
            PasswordErrors: null,
            ConfirmPasswordErrors: null
        };
        this.getFirstNameErrors = this.getFirstNameErrors.bind(this);
        this.getLastNameErrors = this.getLastNameErrors.bind(this);
        this.getEmailErrors = this.getEmailErrors.bind(this);
        this.getPasswordErrors = this.getPasswordErrors.bind(this);
        this.getConfirmPasswordErrors = this.getConfirmPasswordErrors.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.getFormValid = this.getFormValid.bind(this);
        this.validate = this.validate.bind(this);
        this.validation = new Validation();
    }
    componentDidMount() {
        var apiBaseUrl = Configuration().apiUrl;
        let that = this;
        axios.all([
            axios.get(apiBaseUrl + 'api/Users/CurrentUser'),
            axios.get(apiBaseUrl + 'api/users')
        ])
            .then(axios.spread(function (currentUser, users) {
                SetAuthorizationToken(currentUser.headers.token);
                var data = JSON.parse(currentUser.data);
                var otherPortalUsers = JSON.parse(users.data).filter(user => user.UserId !== data.UserId);

                that.setState({
                    FirstName : data.FirstName,
                })
                that.setState({
                    LastName: data.LastName,
                })
                that.setState({
                    Username: data.Username,
                })
                that.setState({
                    Email: data.Email,
                })
                that.setState({
                    UserId: data.UserId,
                })
                that.setState({
                    Password: data.Password,
                })
                that.setState({
                    ConfirmPassword: data.Password,
                })
                that.setState({
                    IsActive: data.IsActive,
                })
                that.setState({
                    OtherPortalUsers: otherPortalUsers,
                })

            }))
            .catch((error) => {
                if (error!=null && error.response!=null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error)
            })
    }

    getFirstNameErrors(value) {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }
    
    getLastNameErrors(value) {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getEmailErrors(value) {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.uniqueValid(value, this.state.OtherPortalUsers, "Email")) errors.push(this.validation.uniqueInvalidMessage(value));
        if (!this.validation.patternValid(value, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/, "")) errors.push("Must be an email address.");
        if (!this.validation.patternValid(value, /^\S*$/, "")) errors.push("Must not contain spaces.");
        return errors;
    }

    getPasswordErrors(value) {
        var errors = [];
        var minLength = 6, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.patternValid(value, /^(?=.*[A-Za-z])/, "")) errors.push("Must contain at least one alphabetical character.");
        if (!this.validation.patternValid(value, /^(?=.*[0-9])/, "")) errors.push("Must contain at least one numerical character.");
        // eslint-disable-next-line
        if (!this.validation.patternValid(value, /^(?=.*[!@#\$ %\^&\*\(\)_\-\+=\[\]\{\}\|\\:;"'<\,>\.\?/~`])/, "")) errors.push("Must contain at least one special character. (!@#$ %^&*()_-+=[]{}|\\:;\"'<,>.?~`)");
        return errors;
    }

    getConfirmPasswordErrors(value, otherValue) {
        var errors = [];
        if (!this.validation.stringEqualToValid(value, otherValue)) errors.push("Must match.");
        return errors;
    }

    getFormValid(...args) {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    handleChange(e) {
        let firstNameErrors = this.state.FirstNameErrors;
        let lastNameErrors = this.state.LastNameErrors;
        let emailErrors = this.state.EmailErrors;
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
            case "Email":
                emailErrors = this.getEmailErrors(trimmedValue);
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
            EmailErrors: emailErrors,
            PasswordErrors: passwordErrors,
            ConfirmPasswordErrors: confirmPasswordErrors
        });
    }

    handleBlur(e) {
        this.setState({
            [e.target.name]: e.target.value.trim()
        });
    }

    validate(event) {
        let firstNameErrors = !this.state.FirstNameErrors ? this.getFirstNameErrors(this.state.FirstName) : this.state.FirstNameErrors;
        let lastNameErrors = !this.state.LastNameErrors ? this.getLastNameErrors(this.state.LastName) : this.state.LastNameErrors;
        let emailErrors = !this.state.EmailErrors ? this.getEmailErrors(this.state.Email) : this.state.EmailErrors;
        let passwordErrors = !this.state.PasswordErrors ? this.getPasswordErrors(this.state.Password, this.state.ConfirmPassword) : this.state.PasswordErrors;
        let confirmPasswordErrors = !this.state.ConfirmPasswordErrors ? this.getConfirmPasswordErrors(this.state.ConfirmPassword, this.state.Password) : this.state.ConfirmPasswordErrors;
        let formValid = this.getFormValid(firstNameErrors, lastNameErrors, emailErrors, passwordErrors, confirmPasswordErrors);
        if (formValid) {
            this.handleClick(event);
        } else {
            this.setState({
                alertType: '',
                alertMessage: '',
                FirstNameErrors: firstNameErrors,
                LastNameErrors: lastNameErrors,
                EmailErrors: emailErrors,
                PasswordErrors: passwordErrors,
                ConfirmPasswordErrors: confirmPasswordErrors
            });
        }
    }

    handleClick(event) {
        var apiBaseUrl = Configuration().apiUrl;
        
        var payload = {
            "FirstName": this.state.FirstName.trim().replace(/\s+/g, ''),
            "LastName": this.state.LastName.trim().replace(/\s+/g, ''),
            "Username": this.state.Username,
            "Email": this.state.Email.trim().replace(/\s+/g, ''),
            "PortalUserId": this.state.UserId,
            "Password": this.state.Password,
            "IsActive": this.state.IsActive
        }

        let that = this;
        axios.post(apiBaseUrl + 'api/Users/Update', payload)
            .then(function (response) {
                if (response.status === 401) {
                    that.handleError(response.statusText);
                }
                else if (response.status === 204) {
                    that.handleSuccess("Profile updated successfully.");
                }
                else {
                    console.log("Username does not exist");
                    that.handleError("Failed to save profile");
                }
            })
            .catch(function (error) {
                if (error != null && error.response != null && 401 === error.response.status) {
                    that.handleError(error.response.statusText);
                }
                console.log(error.response);
            });
    }
    
    handleSuccess(value) {
        this.setState({
            alertType: 'success',
            alertMessage: value
        });
    }

    handleError(value) {
        this.setState({
            alertType: 'danger',
            alertMessage: value
        });
    }

    render() {
        let FirstNameErrors = this.state.FirstNameErrors;
        let LastNameErrors = this.state.LastNameErrors;
        let EmailErrors = this.state.EmailErrors;
        let PasswordErrors = this.state.PasswordErrors;
        let ConfirmPasswordErrors = this.state.ConfirmPasswordErrors;

        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Edit Profile</h4>
                        </div>
                        <div className="card-body">
                            <div className="card-block">

                                <Alert AlertMessage={this.state.alertMessage} AlertType={this.state.alertType} />

                                <div className="row">
                                    <div className="form-horizontal form-simple" action="Login">
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <fieldset className="form-group">
                                                <label htmlFor="basicInput">
                                                    {'First Name '}
                                                    <span className="required">*</span>
                                                    &nbsp;
                                                </label>
                                                <input type="text" className={"form-control" + this.validation.getClass(FirstNameErrors)} value={this.state.FirstName} name="FirstName" onChange={this.handleChange} onBlur={this.handleBlur} />
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
                                            </fieldset>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <fieldset className="form-group">
                                                <label htmlFor="basicInput">
                                                    {'Last Name '}
                                                    <span className="required">*</span>
                                                    &nbsp;
                                                </label>
                                                <input type="text" className={"form-control" + this.validation.getClass(LastNameErrors)} value={this.state.LastName} name="LastName" onChange={this.handleChange} onBlur={this.handleBlur} />
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
                                            </fieldset>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <fieldset className="form-group">
                                                <label htmlFor="basicInput">User Name</label>
                                                <input type="text" className="form-control" readOnly value={this.state.Username} name="Username" onChange={this.handleChange}/>
                                            </fieldset>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <fieldset className="form-group">
                                                <label htmlFor="basicInput">
                                                    {'Email '}
                                                    <span className="required">*</span>
                                                    &nbsp;
                                                </label>
                                                <input type="text" className={"form-control" + this.validation.getClass(EmailErrors)} value={this.state.Email} name="Email" onChange={this.handleChange} onBlur={this.handleBlur} />
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
                                            </fieldset>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <fieldset className="form-group">
                                                <label htmlFor="basicInput">
                                                    {'Password '}
                                                    <span className="required">*</span>
                                                    &nbsp;
                                                </label>
                                                <input type="password" className={"form-control form-control-lg input-lg" + this.validation.getClass(PasswordErrors)} name="Password" value={this.state.Password} onChange={this.handleChange} />
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
                                            </fieldset>
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <fieldset className="form-group">
                                                <label htmlFor="basicInput">
                                                    {'Confirm Password '}
                                                    <span className="required">*</span>
                                                    &nbsp;
                                                </label>
                                                <input type="password" className={"form-control form-control-lg input-lg" + this.validation.getClass(ConfirmPasswordErrors)} name="ConfirmPassword" value={this.state.ConfirmPassword} onChange={this.handleChange} />
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
                                            </fieldset>
                                        </div>
                                        <button type="submit" className="btn btn-success btn-lg btn-block" onClick={this.validate} >Update</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </ContentPane>
    )}
}
