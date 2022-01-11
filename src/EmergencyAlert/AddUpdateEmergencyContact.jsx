import React from 'react';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import Validation from '../Components/Validation.jsx';
import ValidationFile from '../Components/ValidationFile.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';

export default class AddUpdateEmergencyContact extends React.Component {
    constructor(props) {
        super(props);
        let editMode = false;
        let accountId = "00000000-0000-0000-0000-000000000000";
        let displayName = "";
        if (props != null && props.location != null && props.location.state != null) {
            if (props.location.state.editMode != null) editMode = props.location.state.editMode;
            if (props.location.state.accountId != null) accountId = props.location.state.accountId;
            if (props.location.state.displayName != null) displayName = props.location.state.displayName;
        }
        //console.log("editMode = ", editMode, " | accountId = ", accountId, " | displayName = ", displayName);
        let action = editMode ? "Update" : "Create";
        this.state = {
            editMode: editMode,
            objectName: "Contacts",
            action: action,
            complete: false,
            data: [],
            accountId: accountId,
            displayName: displayName,
            fileName: "",
            delimiter: ",",
            fileNameErrors: null,
            delimiterErrors: null,
            receivedData: false,
            alert: null
        };
        this.actionStatusTimer = false;
        this.formatting = new Formatting();
        this.validation = new Validation();
    }

    componentDidMount() {
        if (!this.state.editMode || this.state.accountId == null) {
            this.setState({
                receivedData: true
            });
            return;
        }
        this.setState({
            receivedData: true
        });
    }

    componentWillUnmount() {
        this.validation = null;
        this.formatting = null;
    }

    getFileNameErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 500;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getDelimiterErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 1;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getFormValid = (...args) => {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    handleChange = (e) => {
        let fileNameErrors = this.state.fileNameErrors;
        let delimiterErrors = this.state.delimiterErrors;
        let value = e.target.value;
        //console.log("id = ", e.target.id, "| name = ", e.target.name, "| value = ", value);
        const data = new FormData();
        switch (e.target.name) {
            case "fileName":
                fileNameErrors = this.getFileNameErrors(value);
                console.log(e.target.files[0]);
                data.append('file', e.target.files[0]);
                //data.append('name', this.state.fileName || "file");
                //data.append('description', this.state.description || "description");
                break;
            case "delimiter":
                delimiterErrors = this.getDelimiterErrors(value);
                break;
            default:
                break;
        }
        this.setState({
            [e.target.name]: value,
            data: data,
            fileNameErrors: fileNameErrors,
            delimiterErrors: delimiterErrors
        });
    }

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked });
    }

    handleBlur = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    validate = (e) => {
        e.preventDefault();
        let fileName = (this.state.fileName || "").trim();
        let fileNameErrors = this.getFileNameErrors(fileName);
        //console.log("fileNameErrors = ", fileNameErrors);
        let delimiter = (this.state.delimiter || ",").trim();
        let delimiterErrors = this.getDelimiterErrors(delimiter);
        //console.log("delimiterErrors = ", delimiterErrors);
        let formValid = this.getFormValid(fileNameErrors, delimiterErrors);
        if (formValid) {
            let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "EmergencyAlerts/Account/" + this.state.accountId + "/Contacts/BulkUpload";
            let formData = this.state.data;
            formData.append('delimiter', this.state.delimiter);
            let payload = formData;
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
                fileName: fileName,
                fileNameErrors: fileNameErrors,
                delimiter: delimiter,
                delimiterErrors: delimiterErrors
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
            this.props.history.push({
                pathname: "/Layout/EmergencyContacts",
                state: { accountId: this.state.accountId, editMode: true, displayName: this.state.displayName }
            });
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
                                    <h2 className="card-title">{editMode ? "Edit" : "Create"} Emergency Contacts{editMode ? " - " + this.state.displayName : ""}</h2>
                                </div>
                                <div className="col-md-4 col-lg-4 col-xl-4">
                                    <ul className="card-menu">
                                        <li className="card-menu-refresh"></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                            {this.state.receivedData ?
                                <div className="card-block">
                                    <div>
                                        <p>Choose a delimited file to upload and supply the appropriate delimiter.</p>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                            <ValidationFile label="File: " isRequired={true} readOnly={true}
                                                name="fileName" id="fileName"
                                                validation={this.validation} errors={this.state.fileNameErrors}
                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                            <ValidationInput label="Delimiter:" isRequired={true}
                                                name="delimiter" value={this.state.delimiter}
                                                validation={this.validation} errors={this.state.delimiterErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                        </div>
                                        <div className="col-sm-10 col-md-10 col-lg-10 col-xl-10">
                                        </div>
                                    </div>
                                    {this.state.complete ?
                                        ""
                                        :
                                        <div className="pull-right">
                                            <button className="btn btn-primary ml-1" onClick={this.validate}>{this.state.action}</button>
                                        </div>
                                    }

                                </div>
                                :
                                <div className="card-block offset-lg-5 offset-md-5">
                                    <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                    <span className="sr-only">Loading...</span>
                                </div>
                            }
                        </div>
                    </div>
                </section>
                {this.state.alert}
            </ContentPane>
        )
    }
}