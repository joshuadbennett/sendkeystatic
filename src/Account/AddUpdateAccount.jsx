import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions.jsx';
import SweetAlert from 'react-bootstrap-sweetalert';
import Validation from '../Components/Validation.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import Captcha from '../Utils/Captcha';
import uuidv4 from 'uuid/v4';
import Formatting from '../Components/Formatting.jsx';
import AddressInputList from '../Components/AddressInputList.jsx';
import PhoneNumberInputList from '../Components/PhoneNumberInputList.jsx';
import RateInfo from '../Rate/RateInfo.jsx';
import ReactTable from "react-table";
import 'react-table/react-table.css'
/*
const states = {
    DETAILS: "1",
    ADDRESSES: "2",
    PHONES: "3",
    ASSOCIATIONS: "4",
    REVIEW: "5"
};
*/
const states = {
    DETAILS: "1",
    ASSOCIATIONS: "2",
    REVIEW: "3"
};

const authTypes = {
    NONE: "",
    X509CERTIFICATE: "X.509 Certificate",
    CREDENTIALS: "Credentials"
}

const faxServiceTypes = {
    NONE: "",
    TWILIO: "Twilio",
    TELNYX: "Telnyx"
}

var fieldValues = {
    editMode: false,
    currentState: states.DETAILS,
    accountId: "00000000-0000-0000-0000-000000000000",
    associations: [],
    associationNumbers: [],
    account: null,
    addresses: [],
    phones: [],
    accountTypeId: "",
    accountTypeName: "",
    accountTypes: [],
    rateId: "",
    rateName: "",
    rateLabel: "",
    rates: [],
    billingId: null,
    displayName: null,
    displayNames: [],
    title: null,
    firstName: null,
    middleName: null,
    lastName: null,
    suffix: null,
    emailAddress: null,
    pin: null,
    isActive: false
};

export default class AddUpdateAccount extends React.Component {
    constructor(props) {
        super(props);
        if (props != null && props.location != null && props.location.state != null) {
            if (props.location.state.editMode != null) fieldValues.editMode = props.location.state.editMode;
            if (props.location.state.accountId != null) fieldValues.accountId = props.location.state.accountId;
        }
        //console.log("editMode = ", fieldValues.editMode, " || accountId = ", fieldValues.accountId);
        this.state = {
            currentState: fieldValues.editMode ? states.DETAILS : fieldValues.currentState,
            accountId: fieldValues.accountId,
            account: fieldValues.account,
            receivedData: false,
            alert: null
        };
        this.getFormValid = this.getFormValid.bind(this);
        this.validation = new Validation();
        this.warp = this.warp.bind(this);
        this.next = this.next.bind(this);
        this.back = this.back.bind(this);
        this.stateMachine = new StateMachine();
    }

    componentDidMount() {
        let apiBaseUrl = Configuration().apiUrl;
        let that = this;
        axios.all([
            axios.get(apiBaseUrl + 'api/Accounts/' + fieldValues.accountId + '/Associations'),
            axios.get(apiBaseUrl + 'api/Associations/' + fieldValues.accountId + '/OtherAssociationNumbers'),
            axios.get(apiBaseUrl + 'api/Accounts/' + fieldValues.accountId),
            axios.get(apiBaseUrl + 'api/Accounts/Types'),
            axios.get(apiBaseUrl + 'api/Rates/'),
            axios.get(apiBaseUrl + 'api/Accounts/' + fieldValues.accountId + '/OtherDisplayNames'),
            axios.get(apiBaseUrl + 'api/Accounts/' + fieldValues.accountId + '/Addresses'),
            axios.get(apiBaseUrl + 'api/Accounts/' + fieldValues.accountId + '/PhoneNumbers')
        ])
            .then(axios.spread(function (associations, associationNumbers, account, accountTypes, rates, displayNames, addresses, phones) {
                SetAuthorizationToken(accountTypes.headers.token);
                fieldValues.associations = JSON.parse(associations.data) || [];
                //console.log("associations = ", fieldValues.associations);
                fieldValues.associationNumbers = JSON.parse(associationNumbers.data) || [];
                //console.log("associationNumbers = ", fieldValues.associationNumbers);
                fieldValues.accountTypes = JSON.parse(accountTypes.data) || [];
                //console.log("accountTypes = ", fieldValues.accountTypes);
                fieldValues.rates = JSON.parse(rates.data) || [];
                //console.log("rates = ", fieldValues.rates);
                fieldValues.displayNames = JSON.parse(displayNames.data) || [];
                //console.log("displayNames = ", fieldValues.displayNames);
                fieldValues.addresses = JSON.parse(addresses.data) || [];
                //console.log("addresses = ", fieldValues.addresses);
                fieldValues.phones = JSON.parse(phones.data) || [];
                //console.log("phones = ", fieldValues.phones);
                if (fieldValues.editMode && fieldValues.account == null && fieldValues.accountId.replace(/\s/g, "").length > 0 && fieldValues.accountId !== "00000000-0000-0000-0000-000000000000") {
                    //console.log(fieldValues.accountId);
                    fieldValues.account = JSON.parse(account.data);
                    //console.log("account = ", fieldValues.account);
                    fieldValues.accountTypeId = fieldValues.account.AccountTypeId;
                    fieldValues.accountTypeName = fieldValues.account.AccountType.AccountTypeName;
                    fieldValues.rateId = fieldValues.account.RateId;
                    fieldValues.rateName = fieldValues.account.Rate.RateName;
                    fieldValues.billingId = fieldValues.account.AccountBillingId;
                    fieldValues.displayName = fieldValues.account.DisplayName;
                    fieldValues.title = fieldValues.account.Title;
                    fieldValues.firstName = fieldValues.account.FirstName;
                    fieldValues.middleName = fieldValues.account.MiddleName;
                    fieldValues.lastName = fieldValues.account.LastName;
                    fieldValues.suffix = fieldValues.account.Suffix;
                    fieldValues.emailAddress = fieldValues.account.EmailAddress;
                    fieldValues.pin = fieldValues.account.PIN;
                    fieldValues.isActive = fieldValues.account.IsActive;
                }
                that.setState({
                    receivedData: true
                });
            }))
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                this.setState({
                    receivedData: true
                });
                console.log("error", error);
            });
    }

    componentWillUnmount() {
        fieldValues = {
            editMode: false,
            currentState: states.DETAILS,
            accountId: "00000000-0000-0000-0000-000000000000",
            associations: [],
            associationNumbers: [],
            account: null,
            addresses: [],
            phones: [],
            accountTypeId: "",
            accountTypeName: "",
            accountTypes: [],
            rateId: "",
            rateName: "",
            rateLabel: "",
            rates: [],
            billingId: null,
            displayName: null,
            displayNames: [],
            title: null,
            firstName: null,
            middleName: null,
            lastName: null,
            suffix: null,
            emailAddress: null,
            pin: null,
            isActive: false
        };
        this.validation = null;
        this.stateMachine = null;
        localStorage.removeItem("DataTables_columnFilteredTable_/");
    }

    getFormValid = (...args) => {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    warp(e) {
        this.setState({
            currentState: e.target.value
        });
    }

    next(desiredState) {
        let currentState = this.state.currentState;
        let nextState = this.stateMachine.transitionTo(currentState, desiredState);
        this.setState({
            currentState: nextState
        });
    }

    back(desiredState) {
        let currentState = this.state.currentState;
        let prevState = this.stateMachine.transitionFrom(currentState, desiredState);
        this.setState({
            currentState: prevState
        });
    }

    currentStep() {
        fieldValues.currentState = this.state.currentState;
        switch (this.state.currentState) {
            case states.DETAILS:
                return (<Details
                    values={fieldValues} history={this.props.history}
                    getFormValid={this.getFormValid} validation={this.validation}
                    back={this.back} next={this.next}
                />);
            case states.ADDRESSES:
                return (<Addresses
                    values={fieldValues} history={this.props.history}
                    getFormValid={this.getFormValid} validation={this.validation}
                    back={this.back} next={this.next}
                />);
            case states.PHONES:
                return (<Phones
                    values={fieldValues} history={this.props.history}
                    getFormValid={this.getFormValid} validation={this.validation}
                    back={this.back} next={this.next}
                />);
            case states.ASSOCIATIONS:
                return (<Associations
                    values={fieldValues} history={this.props.history}
                    getFormValid={this.getFormValid} validation={this.validation} sorting={false}
                    back={this.back} next={this.next}
                />);
            case states.REVIEW:
                return (<Review
                    values={fieldValues} history={this.props.history}
                    back={this.back}
                />);
            default:
                return (<Details
                    values={fieldValues} history={this.props.history}
                    getFormValid={this.getFormValid} validation={this.validation}
                    back={this.back} next={this.next}
                />);
        }
    }

    render() {
        let editMode = fieldValues.editMode;
        let name = fieldValues.displayName;
        let currentState = this.state.currentState;
        let offset = 0;
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <div className="row">
                                <div className="col-md-8 col-lg-8 col-xl-8">
                                    <h2 className="card-title">{editMode ? "Edit" : "Create"} Account{editMode ? " - " + name : ""}</h2>
                                </div>
                                <div className="col-md-4 col-lg-4 col-xl-4">
                                    <ul className="card-menu">
                                        <li className="card-menu-refresh"></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 col-lg-12 col-xl-12 stepwizard clearfix">
                                    <div className="stepwizard-row">
                                        <div className={"stepwizard-step" + (currentState > states.DETAILS ? " stepwizard-done" : "") + (currentState === states.DETAILS ? " stepwizard-current" : "")}>
                                            <button value={states.DETAILS} className={"btn" + (currentState > states.DETAILS ? " stepwizard-done" : "") + (currentState === states.DETAILS ? " stepwizard-current" : "") + " btn-circle"} onClick={this.warp} disabled={currentState > states.DETAILS ? "" : "disabled"}>{states.DETAILS - offset}</button>
                                            <p>Details</p>
                                        </div>
                                        {/*
                                        <div className={"stepwizard-step" + (currentState > states.ADDRESSES ? " stepwizard-done" : "") + (currentState === states.ADDRESSES ? " stepwizard-current" : "")}>
                                            <button value={states.ADDRESSES} className={"btn" + (currentState > states.ADDRESSES ? " stepwizard-done" : "") + (currentState === states.ADDRESSES ? " stepwizard-current" : "") + " btn-circle"} onClick={this.warp} disabled={currentState > states.ADDRESSES ? "" : "disabled"}>{states.ADDRESSES - offset}</button>
                                            <p>Addresses</p>
                                        </div>
                                        <div className={"stepwizard-step" + (currentState > states.PHONES ? " stepwizard-done" : "") + (currentState === states.PHONES ? " stepwizard-current" : "")}>
                                            <button value={states.PHONES} className={"btn" + (currentState > states.PHONES ? " stepwizard-done" : "") + (currentState === states.PHONES ? " stepwizard-current" : "") + " btn-circle"} onClick={this.warp} disabled={currentState > states.PHONES ? "" : "disabled"}>{states.PHONES - offset}</button>
                                            <p>Phone Numbers</p>
                                        </div>
                                        */}
                                        <div className={"stepwizard-step" + (currentState > states.ASSOCIATIONS ? " stepwizard-done" : "") + (currentState === states.ASSOCIATIONS ? " stepwizard-current" : "")}>
                                            <button value={states.ASSOCIATIONS} className={"btn" + (currentState > states.ASSOCIATIONS ? " stepwizard-done" : "") + (currentState === states.ASSOCIATIONS ? " stepwizard-current" : "") + " btn-circle"} onClick={this.warp} disabled={currentState > states.ASSOCIATIONS ? "" : "disabled"}>{states.ASSOCIATIONS - offset}</button>
                                            <p>Associations</p>
                                        </div>
                                        <div className={"stepwizard-step" + (currentState > states.REVIEW ? " stepwizard-done" : "") + (currentState === states.REVIEW ? " stepwizard-current" : "")}>
                                            <button value={states.REVIEW} className={"btn" + (currentState > states.REVIEW ? " stepwizard-done" : "") + (currentState === states.REVIEW ? " stepwizard-current" : "") + " btn-circle"} onClick={this.warp} disabled={currentState > states.REVIEW ? "" : "disabled"}>{states.REVIEW - offset}</button>
                                            <p>Review</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card-body">
                        {this.state.receivedData ?
                            <div className="card-block">
                                <div className="row">
                                    <div className="col-xs-12">
                                        {this.currentStep()}
                                    </div>
                                </div>
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
            </ContentPane>
        )
    }
}

