import React from 'react';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import Validation from '../Components/Validation.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import Captcha from '../Utils/Captcha';

export default class EditPortalUser extends React.Component {
    constructor(props) {
        super(props);
        let editMode = true;
        let userId = "00000000-0000-0000-0000-000000000000";
        let isReserved = false;
        if (props != null && props.location != null && props.location.state != null) {
            if (props.location.state.editMode != null) editMode = props.location.state.editMode;
            if (props.location.state.userId != null) userId = props.location.state.userId;
            if (props.location.state.isReserved != null) isReserved = props.location.state.isReserved;
        }
        //console.log("editMode = ", editMode, " | userId = ", userId, " | isReserved = ", isReserved);
        let action = editMode ? "Update" : "Create";
        this.state = {
            editMode: editMode,
            objectName: "User",
            action: action,
            complete: false,
            PortalUserId: userId,
            FirstName: '',
            LastName: '',
            Email: '',
            PhoneNumber: '',
            Username: '',
            IsActive: false,
            IsReserved: isReserved,
            Roles: [],
            OtherPortalUsers: [],
            FirstNameErrors: null,
            LastNameErrors: null,
            EmailErrors: null,
            PhoneNumberErrors: null,
            receivedData: false,
            alert: null
        };
        this.validation = new Validation();
    }

    componentDidMount() {
        let apiBaseUrl = Configuration().apiUrl;
        let that = this;
        axios.all([
            axios.get(apiBaseUrl + 'api/Users/' + this.state.PortalUserId),
            axios.get(apiBaseUrl + 'api/Users')
        ])
            .then(axios.spread(function (currentUser, users) {
                SetAuthorizationToken(currentUser.headers.token);
                let data = JSON.parse(currentUser.data);
                //console.log("data = ", data);
                let otherPortalUsers = JSON.parse(users.data).filter(user => user.UserId !== data.PortalUserId);
                //console.log("otherPortalUsers = ", otherPortalUsers);
                that.setState({
                    FirstName: data.FirstName,
                    LastName: data.LastName,
                    Username: data.Username,
                    Email: data.Email,
                    PhoneNumber: data.PhoneNumber,
                    PortalUserId: data.PortalUserId,
                    IsActive: data.IsActive,
                    OtherPortalUsers: otherPortalUsers,
                })
            }))
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

    getEmailErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.uniqueValid(value, this.state.OtherPortalUsers, "Email")) errors.push(this.validation.uniqueInvalidMessage(value));
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
        let emailErrors = this.state.EmailErrors;
        let phoneNumberErrors = this.state.PhoneNumberErrors;
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
            case "PhoneNumber":
                phoneNumberErrors = this.getPhoneNumberErrors(trimmedValue);
                break;
            default:
                break;
        }
        this.setState({
            [e.target.name]: e.target.value,
            FirstNameErrors: firstNameErrors,
            LastNameErrors: lastNameErrors,
            EmailErrors: emailErrors,
            PhoneNumberErrors: phoneNumberErrors
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
        let emailErrors = !this.state.EmailErrors ? this.getEmailErrors(this.state.Email) : this.state.EmailErrors;
        let phoneNumberErrors = !this.state.PhoneNumberErrors ? this.getPhoneNumberErrors(this.state.PhoneNumber) : this.state.PhoneNumberErrors;
        let formValid = this.getFormValid(firstNameErrors, lastNameErrors, emailErrors, phoneNumberErrors);
        if (formValid) {
            let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Users/" + change;
            let payload = {
                "FirstName": this.state.FirstName.trim(),
                "LastName": this.state.LastName.trim(),
                "Username": this.state.Username.trim(),
                "Email": this.state.Email.trim(),
                "PhoneNumber": this.state.PhoneNumber != null ? this.state.PhoneNumber.trim() : null,
                "PortalUserId": this.state.PortalUserId,
                "IsActive": this.state.IsActive
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
                alertType: '',
                alertMessage: '',
                FirstNameErrors: firstNameErrors,
                LastNameErrors: lastNameErrors,
                EmailErrors: emailErrors,
                PhoneNumberErrors: phoneNumberErrors
            });
        }
    }

    recieveInput = (payload, text, magicWord, action, verb) => {
        if (text === magicWord) {
            let subject = this.state.objectName;
            //console.log(payload);
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
        let editMode = this.state.editMode;
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-8 col-lg-8 col-xl-8">
                                    <h2 className="card-title">{editMode ? "Edit" : "Create"} User{editMode ? " - " + this.state.Username : ""}</h2>
                                </div>
                                <div className="col-md-4 col-lg-4 col-xl-4">
                                    <ul className="card-menu">
                                        <li className="card-menu-refresh"></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="card-block">
                                <div className="row">
                                    <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                        <div><span className="danger">*</span> denotes required field<br /><br /></div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="form-horizontal form-simple" action="Login">
                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <ValidationInput label="First Name:" isRequired={true}
                                                name="FirstName" value={this.state.FirstName}
                                                validation={this.validation} errors={this.state.FirstNameErrors}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <ValidationInput label="Last Name:" isRequired={true}
                                                name="LastName" value={this.state.LastName}
                                                validation={this.validation} errors={this.state.LastNameErrors}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <ValidationInput label="Username:" isRequired={false} readOnly={true}
                                                name="Username" value={this.state.Username}
                                                validation={this.validation} errors={null}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <ValidationInput label="Email:" isRequired={true}
                                                name="Email" value={this.state.Email}
                                                validation={this.validation} errors={this.state.EmailErrors}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <ValidationInput label="Phone Number:" isRequired={false}
                                                name="PhoneNumber" value={this.state.PhoneNumber}
                                                validation={this.validation} errors={this.state.PhoneNumberErrors}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                        <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                            <div className="form-group">
                                                <label className="inline custom-control custom-checkbox block">
                                                    <input type="checkbox" className="custom-control-input" id="IsActive" name="IsActive" checked={this.state.IsActive} onChange={this.handleCheckboxChange} />
                                                    <span className="custom-control-indicator"></span>
                                                    <span className="custom-control-description ml-0">Active</span>
                                                </label>
                                            </div>
                                        </div>
                                        <button type="submit" className="btn btn-success btn-lg btn-block" onClick={this.validate}>Update</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {this.state.alert}
            </ContentPane>
        )
    }
}