class Details extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentState: fieldValues.currentState,
            accountTypeId: fieldValues.accountTypeId,
            accountTypeName: fieldValues.accountTypeName,
            accountTypes: fieldValues.accountTypes,
            rateId: fieldValues.rateId,
            rateName: fieldValues.rateName,
            rateLabel: fieldValues.rateLabel,
            rates: fieldValues.rates,
            rateOptions: [],
            billingId: fieldValues.billingId,
            displayName: fieldValues.displayName,
            displayNames: fieldValues.displayNames,
            title: fieldValues.title,
            firstName: fieldValues.firstName,
            middleName: fieldValues.middleName,
            lastName: fieldValues.lastName,
            suffix: fieldValues.suffix,
            emailAddress: fieldValues.emailAddress,
            pin: fieldValues.pin,
            isActive: fieldValues.isActive,
            typeErrors: null,
            rateErrors: null,
            billingIdErrors: null,
            displayNameErrors: null,
            titleErrors: null,
            firstNameErrors: null,
            middleNameErrors: null,
            lastNameErrors: null,
            suffixErrors: null,
            emailAddressErrors: null,
            pinErrors: null,
            apiKeyErrors: null,
            receivedData: false,
            alert: null
        };
        this.formatting = new Formatting();
        this.getFormValid = props.getFormValid.bind(this);
        this.validation = props.validation;
    }

    componentDidMount() {
        let rateOptions = [];
        let rates = this.state.rates;
        for (var i = 0; i < rates.length; i++) {
            let rate = rates[i];
            rateOptions.push({ value: rate.RateId, label: rate.RateName });
        }
        let rateLabel = fieldValues.rateLabel;
        let match = rates.find((item) => item.RateId === fieldValues.rateId);
        if (match != null) {
            rateLabel = fieldValues.rateName;
        }
        this.setState({
            rateOptions: rateOptions,
            rateLabel: rateLabel,
            receivedData: true
        });
    }

    getSelectErrors = (value, errorMsg) => {
        var errors = [];
        if (value == null || value.trim() === "") errors.push(errorMsg);
        return errors;
    }

    getBillingIdErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getDisplayNameErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && String.prototype.trim.call(value) === "") errors.push("Must contain at least 1 valid non-whitespace character.");
        if (!this.validation.patternValid(value, "^[A-Za-z0-9 _]+$", "")) errors.push("Can contain only letters, numbers, spaces, and underscores.");
        if (value != null &&!this.validation.uniqueValid(value.trim(), fieldValues.displayNames, "DisplayName")) errors.push(this.validation.uniqueInvalidMessage(value.trim()));
        return errors;
    }

    getMainNameErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getMinorNameErrors = (value) => {
        let errors = [];
        let maxLength = 50;
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getEmailErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && !this.validation.uniqueValid(value.trim(), fieldValues.accountTypes, "EmailAddress")) errors.push(this.validation.uniqueInvalidMessage(value));
        if (!this.validation.patternValid(value, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/, "")) errors.push("Must be an email address.");
        if (!this.validation.patternValid(value, /^\S+$/, "")) errors.push("Must not contain spaces.");
        return errors;
    }

    getPinErrors = (value) => {
        var errors = [];
        var maxLength = 25;
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    handleAccountTypeChange = (value) => {
        let accountTypeId = "";
        let accountTypeName = "";
        let match = fieldValues.accountTypes.find((item) => item.AccountTypeId === value);
        if (match != null) {
            accountTypeId = match.AccountTypeId;
            accountTypeName = match.AccountTypeName;
        }
        this.setState({
            accountTypeId: accountTypeId,
            accountTypeName: accountTypeName,
            typeErrors: this.getSelectErrors(accountTypeId, "Account Type is required.")
        });
    }

    handleRateChange = (value) => {
        let rateId = "";
        let rateName = "";
        let rateLabel = "";
        let match = fieldValues.rates.find((item) => item.RateId === value);
        if (match != null) {
            rateId = match.RateId;
            rateName = match.RateName;
            rateLabel = match.RateName;
        }
        this.setState({
            rateId: rateId,
            rateName: rateName,
            rateLabel: rateLabel,
            rateErrors: this.getSelectErrors(rateId, "Rate is required.")
        });
    }

    handleChange = (e) => {
        let billingIdErrors = this.state.billingIdErrors;
        let displayNameErrors = this.state.displayNameErrors;
        let titleErrors = this.state.titleErrors;
        let firstNameErrors = this.state.firstNameErrors;
        let middleNameErrors = this.state.middleNameErrors;
        let lastNameErrors = this.state.lastNameErrors;
        let suffixErrors = this.state.suffixErrors;
        let emailAddressErrors = this.state.emailAddressErrors;
        let pinErrors = this.state.pinErrors;
        let value = e.target.value;
        switch (e.target.name) {
            case "billingId":
                billingIdErrors = this.getBillingIdErrors(value);
                break;
            case "displayName":
                displayNameErrors = this.getDisplayNameErrors(value);
                break;
            case "title":
                titleErrors = this.getMinorNameErrors(value);
                break;
            case "firstName":
                firstNameErrors = this.getMainNameErrors(value);
                break;
            case "middleName":
                middleNameErrors = this.getMinorNameErrors(value);
                break;
            case "lastName":
                lastNameErrors = this.getMainNameErrors(value);
                break;
            case "suffix":
                suffixErrors = this.getMinorNameErrors(value);
                break;
            case "emailAddress":
                emailAddressErrors = this.getEmailErrors(value);
                break;
            case "pin":
                pinErrors = this.getPinErrors(value);
                break;
            default:
                break;
        }
        this.setState({
            [e.target.name]: value,
            billingIdErrors: billingIdErrors,
            displayNameErrors: displayNameErrors,
            titleErrors: titleErrors,
            firstNameErrors: firstNameErrors,
            middleNameErrors: middleNameErrors,
            lastNameErrors: lastNameErrors,
            suffixErrors: suffixErrors,
            emailAddressErrors: emailAddressErrors,
            pinErrors: pinErrors
        });
    }

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked });
    }

    handleBlur = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    back = (e) => {
        e.preventDefault();
        this.props.back(states.BASIS);
    }

    validate = (e) => {
        e.preventDefault();
        fieldValues.accountTypeId = this.state.accountTypeId;
        fieldValues.accountTypeName = this.state.accountTypeName;
        fieldValues.rateId = this.state.rateId;
        fieldValues.rateName = this.state.rateName;
        fieldValues.rateLabel = this.state.rateLabel;
        fieldValues.billingId = this.state.billingId;
        fieldValues.displayName = this.state.displayName;
        fieldValues.title = this.state.title;
        fieldValues.firstName = this.state.firstName;
        fieldValues.middleName = this.state.middleName;
        fieldValues.lastName = this.state.lastName;
        fieldValues.suffix = this.state.suffix;
        fieldValues.emailAddress = this.state.emailAddress;
        fieldValues.PIN = this.state.pin;
        fieldValues.apiKey = this.state.apiKey;
        fieldValues.isActive = this.state.isActive;
        let typeErrors = [];//this.getSelectErrors(fieldValues.accountTypeId, "Account Type is required.");
        let rateErrors = this.getSelectErrors(fieldValues.rateId, "Rate is required.");
        let billingIdErrors = this.getBillingIdErrors(fieldValues.billingId);
        let displayNameErrors = this.getDisplayNameErrors(fieldValues.displayName);
        let titleErrors = this.getMinorNameErrors(fieldValues.title);
        let firstNameErrors = this.getMainNameErrors(fieldValues.firstName);
        let middleNameErrors = this.getMinorNameErrors(fieldValues.middleName);
        let lastNameErrors = this.getMainNameErrors(fieldValues.lastName);
        let suffixErrors = this.getMinorNameErrors(fieldValues.suffix);
        let emailAddressErrors = this.getEmailErrors(fieldValues.emailAddress);
        let pinErrors = this.getPinErrors(fieldValues.PIN);
        /*
        console.log(typeErrors, rateErrors,
            billingIdErrors, displayNameErrors, titleErrors,
            firstNameErrors, middleNameErrors, lastNameErrors,
            suffixErrors, emailAddressErrors);
        */
        let formValid = this.getFormValid(typeErrors, rateErrors,
            billingIdErrors, displayNameErrors, titleErrors,
            firstNameErrors, middleNameErrors, lastNameErrors,
            suffixErrors, emailAddressErrors, pinErrors);
        if (formValid) {
            //this.props.next(states.ADDRESSES);
            this.props.next(states.ASSOCIATIONS);
        } else {
            this.setState({
                typeErrors: typeErrors,
                rateErrors: rateErrors,
                billingIdErrors: billingIdErrors,
                displayNameErrors: displayNameErrors,
                titleErrors: titleErrors,
                firstNameErrors: firstNameErrors,
                middleNameErrors: middleNameErrors,
                lastNameErrors: lastNameErrors,
                suffixErrors: suffixErrors,
                emailAddressErrors: emailAddressErrors,
                pinErrors: pinErrors
            });
        }
    }

    hideAlert = (e) => {
        this.setState({ alert: null });
    }

    render() {
        return (
            <section>
                <div className="card">
                    <fieldset>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <div><span className="danger">*</span> denotes required field<br /><br /></div>
                            </div>
                        </div>
                        {/*
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <ValidationSelect isRequired={true} receivedData={this.state.receivedData}
                                    label="Account Type:"
                                    id="accountType" name="accountType"
                                    placeholder="Select account type"
                                    valueKey="AccountTypeId" labelKey="AccountTypeName"
                                    value={this.state.accountTypeId}
                                    data={this.state.accountTypes}
                                    validation={this.validation} errors={this.state.typeErrors}
                                    handleChange={this.handleAccountTypeChange} handleBlur={this.handleBlur} />
                            </div>
                        </div>
                        */}
                        <div className="row">
                            <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                <ValidationSelect isRequired={true} receivedData={this.state.receivedData}
                                    label="Rate:"
                                    id="rate" name="rate"
                                    placeholder="Select rate"
                                    valueKey="value" labelKey="label"
                                    value={this.state.rateId}
                                    data={this.state.rateOptions}
                                    validation={this.validation} errors={this.state.rateErrors}
                                    handleChange={this.handleRateChange} handleBlur={this.handleBlur} />
                            </div>
                            <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                <button className="btn btn-info ft-info pull-left" data-toggle="modal" data-target="#rateInfoModal" style={{ marginTop: '1.75em' }} />
                                <div>
                                    <div className="modal fade text-xs-left in" id="rateInfoModal" tabIndex="-1" role="dialog" aria-labelledby="rateInfoLabel" style={{ display: 'none' }} aria-hidden={true}>
                                        <div className="modal-dialog modal-lg" role="document">
                                            <div className="modal-content">
                                                <div className="modal-header">
                                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                                        <span aria-hidden="true">×</span>
                                                    </button>
                                                    <h4 className="modal-title" id="rateInfoLabel">Rate Info</h4>
                                                </div>
                                                <div className="modal-body">
                                                    <RateInfo
                                                        options={this.state.rates} index={this.state.rateId}
                                                        orientation="vertical"
                                                        formatting={this.formatting} currencySymbol="$" />
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="button" className="btn grey btn-outline-secondary" data-dismiss="modal">Close</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <ValidationInput label="Billing Id:" isRequired={true}
                                    name="billingId" value={this.state.billingId}
                                    validation={this.validation} errors={this.state.billingIdErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                <ValidationInput label="Display Name:" isRequired={true} readOnly={fieldValues.editMode}
                                    name="displayName" value={this.state.displayName}
                                    validation={this.validation} errors={this.state.displayNameErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                <ValidationInput label="Title:" isRequired={false}
                                    name="title" value={this.state.title}
                                    validation={this.validation} errors={this.state.titleErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                            <div className="col-sm-8 col-md-8 col-lg-8 col-xl-8">
                                <ValidationInput label="First Name:" isRequired={true}
                                    name="firstName" value={this.state.firstName}
                                    validation={this.validation} errors={this.state.firstNameErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                <ValidationInput label="Middle Name:" isRequired={false}
                                    name="middleName" value={this.state.middleName}
                                    validation={this.validation} errors={this.state.middleNameErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                            <div className="col-sm-8 col-md-8 col-lg-8 col-xl-8">
                                <ValidationInput label="Last Name:" isRequired={true}
                                    name="lastName" value={this.state.lastName}
                                    validation={this.validation} errors={this.state.lastNameErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                <ValidationInput label="Suffix:" isRequired={false}
                                    name="suffix" value={this.state.suffix}
                                    validation={this.validation} errors={this.state.suffixErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                            <div className="col-sm-8 col-md-8 col-lg-8 col-xl-8">
                                <ValidationInput label="Email Address:" isRequired={true}
                                    name="emailAddress" value={this.state.emailAddress}
                                    validation={this.validation} errors={this.state.emailAddressErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-8 col-md-8 col-lg-8 col-xl-8">
                                <ValidationInput label="PIN:" isRequired={false}
                                    name="pin" value={this.state.pin}
                                    validation={this.validation} errors={this.state.pinErrors}
                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                            </div>
                            <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xl-12 col-lg-12 col-md-12 mb-1">
                                <div className="form-group">
                                    <label className="inline custom-control custom-checkbox block">
                                        <input type="checkbox" className="custom-control-input" id="isActive" name="isActive" checked={this.state.isActive} onChange={this.handleCheckboxChange} />
                                        <span className="custom-control-indicator"></span>
                                        <span className="custom-control-description ml-0">Active</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                    <div className="pull-right">
                        <button className="btn btn-primary ml-1" onClick={this.validate}>Next</button>
                    </div>
                </div>
                {this.state.alert}
            </section>
        )
    }
}

class Addresses extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addresses: fieldValues.addresses,
            listErrors: null,
            showSummaryErrors: false,
            receivedData: true,
            alert: null
        };
        this.getFormValid = props.getFormValid.bind(this);
        this.validation = props.validation;
    }

    handleUpdates = (addresses, listErrors) => {
        //console.log("addresses = ", addresses);
        //console.log("listErrors = ", listErrors);
        this.setState({
            addresses: addresses,
            listErrors: listErrors
        });
    }

    back = (e) => {
        e.preventDefault();
        this.props.back(states.DETAILS);
    }

    validate = (e) => {
        //console.log("this.state.listErrors = ", this.state.listErrors);
        let formValid = this.getFormValid(this.state.listErrors.addressesErrors);
        if (formValid) {
            fieldValues.addresses = this.state.addresses;
            this.props.next(states.PHONES);
        } else {
            this.setState({
                showSummaryErrors: true
            });
        }
    }

    render() {
        return (
            <section>
                <div className="card">
                    <div className="card-body">
                        {this.state.receivedData ?
                            <AddressInputList editMode={fieldValues.editMode} accountId={fieldValues.accountId}
                                data={this.state.addresses}
                                showSummaryErrors={this.state.showSummaryErrors}
                                handleUpdates={this.handleUpdates} />
                            :
                            <div className="card-block offset-lg-5 offset-md-5">
                                <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                <span className="sr-only">Loading...</span>
                            </div>
                        }
                    </div>
                    <div className="pull-right">
                        <button className="btn btn-default" onClick={this.back}>Back</button>
                        <button className="btn btn-primary ml-1" onClick={this.validate}>Next</button>
                    </div>
                </div>
                {this.state.alert}
            </section>
        )
    }
}

class Phones extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phones: fieldValues.phones,
            listErrors: null,
            showSummaryErrors: false,
            receivedData: true,
            alert: null
        };
        this.getFormValid = props.getFormValid.bind(this);
        this.validation = props.validation;
    }

    handleUpdates = (phones, listErrors) => {
        //console.log("phones = ", phones);
        //console.log("listErrors = ", listErrors);
        this.setState({
            phones: phones,
            listErrors: listErrors
        });
    }

    back = (e) => {
        e.preventDefault();
        this.props.back(states.ADDRESSES);
    }

    validate = (e) => {
        //console.log("this.state.listErrors = ", this.state.listErrors);
        let formValid = this.getFormValid(this.state.listErrors.phonesErrors);
        if (formValid) {
            fieldValues.phones = this.state.phones;
            this.props.next(states.ASSOCIATIONS);
        } else {
            this.setState({
                showSummaryErrors: true
            });
        }
    }

    render() {
        return (
            <section>
                <div className="card">
                    <div className="card-body">
                        {this.state.receivedData ?
                            <PhoneNumberInputList editMode={fieldValues.editMode} accountId={fieldValues.accountId}
                                data={this.state.phones}
                                showSummaryErrors={this.state.showSummaryErrors}
                                handleUpdates={this.handleUpdates} />
                            :
                            <div className="card-block offset-lg-5 offset-md-5">
                                <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                <span className="sr-only">Loading...</span>
                            </div>
                        }
                    </div>
                    <div className="pull-right">
                        <button className="btn btn-default" onClick={this.back}>Back</button>
                        <button className="btn btn-primary ml-1" onClick={this.validate}>Next</button>
                    </div>
                </div>
                {this.state.alert}
            </section>
        )
    }
}

class Associations extends React.Component {
    constructor(props) {
        super(props);
        this.services = {
            TWILIO: "Twilio",
            TELYNX: "Telnyx",
            SENDGRID: "SendGrid"
        };
        this.faxFormats = {
            TIFF: "image/tiff",
            PDF: "application/pdf"
        };
        this.authTypes = authTypes;
        this.faxServiceTypes = faxServiceTypes;
        this.state = {
            account: fieldValues.account,
            associations: fieldValues.associations,
            associationsOld: fieldValues.associations,
            associationNumbers: fieldValues.associationNumbers,
            webhookAuthTypeOptions: null,
            receiveFaxFormatOptions: null,
            faxServiceTypesOptions:null,
            selectAll: [],
            editing: this.addNewRow(),
            useInbound: false,
            showWebhookPassword: false,
            errors: [],
            summaryErrors: [],
            receivedData: false,
            alert: null
        }
        this.getFormValid = props.getFormValid.bind(this);
        this.validation = props.validation;
    }

    componentDidMount() {
        let messageServiceOptions = [
            { label: this.services.TWILIO, value: this.services.TWILIO }
        ];
        let voiceServiceOptions = [
            { label: this.services.TWILIO, value: this.services.TWILIO }
        ];
        let faxServiceOptions = [
            { label: this.services.TWILIO, value: this.services.TWILIO }
        ];
        let emailServiceOptions = [
            { label: this.services.SENDGRID, value: this.services.SENDGRID }
        ];
        let webhookAuthTypeOptions = [
            { label: "None", value: this.authTypes.NONE },
            { label: this.authTypes.X509CERTIFICATE, value: this.authTypes.X509CERTIFICATE },
            { label: this.authTypes.CREDENTIALS, value: this.authTypes.CREDENTIALS }
        ];
        let receiveFaxFormatOptions = [
            { label: "Tiff", value: this.faxFormats.TIFF },
            { label: "Pdf", value: this.faxFormats.PDF }
        ];
        let faxServiceTypesOptions = [
            { label: "Twilio", value: this.services.TWILIO },
            { label: "Telnyx", value: this.services.TELYNX }
        ];
        this.setState({
            messageServiceOptions: messageServiceOptions,
            voiceServiceOptions: voiceServiceOptions,
            faxServiceOptions: faxServiceOptions,
            emailServiceOptions: emailServiceOptions,
            webhookAuthTypeOptions: webhookAuthTypeOptions,
            receiveFaxFormatOptions: receiveFaxFormatOptions,
            faxServiceTypesOptions: faxServiceTypesOptions,
            selectAll: this.getSelectAll(),
            receivedData: true
        });
    }

    getIndex = (arr, prop, val) => {
        var index = -1;
        for (var i = 0; i < arr.length; i++) {
            var id = arr[i][prop];
            if (!(typeof id === "undefined") && id === val) {
                index = i;
                break;
            }
        }
        return index;
    }

    getRequiredErrors = (value) => {
        let errors = [];
        let minLength = 1;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        return errors;
    }

    getAssociationNumberErrors = (value) => {
        let errors = [];
        let arr = (value || "").split("!!!", 2);
        let id = null;
        if (arr.length > 1) {
            value = arr[0];
            id = arr[1];
        }
        errors = this.getAssociationNumberBaseErrors(value);
        if (value != null && id != null) {
            let match = fieldValues.associations.find((item) => { return item.AssociationId === id });
            if (match != null) {
                let exists = fieldValues.associations.some((item) => { return item.AssociationNumber === value && item.AssociationId !== id });
                if (exists) errors.push(this.validation.uniqueInvalidMessage(value.trim()));
            }
        }
        return errors;
    }

    getAssociationNumberBaseErrors = (value) => {
        let errors = [];
        if (!this.validation.patternValid(value, /^\+?[1-9][0-9]{1,14}$/, "")) errors.push("Must be a valid E.164 number.");
        if (value != null && !this.validation.uniqueValid(value.trim(), fieldValues.associationNumbers, "AssociationNumber")) errors.push(this.validation.uniqueInvalidMessage(value.trim()));
        return errors;
    }

    getAuthKeyErrors = (value) => {
        let errors = [];
        let minLength = 20, maxLength = 20;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.patternValid(value, /^[A-Za-z0-9-_+/=]*$/, "")) errors.push("Must be an auth key.");
        return errors;
    }

    getAssociationBillingIdErrors = (value) => {
        let errors = [];
        let minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getDescriptionErrors = (value) => {
        let errors = [];
        let maxLength = 100;
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getReceiveFaxFormatErrors = (value) => {
        let errors = [];
        if (value != null && !this.state.receiveFaxFormatOptions.some(item => item.value === value)) errors.push("Must be a receive fax format.")
        return errors;
    }

    getFaxServiceTypeErrors = (value) => {
        let errors = [];
        if (value != null && !this.state.faxServiceTypesOptions.some(item => item.value === value)) errors.push("Must be a fax service type.")
        return errors;
    }

    getUrlErrors = (value) => {
        let errors = [];
        let maxLength = 500;
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && value.trim() !== "" && !this.validation.uriValid(value)) errors.push(this.validation.uriInvalidMessage(value));
        return errors;
    }

    getWebhookAuthTypeErrors = (value) => {
        let errors = [];
        let maxLength = 30;
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && !this.state.webhookAuthTypeOptions.some(item => item.value === value)) errors.push("Must be a webhook auth type.")
        return errors;
    }

    getWebhookUsernameErrors = (obj) => {
        let errors = [];
        if (obj == null) errors.push("Must have a non-null parent object");
        if (obj.WebhookAuthType !== authTypes.CREDENTIALS && obj.WebhookAuthType !== authTypes.X509CERTIFICATE) return errors;
        let value = obj.WebhookUsername;
        let minLength = 1, maxLength = 30;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getWebhookPasswordErrors = (obj) => {
        let errors = [];
        if (obj == null) errors.push("Must have a non-null parent object");
        if (obj.WebhookAuthType !== authTypes.CREDENTIALS) return errors;
        let value = obj.WebhookPassword;
        let minLength = 1, maxLength = 50;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getWebhookApiKeyErrors = (obj) => {
        let errors = [];
        if (obj == null) errors.push("Must have a non-null parent object");
        if (obj.WebhookAuthType !== authTypes.X509CERTIFICATE) return errors;
        let value = obj.WebhookApiKey;
        let minLength = 1, maxLength = 25;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getSummaryErrors = () => {
        let summaryErrors = [];
        let minLength = 1;
        let errors = this.state.errors;
        if (!this.validation.arrayLengthMinValid(fieldValues.associations, minLength)) summaryErrors.push(this.validation.arrayLengthMinInvalidMessage(minLength));
        if (errors != null && errors.length > 0) summaryErrors.push("All items listed must be valid.");
        return summaryErrors;
    }

    getFieldErrors = (arr, idExtra, idProp, prop, f) => {
        arr = arr == null ? [] : arr;
        var errors = [];
        for (var i = 0; i < arr.length; i++) {
            let item = arr[i];
            let id = item[idProp] + idExtra;
            let value = (prop != null) ? item[prop] : item;
            errors = this.updateErrors(errors, id, value, f);
        }
        return errors;
    }

    updateErrors = (arr, id, value, f) => {
        arr = arr == null ? [] : arr;
        let errors = f(value);
        if (errors.length > 0) {
            arr[id] = errors;
        } else {
            delete arr[id];
        }
        return arr;
    }

    compileListErrors = () => {
        let errors = [];
        errors.push(this.getFieldErrors(fieldValues.associations, ".AssociationNumber", "AssociationId", "AssociationNumber", this.getAssociationNumberErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".AuthKey", "AssociationId", "AuthKey", this.getAuthKeyErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".AssociationBillingId", "AssociationId", "AssociationBillingId", this.getAssociationBillingIdErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".Description", "AssociationId", "Description", this.getDescriptionErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".WebhookUrl", "AssociationId", "WebhookUrl", this.getUrlErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".WebhookAuthType", "AssociationId", "WebhookAuthType", this.getWebhookAuthTypeErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".WebhookUsername", "AssociationId", null, this.getWebhookUsernameErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".WebhookPassword", "AssociationId", null, this.getWebhookPasswordErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".WebhookApiKey", "AssociationId", null, this.getWebhookApiKeyErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".ReceiveFaxFormat", "AssociationId", "ReceiveFaxFormat", this.getReceiveFaxFormatErrors));
        errors.push(this.getFieldErrors(fieldValues.associations, ".FaxService", "AssociationId", "FaxService", this.getFaxServiceTypeErrors));
        let summaryErrors = this.getSummaryErrors(errors);
        let listErrors = {
            errors: errors,
            summaryErrors: summaryErrors
        };
        //console.log("listErrors = ", listErrors);
        return listErrors;
    }

    handleSelect = (e) => {
        let type = e.target.getAttribute("data-type");
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        let assoc = fieldValues.associations.find(assoc => assoc.AssociationId === row.AssociationId);
        assoc[type] = checked;
        if (type === "AllowSMS") assoc["AllowMMS"] = checked;
        var obj = document.getElementById(e.target.id);
        if (obj != null) {
            obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
        }
        let allSelected = this.areAllSelected(type);
        var objAll = document.getElementById(type + "All");
        if (objAll != null) {
            objAll.className = allSelected ? "fa fa-check-square-o" : "fa fa-square-o";
        }
    }

    handleSelectMutuallyExclusive = (e) => {
        let type = e.target.getAttribute("data-type");
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let other = JSON.parse(e.target.getAttribute("data-other"));
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        let assoc = fieldValues.associations.find(assoc => assoc.AssociationId === row.AssociationId);
        assoc[type] = checked;
        let obj = document.getElementById(e.target.id);
        if (obj != null) {
            obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
        }
        if (checked) {
            assoc[other.field] = !checked;
            let objOther = document.getElementById(other.id);
            if (objOther != null) {
                objOther.className = !checked ? "fa fa-check-square-o" : "fa fa-square-o";
            }
        }
    }

    handleSelectAll = (e) => {
        let type = e.target.getAttribute("data-type");
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        for (var i = 0; i < fieldValues.associations.length; i++) {
            fieldValues.associations[i][type] = checked;
            var obj = document.getElementById(e.target.id);
            if (obj != null) {
                obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
            }
        }
        // verify
        let allSelected = this.areAllSelected(type);
        var objAll = document.getElementById(e.target.id);
        if (objAll != null) {
            objAll.className = allSelected ? "fa fa-check-square-o" : "fa fa-square-o";
        }
        let selectAll = this.state.selectAll;
        selectAll[e.target.id] = allSelected;
        this.setState({
            selectAll: selectAll
        });
    }

    getSelectAll = () => {
        let selectAll = [];
        selectAll["AllowSMSAll"] = this.areAllSelected("AllowSMS");
        selectAll["AllowVoiceAll"] = this.areAllSelected("AllowVoice");
        selectAll["AllowFaxAll"] = this.areAllSelected("AllowFax");
        selectAll["AllowEmailAll"] = this.areAllSelected("AllowEmail");
        selectAll["AllowVideoAll"] = this.areAllSelected("AllowVideo");
        selectAll["IsActiveAll"] = this.areAllSelected("IsActive");
        return selectAll;
    }

    areAllSelected = (type) => {
        return !(fieldValues.associations.some((item) => { return !item[type]; }));
    }

    addNewRow = () => {
        let selectAll = this.getSelectAll();
        let newRow = {
            AssociationId: uuidv4(), AccountId: fieldValues.accountId,
            AssociationNumber: null,
            AuthKey: null,
            AssociationBillingId: null,
            Description: "",
            MessageService: this.services.TWILIO,
            VoiceService: this.services.TWILIO,
            FaxService: this.services.TELYNX,
            EmailService: this.services.SENDGRID,
            WebhookUrl: "",
            WebhookAuthType: this.authTypes.NONE,
            WebhookUsername: null,
            WebhookPassword: null,
            WebhookApiKey: null,
            ReceiveFaxFormat: this.faxFormats.PDF,
            AllowSMS: selectAll["AllowSMSAll"],
            AllowVoice: selectAll["AllowVoiceAll"],
            AllowFax: selectAll["AllowFaxAll"],
            AllowEmail: selectAll["AllowEmailAll"],
            AllowVideo: selectAll["AllowVideoAll"],
            IsActive: selectAll["IsActiveAll"]
        }
        if (fieldValues.associations.length < 1) {
            // mutually exclusive
            newRow.AllowVoice = false;
            newRow.AllowFax = true;
        }
        return newRow;
    }

    handleAddNewRow = (e) => {
        let newRow = this.addNewRow();
        this.setState({
            editing: newRow
        });
    }

    handleSaveRow = (e) => {
        let associationsOld = fieldValues.associations;
        let associations = fieldValues.associations;
        let editing = this.cleanupWebhookAuth(this.state.editing);
        let errors = this.state.errors;
        let summaryErrors = this.state.summaryErrors;
        let index = editing.AssociationId;
        errors[index] = this.updateErrors(errors[index], "AssociationNumber", editing.AssociationNumber + "!!!" + index, this.getAssociationNumberErrors);
        errors[index] = this.updateErrors(errors[index], "AuthKey", editing.AuthKey, this.getAuthKeyErrors);
        errors[index] = this.updateErrors(errors[index], "AssociationBillingId", editing.AssociationBillingId, this.getAssociationBillingIdErrors);
        errors[index] = this.updateErrors(errors[index], "Description", editing.Description, this.getDescriptionErrors);
        errors[index] = this.updateErrors(errors[index], "WebhookUrl", editing.WebhookUrl, this.getUrlErrors);
        errors[index] = this.updateErrors(errors[index], "WebhookAuthType", editing.WebhookAuthType, this.getWebhookAuthTypeErrors);
        errors[index] = this.updateErrors(errors[index], "WebhookUsername", editing, this.getWebhookUsernameErrors);
        errors[index] = this.updateErrors(errors[index], "WebhookPassword", editing, this.getWebhookPasswordErrors);
        errors[index] = this.updateErrors(errors[index], "WebhookApiKey", editing, this.getWebhookApiKeyErrors);
        errors[index] = this.updateErrors(errors[index], "ReceiveFaxFormat", editing.ReceiveFaxFormat, this.getReceiveFaxFormatErrors);
        errors[index] = this.updateErrors(errors[index], "FaxService", editing.FaxService, this.getFaxServiceTypeErrors);
        //console.log("errors['" + index + "'] = ", errors[index]);
        if (Object.keys(errors[index]).length < 1) {
            let exisitngIndex = this.getIndex(associations, "AssociationId", editing.AssociationId);
            if (exisitngIndex > -1) {
                associations[exisitngIndex] = editing;
            } else {
                associations.push(editing);
            }
            fieldValues.associations = associations;
        }
        editing = JSON.parse(JSON.stringify(editing)); // cloned, not referenced
        let listErrors = this.compileListErrors();
        this.setState({
            associations: fieldValues.associations,
            associationsOld: associationsOld,
            editing: editing,
            selectAll: this.getSelectAll(),
            errors: errors,
            summaryErrors: summaryErrors == null ? summaryErrors : listErrors.summaryErrors 
        });
    }

    handleRemove = (e) => {
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let associations = fieldValues.associations;
        let index = this.getIndex(associations, "AssociationId", row.AssociationId);
        if (index > -1) {
            associations.splice(index, 1);
        }
        fieldValues.associations = associations;
        this.setState({
            associations: associations
        });
    }

    handleRemoveAll = (e) => {
        let associations = fieldValues.associations;
        associations.splice(0);
        fieldValues.associations = associations;
        this.setState({
            associations: associations
        });
    }

    handleAuthKeyChange = (e) => {
        let confirm = JSON.parse(e.target.getAttribute("data-value"))
        let subject = "Auth Key";
        let magicWord = Captcha(5);
        let note = fieldValues.editMode ? "This will update the selected " + subject.toLocaleLowerCase() + ".\n\n" : "";
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
                    onConfirm={(e) => this.receiveInput(confirm.payload, e, magicWord, confirm.action, confirm.verb)}
                    onCancel={this.hideAlert.bind(this)}
                >
                    {text}
                </SweetAlert>
            )
        });
    }

    receiveInput = (payload, text, magicWord, action, verb) => {
        if (text === magicWord) {
            let apiBaseUrl = Configuration().apiUrl;
            let route = "/api/Associations/";
            let method = action != null && action.substring(0, 3).toLocaleUpperCase() === "GET" ? "GET" : "";
            let subject = "Auth Key";
            let callback = verb === "Add" ? this.setNewAuthKey(payload.id) : this.setAuthKey(null, payload.id);
            let apiActions = new ApiActions();
            switch (method.toUpperCase()) {
                case "GET":
                    apiActions.performGet(apiBaseUrl, route, action, payload, subject, verb, callback);
                    break;
                case "POST":
                    apiActions.performPost(apiBaseUrl, route, action, payload, subject, verb, callback);
                    break;
                default:
                    this.setAuthKey(null, payload.id);
                    break;
            }
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

    setNewAuthKey = (id) => {
        let authKey = null;
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Associations/NewAuthKey')
            .then((response) => {
                SetAuthorizationToken(response.headers.token);
                authKey = JSON.parse(response.data);
                this.setAuthKey(authKey, id);
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error);
            });
    }

    setAuthKey = (value, id) => {
        let errors = this.state.errors;
        errors[id] = this.updateErrors(errors[id], "AuthKey", value, this.getAuthKeyErrors);
        let editing = this.state.editing;
        editing.AuthKey = value;
        let listErrors = this.compileListErrors();
        let summaryErrors = this.state.summaryErrors;
        this.setState({
            editing: editing,
            errors: errors,
            summaryErrors: summaryErrors == null ? summaryErrors : listErrors.summaryErrors,
            alert: null
        });
    }

    handleWebhookAuthTypeChange = (value, id) => {
        let editing = this.state.editing;
        let errors = this.state.errors;
        let match = this.state.webhookAuthTypeOptions.find((item) => item.value === value);
        if (match != null) {
            editing.WebhookAuthType = value.trim();
            if (editing.WebhookAuthType === this.authTypes.X509CERTIFICATE) editing.WebhookUsername = "N/A";
            if (editing.WebhookAuthType === this.authTypes.NONE) {
                let index = editing.AssociationId;
                errors[index] = this.updateErrors(errors[index], "WebhookUsername", editing, this.getWebhookUsernameErrors);
                errors[index] = this.updateErrors(errors[index], "WebhookApiKey", editing, this.getWebhookApiKeyErrors);
                errors[index] = this.updateErrors(errors[index], "WebhookPassword", editing, this.getWebhookPasswordErrors);
            }
        }
        this.setState({
            editing: editing,
            errors: errors
        });
    }

    handleReceiveFaxFormatChange = (value, id) => {
        let editing = this.state.editing;
        let match = this.state.receiveFaxFormatOptions.find((item) => item.value === value);
        if (match != null) {
            editing.ReceiveFaxFormat = value.trim();
        }
        this.setState({
            editing: editing
        });
    }

    handleFaxServiceTypeChange = (value, id) => {
        let editing = this.state.editing;
        let match = this.state.faxServiceTypesOptions.find((item) => item.value === value);
        if (match != null) {
            editing.FaxService = value.trim();

            if (editing.FaxService === this.faxServiceTypes.TWILIO)
                editing.ReceiveFaxFormat = this.faxFormats.TIFF;
            else if (editing.FaxService === this.faxServiceTypes.TELNYX)
                editing.ReceiveFaxFormat = this.faxFormats.PDF;
        }
        this.setState({
            editing: editing
        });
    }

    toggleWebhookPasswordVisibility = () => {
        this.setState({
            showWebhookPassword: !this.state.showWebhookPassword
        });
    }

    testWebhook = () => {
        let test = this.state.editing
        if ((test.WebhookUrl || "") === "") return true;
        if (test.WebhookAuthType !== this.authTypes.CREDENTIALS) return true;

        let payload = {
            Username: test.WebhookUsername,
            Password: test.WebhookApiKey
        };
        let apiBaseUrl = test.WebhookUrl;
        axios.post(apiBaseUrl + '/SendKey/Auth', payload)
            .then((response) => {
                if (response != null && response.status === 200 && response.data != null) {
                    return true;
                }
                return false;
            })
            .catch((error) => {
                console.log(error);
                let title = "Webhook Test"
                let message = "Authentication call to Webhook Url failed.";
                this.setState({
                    alert: (
                        <SweetAlert danger title={title} onConfirm={this.hideAlert}>
                            {message}
                        </SweetAlert>
                    )
                });
                return false;
            });
    }

    cleanupWebhookAuth = (obj) => {
        switch (obj.WebhookAuthType) {
            case this.authTypes.NONE:
                obj.WebhookApiKey = "";
                obj.WebhookPassword = "";
                break;
            case this.authTypes.X509CERTIFICATE:
                obj.WebhookPassword = "";
                break;
            case this.authTypes.CREDENTIALS:
                obj.WebhookApiKey = "";
                break;
            default:
                break;
        }
        return obj;
    }

    hideAlert = (e) => {
        this.setState({ alert: null });
    }

    handleChange = (e) => {
        let editing = this.state.editing;
        let errors = this.state.errors;
        let index = e.target.id.replace("." + e.target.name, "");
        let value = e.target.value;
        let testValue = e.target.value;
        let f = () => { };
        switch (e.target.name) {
            case "AssociationNumber":
                f = this.getAssociationNumberErrors;
                testValue = value + "!!!" + index;
                break;
            case "AuthKey":
                f = this.getAuthKeyErrors;
                break;
            case "AssociationBillingId":
                f = this.getAssociationBillingIdErrors;
                break;
            case "Description":
                f = this.getDescriptionErrors;
                break;
            case "WebhookUrl":
                f = this.getUrlErrors;
                break;
            case "WebhookUsername":
                f = this.getWebhookUsernameErrors;
                testValue = editing;
                break;
            case "WebhookPassword":
                f = this.getWebhookPasswordErrors;
                testValue = editing;
                break;
            case "WebhookApiKey":
                f = this.getWebhookApiKeyErrors;
                testValue = editing;
                break;
            default:
                break;
        }
        editing[e.target.name] = value;
        errors[index] = this.updateErrors(errors[index], e.target.name, testValue, f);
        let listErrors = this.compileListErrors();
        let summaryErrors = this.state.summaryErrors;
        this.setState({
            editing: editing,
            errors: errors,
            summaryErrors: summaryErrors == null ? summaryErrors : listErrors.summaryErrors
        });
    }

    handleBlur = (e) => {
        this.setState({
            [e.target.name]: e.target.value.trim()
        });
    }

    back = (e) => {
        e.preventDefault();
        //this.props.back(states.PHONES);
        this.props.back(states.DETAILS);
    }

    validate = (e) => {
        e.preventDefault();
        let listErrors = this.compileListErrors();
        let formValid = this.getFormValid(listErrors.summaryErrors);
        if (formValid) {
            this.props.next(states.REVIEW);
        } else {
            this.setState({
                errors: listErrors.errors,
                summaryErrors: listErrors.summaryErrors
            });
        }
    }

    render() {
        let editing = this.state.editing;
        let errors = this.state.errors;
        let summaryErrors = this.state.summaryErrors;
        let data = fieldValues.associations;

        let showWebhookPassword = this.state.showWebhookPassword;

        let hasAuthKey = editing.AuthKey != null && editing.AuthKey.trim() !== "" ? true : false;
        let obj = {};
        if (hasAuthKey) {
            obj.verb = "Remove";
            obj.action = "RemoveAuthKey";
            obj.method = "POST";
        } else {
            obj.verb = "Add";
            obj.action = "NewAuthKey";
            obj.method = "GET";
        }
        obj.payload = {
            id: editing.AssociationId
        }

        const columns = [
            {
                Header: "Number",
                accessor: "AssociationNumber"
            },
            {
                Header: "Auth Key",
                accessor: "AuthKey"
            },
            {
                Header: "Billing Id",
                accessor: "AssociationBillingId"
            },
            {
                Header: "Description",
                accessor: "Description"
            },
            /*
            {
                Header: "Default Fax Format",
                accessor: "ReceiveFaxFormat"
            },
            */
            {
                Header: "Wbhk Url",
                accessor: "WebhookUrl"
            },
            {
                Header: "Wbhk Auth Type",
                accessor: "WebhookAuthType"
            },
            {
                Header: "Wbhk Username",
                accessor: "WebhookUsername"
            },
            {
                Header: "Wbhk Pwd",
                accessor: "WebhookPassword",
                Cell: props => (
                    props.original.WebhookPassword != null &&
                    props.original.WebhookPassword.trim() !== "" &&
                    props.original.WebhookAuthType === authTypes.CREDENTIALS
                ) ?
                    <span>**********</span> :
                    ""
            },
            {
                Header: "Wbhk ApiKey",
                accessor: "WebhookApiKey"
            },
            {
                Header: "Msg"

                //props => <div>
                //    <i id="AllowSMSAll" name="AssociationSelectedAll"
                //        className={this.state.selectAll["AllowSMSAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                //        onClick={this.handleSelectAll}
                //        data-type="AllowSMS"
                //        aria-hidden="true"></i>
                //    <span>&nbsp;Msg</span>
                //</div>

                ,
                accessor: "AllowSMS",
                style: { textAlign: "center" },
                Cell: props => <div style={{ display: props.original.FaxService === this.faxServiceTypes.TWILIO ? "block" : "none" }}>
                    <i id={"assoc_sms_" + props.original.AssociationId}
                        name="AssociationSelected"
                        className={props.original.AllowSMS ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelect}
                        data-value={JSON.stringify(props.original)} data-type="AllowSMS"
                        aria-hidden="true"></i>
                </div>
            },
            {
                Header: "Voice",
                accessor: "AllowVoice",
                style: { textAlign: "center" },
                Cell: props => <div style={{ display: props.original.FaxService === this.faxServiceTypes.TWILIO ? "block" : "none" }}>
                    <i id={"assoc_voice_" + props.original.AssociationId}
                        name="AssociationSelected"
                        className={props.original.AllowVoice ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelectMutuallyExclusive}
                        data-value={JSON.stringify(props.original)} data-type="AllowVoice"
                        data-other={JSON.stringify({ field: "AllowFax", id: "assoc_fax_" + props.original.AssociationId })}
                        aria-hidden="true"></i>
                </div>
            },
            {
                Header: "Fax",
                accessor: "AllowFax",
                style: { textAlign: "center" },
                Cell: props => <div>
                    <i id={"assoc_fax_" + props.original.AssociationId}
                        name="AssociationSelected"
                        className={props.original.AllowFax ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelectMutuallyExclusive}
                        data-value={JSON.stringify(props.original)} data-type="AllowFax"
                        data-other={JSON.stringify({ field: "AllowVoice", id: "assoc_voice_" + props.original.AssociationId })}
                        aria-hidden="true"></i>
                </div>
            },
            {
                Header: "Fax Service",
                accessor: "FaxService",
                style: { textAlign: "center" },
            },
            {
                Header: "Email"

                //    props => <div>
                //    <i id="AllowEmailAll" name="AssociationSelectedAll"
                //        className={this.state.selectAll["AllowEmailAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                //        onClick={this.handleSelectAll}
                //        data-type="AllowEmail"
                //        aria-hidden="true"></i>
                //    <span>&nbsp;Email</span>
                //</div>


                ,
                accessor: "AllowEmail",
                style: { textAlign: "center" },
                Cell: props => <div style={{ display: props.original.FaxService === this.faxServiceTypes.TWILIO  ? "block" : "none" }}>
                    <i id={"assoc_email_" + props.original.AssociationId} 
                        name="AssociationSelected"
                        className={props.original.AllowEmail ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelect}
                        data-value={JSON.stringify(props.original)} data-type="AllowEmail"
                        aria-hidden="true"></i>
                </div>
            },
            {
                Header: "Video"
                //    props => <div>
                //    <i id="AllowVideoAll" name="AssociationSelectedAll"
                //        className={this.state.selectAll["AllowVideoAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                //        onClick={this.handleSelectAll}
                //        data-type="AllowVideo"
                //        aria-hidden="true"></i>
                //    <span>&nbsp;Video</span>
                //</div>
                ,
                accessor: "AllowVideo",
                style: { textAlign: "center" },
                Cell: props => <div style={{ display: props.original.FaxService === this.faxServiceTypes.TWILIO ? "block" : "none" }}>
                    <i id={"assoc_video_" + props.original.AssociationId}
                        name="AssociationSelected"
                        className={props.original.AllowVideo ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelect}
                        data-value={JSON.stringify(props.original)} data-type="AllowVideo"
                        aria-hidden="true"></i>
                </div>
            },
            {
                Header: props => <div>
                    <i id="IsActiveAll" name="AssociationSelectedAll"
                        className={this.state.selectAll["IsActiveAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelectAll}
                        data-type="IsActive"
                        aria-hidden="true"></i>
                    <span>&nbsp;Active</span>
                </div>,
                accessor: "IsActive",
                style: { textAlign: "center" },
                Cell: props => <div>
                    <i id={"assoc_active_" + props.original.AssociationId}
                        name="AssociationSelected"
                        className={props.original.IsActive ? "fa fa-check-square-o" : "fa fa-square-o"}
                        onClick={this.handleSelect}
                        data-value={JSON.stringify(props.original)} data-type="IsActive"
                        aria-hidden="true"></i>
                </div>
            },
            {
                Header: props => <div>
                    <i id="RemoveAll" name="RemoveSelectedAll"
                        className={"fa fa-trash"}
                        onClick={this.handleRemoveAll}
                        data-type="DeleteAll"
                        aria-hidden="true"></i>
                    <span>&nbsp;</span>
                </div>,
                accessor: "AssociationId",
                style: { textAlign: "center" },
                Cell: props => <div>
                    <i id={"assoc_delete_" + props.original.AssociationId}
                        name="AssociationSelected"
                        className="fa fa-trash"
                        onClick={this.handleRemove}
                        data-value={JSON.stringify(props.original)} data-type="Delete"
                        aria-hidden="true"></i>
                </div>
            }
        ];
        return (
            <section>
                <div className="card">
                    <div className="card-body">
                        {this.state.receivedData ?
                            <div className="card-block">
                                <section>
                                    <div>
                                        <p>Please provide the numbers, information, and options you want to associate with the account. Associated numbers should follow the <a href="https://www.itu.int/rec/T-REC-E.164/en" target="_blank" rel="noopener noreferrer">E.164</a> format [+][country code][subscriber number including area code] (e.g. +18001234567 or +13165551234).</p>
                                        <fieldset>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <div><span className="danger">*</span> denotes required field<br /><br /></div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                    <ValidationInput label="Number:" isRequired={true}
                                                        id={editing.AssociationId + ".AssociationNumber"}
                                                        name="AssociationNumber" value={editing.AssociationNumber}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].AssociationNumber : null}
                                                        handleChange={this.handleChange} handleBlur={this.handleChange} />
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                    <div className="col-sm-9 col-md-9 col-lg-9 col-xl-9">
                                                        <ValidationInput label="AuthKey:" isRequired={true} readOnly={true}
                                                            id={editing.AssociationId + ".AuthKey"}
                                                            name="AuthKey" value={editing.AuthKey}
                                                            validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].AuthKey : null}
                                                            handleChange={this.handleChange} handleBlur={null} />
                                                    </div>
                                                    <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                        <fieldset className="form-group">
                                                            <button className="btn btn-icon btn-primary pull-left"
                                                                style={{ marginTop: '1.75em' }}
                                                                data-value={JSON.stringify(obj)}
                                                                onClick={this.handleAuthKeyChange}>
                                                                {obj.verb}
                                                            </button>
                                                        </fieldset>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <ValidationInput label="Billing Id:" isRequired={true}
                                                        id={editing.AssociationId + ".AssociationBillingId"}
                                                        name="AssociationBillingId" value={editing.AssociationBillingId}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].AssociationBillingId : null}
                                                        handleChange={this.handleChange} handleBlur={this.handleChange} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-9 col-md-9 col-lg-9 col-xl-9">
                                                    <ValidationInput label="Description:" isRequired={false}
                                                        id={editing.AssociationId + ".Description"}
                                                        name="Description" value={editing.Description}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].Description : null}
                                                        handleChange={this.handleChange} handleBlur={this.handleChange} />
                                                </div>
                                                {/*
                                                <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                    <ValidationSelect isRequired={false} receivedData={this.state.receivedData}
                                                        label="Default Fax Format:"
                                                        id={editing.AssociationId + ".ReceiveFaxFormat"} name="ReceiveFaxFormat"
                                                        placeholder="Select fax format"
                                                        valueKey="value" labelKey="label"
                                                        value={editing.ReceiveFaxFormat}
                                                        data={this.state.receiveFaxFormatOptions}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].ReceiveFaxFormat : null}
                                                        handleChange={(e) => this.handleReceiveFaxFormatChange(e, editing.AssociationId, editing.ReceiveFaxFormat)}
                                                        handleBlur={(e) => this.handleReceiveFaxFormatChange(e, editing.AssociationId, editing.ReceiveFaxFormat)} />
                                                </div>
                                                */}
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <ValidationInput label="Webhook Url:" isRequired={false}
                                                        id={editing.AssociationId + ".WebhookUrl"}
                                                        name="WebhookUrl" value={editing.WebhookUrl}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookUrl : null}
                                                        handleChange={this.handleChange} handleBlur={this.handleChange} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                    <ValidationSelect isRequired={false} receivedData={this.state.receivedData}
                                                        label="Webhook Auth Type:"
                                                        id={editing.AssociationId + ".WebhookAuthType"} name="WebhookAuthType"
                                                        placeholder="Select authentication type"
                                                        valueKey="value" labelKey="label"
                                                        value={editing.WebhookAuthType}
                                                        data={this.state.webhookAuthTypeOptions}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookAuthType : null}
                                                        handleChange={(e) => this.handleWebhookAuthTypeChange(e, editing.AssociationId, editing.WebhookAuthType)}
                                                        handleBlur={(e) => this.handleWebhookAuthTypeChange(e, editing.AssociationId, editing.WebhookAuthType)} />
                                                </div>
                                                <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                    <ValidationInput label="Webhook Username:" isRequired={false} readOnly={editing.WebhookAuthType === this.authTypes.X509CERTIFICATE || editing.WebhookAuthType === this.authTypes.NONE}
                                                        id={editing.AssociationId + ".WebhookUsername"}
                                                        name="WebhookUsername" value={editing.WebhookUsername}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookUsername : null}
                                                        handleChange={this.handleChange} handleBlur={this.handleChange} />
                                                </div>
                                                {/*
                                                        <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                            <ValidationInput label={"Webhook " + (editing.WebhookAuthType === this.authTypes.X509CERTIFICATE ? "ApiKey" : "Password") + ":"} isRequired={false}
                                                                id={editing.AssociationId + ".WebhookApiKey"}
                                                                name="WebhookApiKey" value={editing.WebhookApiKey}
                                                                validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookApiKey : null}
                                                                handleChange={this.handleChange} handleBlur={null} />
                                                        </div>
                                                */}
                                                {editing.WebhookAuthType === this.authTypes.NONE ?
                                                    <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                        <ValidationInput label="Webhook Password:" isRequired={false} readOnly={true} isPassword={!showWebhookPassword}
                                                            id={editing.AssociationId + ".WebhookPassword"}
                                                            name="WebhookPassword" value={editing.WebhookPassword}
                                                            validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookPassword : null}
                                                            handleChange={this.handleChange} handleBlur={null} />
                                                        <div className="form-control-position">
                                                            <i className={showWebhookPassword ? "ft-eye-off" : "ft-eye"} style={{ marginRight: ".75em", cursor: "pointer" }} onClick={this.toggleWebhookPasswordVisibility}></i>
                                                        </div>
                                                    </div>
                                                    :
                                                    editing.WebhookAuthType === this.authTypes.X509CERTIFICATE ?
                                                        <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                            <ValidationInput label="Webhook ApiKey:" isRequired={false}
                                                                id={editing.AssociationId + ".WebhookApiKey"}
                                                                name="WebhookApiKey" value={editing.WebhookApiKey}
                                                                validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookApiKey : null}
                                                                handleChange={this.handleChange} handleBlur={null} />
                                                        </div>
                                                        :
                                                        <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                            <ValidationInput label="Webhook Password:" isRequired={false} isPassword={!showWebhookPassword}
                                                                id={editing.AssociationId + ".WebhookPassword"}
                                                                name="WebhookPassword" value={editing.WebhookPassword}
                                                                validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].WebhookPassword : null}
                                                                handleChange={this.handleChange} handleBlur={null} />
                                                            <div className="form-control-position">
                                                                <i className={showWebhookPassword ? "ft-eye-off" : "ft-eye"} style={{ marginRight: ".75em", cursor: "pointer" }} onClick={this.toggleWebhookPasswordVisibility}></i>
                                                            </div>
                                                        </div>
                                                }
                                            </div>


                                            <div className="row">
                                                <div className="col-sm-4 col-md-4 col-lg-4 col-xl-4">
                                                    <ValidationSelect isRequired={false} receivedData={this.state.receivedData}
                                                        label="Fax Service Type:"
                                                        id={editing.AssociationId + ".FaxService"} name="FaxService"
                                                        placeholder="Select fax service type"
                                                        valueKey="value" labelKey="label"
                                                        value={editing.FaxService}
                                                        data={this.state.faxServiceTypesOptions}
                                                        validation={this.validation} errors={errors[editing.AssociationId] != null ? errors[editing.AssociationId].FaxService : null}
                                                        handleChange={(e) => this.handleFaxServiceTypeChange(e, editing.AssociationId, editing.FaxService)}
                                                        handleBlur={(e) => this.handleFaxServiceTypeChange(e, editing.AssociationId, editing.FaxService)} />
                                                </div>
                                            </div>


                                            <div className="row">
                                                <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <div className="pull-right">
                                                        <button className="btn btn-warning ml-1" onClick={this.handleAddNewRow}>New Entry</button>
                                                        <button className="btn btn-primary ml-1" onClick={this.handleSaveRow} disabled={(errors[editing.AssociationId] || []).length > 0}>Update Entry</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </fieldset>
                                    </div>
                                    <br />
                                    <ReactTable data={data} columns={columns}
                                        showPaginationTop={true}
                                        showPaginationBottom={false}
                                        defaultPageSize={10}
                                        filterable={true}
                                        getTrProps={(state, rowInfo, column, instance) => {
                                            return {
                                                onClick: (e, handleOriginal) => {
                                                    let editing = JSON.parse(JSON.stringify(rowInfo.original)); // cloned, not referenced
                                                    //console.log("editing =", editing);
                                                    this.setState({
                                                        editing: editing
                                                    });
                                                }
                                            };
                                        }}
                                    />
                                </section>
                                <div className="invalid-block">
                                    <br />
                                    <ul className="invalid" role="alert">
                                        {this.validation.getClass(summaryErrors) === " invalid" ?
                                            summaryErrors.map(function (error, index) {
                                                return <li key={index}>{error}</li>;
                                            })
                                            :
                                            ""
                                        }
                                    </ul>
                                </div>
                            </div>
                            :
                            <div className="card-block offset-lg-5 offset-md-5">
                                <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                <span className="sr-only">Loading...</span>
                            </div>
                        }
                    </div>
                    <div className="pull-right">
                        <button className="btn btn-default" onClick={this.back}>Back</button>
                        <button className="btn btn-primary ml-1" onClick={this.validate}>Review</button>
                    </div>
                </div>
                {this.state.alert}
            </section>
        )
    }
}

class Review extends React.Component {
    constructor(props) {
        super(props);
        let action = fieldValues.editMode ? "Update" : "Create";
        this.state = {
            objectName: "Account",
            action: action,
            complete: false,
            runTests: false,
            alert: null
        }
        this.actionStatusTimer = false;
    }

    handleCheckboxChange = (e) => {
        this.setState({ [e.target.name]: e.target.checked });
    }

    back = (e) => {
        e.preventDefault();
        this.props.back(states.ASSOCIATIONS);
    }

    validate = (e) => {
        e.preventDefault();
        let subject = this.state.objectName;
        let change = this.state.action;
        let magicWord = Captcha(5);
        let action = "Accounts/" + change;
        let payload = {
            AccountId: fieldValues.editMode ? fieldValues.accountId : null,
            AccountTypeId: fieldValues.accountTypeId,
            RateId: fieldValues.rateId,
            AccountBillingId: fieldValues.billingId,
            DisplayName: fieldValues.displayName,
            Title: fieldValues.title,
            FirstName: fieldValues.firstName,
            MiddleName: fieldValues.middleName,
            LastName: fieldValues.lastName,
            Suffix: fieldValues.suffix,
            EmailAddress: fieldValues.emailAddress,
            PIN: fieldValues.PIN,
            IsActive: fieldValues.isActive,
            Associations: fieldValues.associations,
            AccountAddresses: fieldValues.addresses,
            AccountPhoneNumbers: fieldValues.phones
        };
        let note = fieldValues.editMode ? "This will update the selected " + subject.toLocaleLowerCase() + ".\n\n" : "";
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
            if (this.state.runTests) {
                this.props.history.push({
                    pathname: "/Layout/FunctionalTest",
                    state: {
                        accountId: fieldValues.accountId,
                        data: fieldValues.associations
                    }
                });
            } else {
                this.props.history.push("/Layout/Accounts");
            }
        }
    }

    render() {
        return (
            <section>
                <div className="card">
                    <p>Please review the information below. To make changes, click Back. To continue, click {this.state.action}.</p>
                    <div className="card-body">
                        {/*
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="accountType">
                                        Account Type:
                                        &nbsp;
                                    </label>
                                    <span id="accountType" ref="accountType" name="accountType">{fieldValues.accountTypeName}</span>
                                </div>
                            </div>
                            <div className="col-md-6">
                            </div>
                        </div>
                        */}
                        <div className="row">
                            <div className="col-md-8">
                                <div className="form-group">
                                    <label htmlFor="rateInfo">
                                        Rate:
                                        &nbsp;
                                    </label>
                                    <RateInfo
                                        options={fieldValues.rates} index={fieldValues.rateId}
                                        orientation="vertical"
                                        formatting={this.formatting} currencySymbol="$" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="billingId">
                                        Account Billing Id:
                                        &nbsp;
                                    </label>
                                    <span id="billingId" ref="billingId" name="billingId">{fieldValues.billingId}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="form-group">
                                    <label htmlFor="displayName">
                                        Display Name:
                                        &nbsp;
                                    </label>
                                    <span id="displayName" ref="displayName" name="displayName">{fieldValues.displayName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="title">
                                        Title:
                                        &nbsp;
                                    </label>
                                    <span id="title" ref="title" name="title">{fieldValues.title}</span>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="form-group">
                                    <label htmlFor="firstName">
                                        First Name:
                                        &nbsp;
                                    </label>
                                    <span id="firstName" ref="firstName" name="firstName">{fieldValues.firstName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="middleName">
                                        Middle Name:
                                        &nbsp;
                                    </label>
                                    <span id="middleName" ref="middleName" name="middleName">{fieldValues.middleName}</span>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="form-group">
                                    <label htmlFor="lastName">
                                        Last Name:
                                        &nbsp;
                                    </label>
                                    <span id="lastName" ref="lastName" name="lastName">{fieldValues.lastName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="suffix">
                                        Suffix:
                                        &nbsp;
                                    </label>
                                    <span id="suffix" ref="suffix" name="suffix">{fieldValues.suffix}</span>
                                </div>
                            </div>
                            <div className="col-md-8">
                                <div className="form-group">
                                    <label htmlFor="emailAddress">
                                        Email Address:
                                        &nbsp;
                                    </label>
                                    <span id="emailAddress" ref="emailAddress" name="emailAddress">{fieldValues.emailAddress}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-8">
                                <div className="form-group">
                                    <label htmlFor="suffix">
                                        PIN:
                                        &nbsp;
                                    </label>
                                    <span id="suffix" ref="suffix" name="suffix">{fieldValues.PIN}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group">
                                    <label htmlFor="isActive">
                                        Active:
                                        &nbsp;
                                    </label>
                                    <span id="isActive" ref="isActive" name="isActive">{fieldValues.isActive ? "Yes" : "No"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <AssociationNumberList text="Associated Numbers:" list={fieldValues.associations} />
                            </div>
                        </div>
                    </div>
                    {this.state.complete ?
                        <div className="pull-right">
                            <Link to="/Layout/Accounts" className="btn btn-default pull-right">Back to Accounts</Link>
                        </div>
                        :
                        <div>
                            <div>
                                <label className="inline custom-control custom-checkbox block">
                                    <input type="checkbox" className="custom-control-input" id="runTests" name="runTests" checked={this.state.runTests} onChange={this.handleCheckboxChange} />
                                    <span className="custom-control-indicator"></span>
                                    <span className="custom-control-description ml-0">Run Functional Test   </span>
                                </label>
                            </div>
                            <div className="pull-right">
                                <button className="btn btn-default" onClick={this.back}>Back</button>
                                <button className="btn btn-primary ml-1" onClick={this.validate}>{this.state.action}</button>
                            </div>
                        </div>
                    }
                </div>
                {this.state.alert}
            </section>
        )
    }
}

class AssociationNumber extends React.Component {
    render() {
        let item = this.props.item;
        let allow = [];
        if (item.AllowSMS) allow.push("Msg");
        if (item.AllowVoice) allow.push("Voice");
        if (item.AllowFax) allow.push("Fax");
        if (item.AllowEmail) allow.push("Email");
        if (item.AllowVideo) allow.push("Video");
        return (
            <li onClick={this.props.onClick}>
                <span style={{ width: '1.5em' }}>{item.AssociationNumber}&nbsp;&nbsp;&nbsp;</span>
                <span style={{ width: '1.5em' }}>{item.AuthKey}&nbsp;&nbsp;&nbsp;</span>
                <span style={{ width: '1.5em' }}>{item.AssociationBillingId}&nbsp;&nbsp;&nbsp;</span>
                <span style={{ width: '2em' }}>{allow.join(', ')}&nbsp;&nbsp;&nbsp;</span>
                <span style={{ width: '1.5em' }}>{(item.IsActive ? "Active" : "Inactive")}&nbsp;&nbsp;&nbsp;</span>
                <br />
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"Description: " + item.Description}</span><br />
                {/*<span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"Default Fax Format: " + item.ReceiveFaxFormat}</span><br />*/}
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"Webhook Url: " + item.WebhookUrl}</span><br />
                <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"Webhook AuthType: " + item.WebhookAuthType}</span><br />
                {item.WebhookAuthType === authTypes.NONE ?
                    ""
                    :
                    item.WebhookAuthType === authTypes.X509CERTIFICATE ?
                        <div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"Webhook X509 Cert: " + item.WebhookUsername + " | " + item.WebhookApiKey}</span><br /></div>
                        :
                        <div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"Webhook Credentials: " + item.WebhookUsername + " | " + item.WebhookPassword}</span><br /></div>

                }
                <br />
            </li>
        )
    }
}

class AssociationNumberList extends React.Component {
    render() {
        return (
            <div>
                <label htmlFor="associationNumbers">
                    {this.props.text}
                    &nbsp;
                </label>
                <span></span>
                <ul>
                    {this.props.list.map(function (item, index) {
                        return <AssociationNumber key={index} item={item} />
                    })}
                </ul>
            </div>
        )
    }
}

export class StateMachine {
    constructor() {
        /*
        var createTransitions = {
            [states.DETAILS]: [states.ADDRESSES],
            [states.ADDRESSES]: [states.PHONES],
            [states.PHONES]: [states.ASSOCIATIONS],
            [states.ASSOCIATIONS]: [states.REVIEW],
            [states.REVIEW]: [states.FINISH] // FYI the FINISH state is not used
        };
        var editTransitions = {
            [states.DETAILS]: [states.ADDRESSES],
            [states.ADDRESSES]: [states.PHONES],
            [states.PHONES]: [states.ASSOCIATIONS],
            [states.ASSOCIATIONS]: [states.REVIEW],
            [states.REVIEW]: [states.FINISH] // FYI the FINISH state is not used
        };
        */
        var createTransitions = {
            [states.DETAILS]: [states.ASSOCIATIONS],
            [states.ASSOCIATIONS]: [states.REVIEW],
            [states.REVIEW]: [states.FINISH] // FYI the FINISH state is not used
        };
        var editTransitions = {
            [states.DETAILS]: [states.ASSOCIATIONS],
            [states.ASSOCIATIONS]: [states.REVIEW],
            [states.REVIEW]: [states.FINISH] // FYI the FINISH state is not used
        };
        this.transitions = fieldValues.editMode ? editTransitions : createTransitions;
    }

    _reverseObject(obj) {
        let reversed = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key].forEach((i) => {
                    if (reversed[i] === undefined) {
                        reversed[i] = [key];
                    } else {
                        reversed[i].push(key);
                    }
                });
            }
        }
        return reversed;
    }

    _checkState(available, desired) {
        if (available.includes(desired)) {
            return desired;
        } else {
            throw new Error(`Desired state: ${desired} is not available`);
        }
    }

    transitionTo(current, desired) {
        let available = this.transitions[current].concat();
        return this._checkState(available, desired);
    }

    transitionFrom(current, desired) {
        let reversed = this._reverseObject(this.transitions);
        let available = reversed[current].concat();
        return this._checkState(available, desired);
    }
}
