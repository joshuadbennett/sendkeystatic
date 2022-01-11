import React from 'react';
import Configuration from '../Utils/config'; // won't be needed after testing
//import ContentPane from '../Layout/ContentPane.jsx';
import ApiActions from '../Components/ApiActions.jsx';
import SweetAlert from 'react-bootstrap-sweetalert'; // won't be needed after testing
import Validation from '../Components/Validation.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import loadScript from '../Utils/load-script';
import Captcha from '../Utils/Captcha';
import uuidv4 from 'uuid/v4';

var addresses = [];

var addressTypes = [
    { AddressTypeId: "Home", AddressTypeName: "Home" },
    { AddressTypeId: "Office", AddressTypeName: "Office" },
    { AddressTypeId: "POBox", AddressTypeName: "POBox" },
    { AddressTypeId: "Other", AddressTypeName: "Other" },
];

var addressStates = [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AS", label: "American Samoa" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "DC", label: "District of Columbia" },
    { value: "FM", label: "Federated States of Micronesia" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "GU", label: "Guam" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MH", label: "Marshall Islands" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "MP", label: "Northern Mariana Islands" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PW", label: "Palau" },
    { value: "PA", label: "Pennsylvania" },
    { value: "PR", label: "Puerto Rico" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VI", label: "Virgin Islands" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" }
];

export default class AddressInputList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: (props.editMode != null) ? props.editMode : false,
            //showSummaryErrors: (props.showSummaryErrors != null) ? props.showSummaryErrors : true,
            data: props.data || addresses || [],
            addressTypes: props.addressTypes || addressTypes || [],
            addressStates: props.addressStates || addressStates || [],
            selectAll: [],
            currentPage: 1,
            accountId: props.accountId || null,
            addrTypeErrors: null,
            addrLine1Errors: null,
            addrLine2Errors: null,
            addrCityErrors: null,
            addrStateErrors: null,
            addrZipErrors: null,
            receivedData: false,
            alert: null
        }
        addresses = this.state.data;
        this.getFormValid = props.getFormValid !== undefined ? props.getFormValid.bind(this) : this.getFormValid.bind(this);
        this.validation = props.validation || new Validation();
        this.getIndex = this.getIndex.bind(this);
        this.getRequiredErrors = this.getRequiredErrors.bind(this);
        this.getAddressLine1Errors = this.getAddressLine1Errors.bind(this);
        this.getAddressLine2Errors = this.getAddressLine2Errors.bind(this);
        this.getCityErrors = this.getCityErrors.bind(this);
        this.getPostalCodeErrors = this.getPostalCodeErrors.bind(this);
        this.getAddressesErrors = this.getAddressesErrors.bind(this);
        this.getFieldErrors = this.getFieldErrors.bind(this);
        this.updateErrors = this.updateErrors.bind(this);
        this.compileListErrors = this.compileListErrors.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleSelectExclusive = this.handleSelectExclusive.bind(this);
        this.handleSelectAll = this.handleSelectAll.bind(this);
        this.getSelectAll = this.getSelectAll.bind(this);
        this.areAllSelected = this.areAllSelected.bind(this);
        this.addNewRow = this.addNewRow.bind(this);
        this.handleAddNewRow = this.handleAddNewRow.bind(this);
        this.handleRemove = this.handleRemove.bind(this);
        this.handleRemoveAll = this.handleRemoveAll.bind(this);
        this.handleAddressTypeChange = this.handleAddressTypeChange.bind(this);
        this.handleAddressStateChange = this.handleAddressStateChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.validate = this.validate.bind(this);
        this.dispositionResponse = this.dispositionResponse.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
        this.handleError = this.handleError.bind(this);
        this.hideAlert = this.hideAlert.bind(this);
    }

    componentDidMount() {
        // set addresses or an unfilled row if none exist
        if (addresses.length < 1) {
            addresses = this.addNewRow();
        }
        let listErrors = this.compileListErrors();
        console.log("(componentDidMount) addressesErrors = ", listErrors.addressesErrors);
        this.props.handleUpdates(addresses, listErrors);
        this.setState({
            selectAll: this.getSelectAll(),
            addressesErrors: listErrors.addressesErrors,
            receivedData: true
        });
        loadScript('/app-assets/js/scripts/tables/datatables/datatable-basic.js', () => { });
    }

    componentDidUpdate() {
        // if added a new row:
        // destroy dataTable
        // rebuild
        // find a way to calculate which page it should start on
    }

    getIndex(arr, prop, val) {
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

    getRequiredErrors(value) {
        var errors = [];
        var minLength = 1;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        return errors;
    }

    getAddressLine1Errors(value) {
        var errors = [];
        var minLength = 1, maxLength = 500;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && !this.validation.patternValid(value, /^[A-Za-z0-9.,-_ ]*$/, "")) errors.push("Can only contain letters, numbers, spaces, and special characters(.,-_).");
        return errors;
    }

    getAddressLine2Errors(value) {
        var errors = [];
        var maxLength = 500;
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && !this.validation.patternValid(value, /^[A-Za-z0-9.,-_ ]*$/, "")) errors.push("Can only contain letters, numbers, spaces, and special characters(.,-_).");
        return errors;
    }

    getCityErrors(value) {
        var errors = [];
        var minLength = 1, maxLength = 250;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getPostalCodeErrors(value) {
        var errors = [];
        var minLength = 1, maxLength = 50;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getAddressesErrors(addrTypeErrors, addrLine1Errors, addrLine2Errors, addrCityErrors, addrStateErrors, addrZipErrors) {
        var errors = [];
        var minLength = 1;
        if (!this.validation.arrayLengthMinValid(addresses, minLength)) errors.push(this.validation.arrayLengthMinInvalidMessage(minLength));
        if (addrTypeErrors != null && Object.keys(addrTypeErrors).length > 0) errors.push("All address types listed must be valid.");
        if (addrLine1Errors != null && Object.keys(addrLine1Errors).length > 0) errors.push("All address1 lines listed must be valid.");
        if (addrLine2Errors != null && Object.keys(addrLine2Errors).length > 0) errors.push("All address2 lines listed must be valid.");
        if (addrCityErrors != null && Object.keys(addrCityErrors).length > 0) errors.push("All cities listed must be valid.");
        if (addrStateErrors != null && Object.keys(addrStateErrors).length > 0) errors.push("All states listed must be valid.");
        if (addrZipErrors != null && Object.keys(addrZipErrors).length > 0) errors.push("All postal codes listed must be valid.");
        return errors;
    }

    getFieldErrors(arr, idPrefix, idProp, prop, type) {
        arr = arr == null ? [] : arr;
        var errors = [];
        for (var i = 0; i < addresses.length; i++) {
            let item = addresses[i];
            let id = idPrefix + item[idProp];
            errors = this.updateErrors(errors, id, item[prop], type);
        }
        return errors;
    }

    updateErrors(arr, id, value, type) {
        arr = arr == null ? [] : arr;
        let errors = [];
        switch (type) {
            case "addrType":
                errors = this.getRequiredErrors(value);
                break;
            case "addrLine1":
                errors = this.getAddressLine1Errors(value);
                break;
            case "addrLine2":
                errors = this.getAddressLine2Errors(value);
                break;
            case "addrCity":
                errors = this.getCityErrors(value);
                break;
            case "addrState":
                errors = this.getRequiredErrors(value);
                break;
            case "addrZip":
                errors = this.getPostalCodeErrors(value);
                break;
            default:
                break;
        }
        if (errors.length > 0) {
            arr[id] = errors;
        } else {
            delete arr[id];
        }
        return arr;
    }

    compileListErrors() {
        let addrTypeErrors = this.getFieldErrors(addresses, "addr_type_", "AccountAddressId", "AddressType", "addrType");
        let addrLine1Errors = this.getFieldErrors(addresses, "addr_1_", "AccountAddressId", "AddressLine1", "addrLine1");
        let addrLine2Errors = this.getFieldErrors(addresses, "addr_2_", "AccountAddressId", "AddressLine1", "addrLine2");
        let addrCityErrors = this.getFieldErrors(addresses, "addr_city_", "AccountAddressId", "City", "addrCity");
        let addrStateErrors = this.getFieldErrors(addresses, "addr_state_", "AccountAddressId", "State", "addrState");
        let addrZipErrors = this.getFieldErrors(addresses, "addr_zip_", "AccountAddressId", "Zip", "addrZip");
        let addressesErrors = this.getAddressesErrors(addrTypeErrors, addrLine1Errors, addrLine2Errors, addrCityErrors, addrStateErrors, addrZipErrors);
        let listErrors = {
            addrTypeErrors: addrTypeErrors,
            addrLine1Errors: addrLine1Errors,
            addrLine2Errors: addrLine2Errors,
            addrCityErrors: addrCityErrors,
            addrStateErrors: addrStateErrors,
            addrZipErrors: addrZipErrors,
            addressesErrors: addressesErrors
        };
        console.log("listErrors = ", listErrors);
        return listErrors;
    }

    getFormValid(...args) {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    handleSelect(e) {
        let type = e.target.getAttribute("data-type");
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        let addr = addresses.find(item => item.AccountAddressId === row.AccountAddressId);
        addr[type] = checked;
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

    handleSelectExclusive(e) {
        let type = e.target.getAttribute("data-type");
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        if (checked) {
            for (var i = 0; i < addresses.length; i++) {
                let item = addresses[i];
                item[type] = false;
                let obj = document.getElementById("addr_primary_" + item.AccountAddressId);
                if (obj != null) {
                    obj.className = "fa fa-square-o";
                }
            }
        }
        let addr = addresses.find(item => item.AccountAddressId === row.AccountAddressId);
        addr[type] = checked;
        let obj = document.getElementById(e.target.id);
        if (obj != null) {
            obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
        }
    }

    handleSelectAll(e) {
        let type = e.target.getAttribute("data-type");
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        for (var i = 0; i < addresses.length; i++) {
            addresses[i][type] = checked;
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

    getSelectAll() {
        let selectAll = [];
        selectAll["IsActiveAll"] = this.areAllSelected("IsActive");
        return selectAll;
    }

    areAllSelected(type) {
        for (var i = 0; i < addresses.length; i++) {
            let item = addresses[i];
            if (!item[type]) {
                return false;
            }
        }
        return true;
    }

    addNewRow() {
        let selectAll = this.getSelectAll();
        let newRow = {
            AccountAddressId: uuidv4(), AccountId: this.state.accountId,
            AddressType: null,
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            Zip: null,
            POBox: null,
            IsActive: selectAll["IsActiveAll"],
            IsPrimary: false
        }
        addresses = this.state.data.concat(newRow);
        //console.log("addresses = ", addresses);
        return addresses;
    }

    handleAddNewRow(e) {
        let addresses = this.addNewRow();
        let listErrors = this.compileListErrors();
        console.log("(handleAddNewRow) addressesErrors = ", listErrors.addressesErrors);
        this.setState({
            data: addresses,
            selectAll: this.getSelectAll(),
            addressesErrors: listErrors.addressesErrors
        });
        this.props.handleUpdates(addresses, listErrors);
    }

    handleRemove(e) {
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let data = this.state.data;
        let index = this.getIndex(data, "AccountAddressId", row.AccountAddressId);
        if (index > -1) {
            data.splice(index, 1);
        }
        let listErrors = this.compileListErrors();
        console.log("(handleRemove) addressesErrors = ", listErrors.addressesErrors);
        this.setState({
            data: data,
            addressesErrors: listErrors.addressesErrors
        });
        this.props.handleUpdates(addresses, listErrors);
    }

    handleRemoveAll(e) {
        let data = this.state.data;
        data.splice(0);
        let listErrors = this.compileListErrors();
        console.log("(handleRemove) addressesErrors = ", listErrors.addressesErrors);
        this.setState({
            data: data,
            addressesErrors: listErrors.addressesErrors
        });
        this.props.handleUpdates(addresses, listErrors);
    }

    handleAddressTypeChange(value, id) {
        let match = addressTypes.find((item) => item.AddressTypeId === value);
        //console.log("(addressType) match = ", match);
        if (match != null) {
            let index = this.getIndex(addresses, "AccountAddressId", id);
            if (index > -1) {
                addresses[index].AddressType = value.trim();
            }
        }
        let listErrors = this.compileListErrors();
        console.log("(handleAddressTypeChange) addressesErrors = ", listErrors.addressesErrors);
        this.setState({
            data: addresses,
            addressesErrors: listErrors.addressesErrors
        });
        this.props.handleUpdates(addresses, listErrors.addressesErrors);
    }

    handleAddressStateChange(value, id) {
        let match = addressStates.find((item) => item.value === value); //item.State
        //console.log("(addressState) match = ", match);
        if (match != null) {
            let index = this.getIndex(addresses, "AccountAddressId", id);
            if (index > -1) {
                addresses[index].State = value.trim();
            }
        }
        let listErrors = this.compileListErrors();
        console.log("(handleAddressStateChange) addressesErrors = ", listErrors.addressesErrors);
        this.setState({
            data: addresses,
            addressesErrors: listErrors.addressesErrors
        });
        this.props.handleUpdates(addresses, listErrors);
    }

    handleChange(e) {
        let addrTypeErrors = this.state.addrTypeErrors;
        let addrLine1Errors = this.state.addrLine1Errors;
        let addrLine2Errors = this.state.addrLine2Errors;
        let addrCityErrors = this.state.addrCityErrors;
        let addrStateErrors = this.state.addrStateErrors;
        let addrZipErrors = this.state.addrZipErrors;
        let data = JSON.parse(e.target.getAttribute("data-value"));
        let index = this.getIndex(addresses, "AccountAddressId", data.AccountAddressId);
        let value = e.target.value;
        switch (e.target.name) {
            case "addrType":
                addrTypeErrors = this.updateErrors(addrTypeErrors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { addresses[index].AddressType = value; }
                break;
            case "addrLine1":
                addrLine1Errors = this.updateErrors(addrLine1Errors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { addresses[index].AddressLine1 = value; }
                break;
            case "addrLine2":
                addrLine2Errors = this.updateErrors(addrLine2Errors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { addresses[index].AddressLine2 = value; }
                break;
            case "addrCity":
                addrCityErrors = this.updateErrors(addrCityErrors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { addresses[index].City = value; }
                break;
            case "addrState":
                addrStateErrors = this.updateErrors(addrStateErrors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { addresses[index].State = value; }
                break;
            case "addrZip":
                addrZipErrors = this.updateErrors(addrZipErrors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { addresses[index].Zip = value; }
                break;
            default:
                break;
        }
        let listErrors = this.compileListErrors();
        console.log("(handleChange) addressesErrors = ", listErrors.addressesErrors);
        this.setState({
            [e.target.name]: value,
            data: addresses,
            addrTypeErrors: addrTypeErrors,
            addrLine1Errors: addrLine1Errors,
            addrLine2Errors: addrLine2Errors,
            addrCityErrors: addrCityErrors,
            addrStateErrors: addrStateErrors,
            addrZipErrors: addrZipErrors,
            addressesErrors: listErrors.addressesErrors
        });
        this.props.handleUpdates(addresses, listErrors);
    }

    handleBlur(e) {
        this.setState({
            [e.target.name]: e.target.value.trim()
        });
    }

    validate(e) {
        e.preventDefault();
        let listErrors = this.compileListErrors();
        let formValid = this.getFormValid(listErrors.addressesErrors);
        if (formValid) {
            let subject = this.state.objectName;
            let magicWord = Captcha(5);
            let action = "Sync";
            let verb = "Update";
            let payload = {
                AccountId: this.state.accountId,
                AccountAddresses: addresses
            }
            let editMode = this.state.editMode;
            let note = editMode ? "This will update the selected " + subject.toLocaleLowerCase() + ".\n\n" : "";
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
                        onConfirm={(e) => this.receiveInput(payload, e, magicWord, action, verb)}
                        onCancel={this.hideAlert.bind(this)}
                    >
                        {text}
                    </SweetAlert>
                )
            });
        } else {
            this.setState({
                addrTypeErrors: listErrors.addrTypeErrors,
                addrLine1Errors: listErrors.addrLine1Errors,
                addrLine2Errors: listErrors.addrLine2Errors,
                addrCityErrors: listErrors.addrCityErrors,
                addrStateErrors: listErrors.addrStateErrors,
                addrZipErrors: listErrors.addrZipErrors,
                addressesErrors: listErrors.addressesErrors
            });
        }
    }

    receiveInput(payload, text, magicWord, action, verb) {
        //console.log(payload, text, magicWord, action);
        let subject = "Account Address";
        if (text === magicWord) {
            let apiBaseUrl = Configuration().apiUrl;
            let route = "api/AccountAddresses/";
            let method = action != null && action.substring(0, 3).toLocaleUpperCase() === "GET" ? "GET" : "POST";
            //console.log("method = ", method);
            let callback = this.dispositionResponse;
            let apiActions = new ApiActions();
            switch (method.toUpperCase()) {
                case "GET":
                    apiActions.performGet(apiBaseUrl, route, action, payload, subject, verb, callback);
                    break;
                case "POST":
                    apiActions.performPost(apiBaseUrl, route, action, payload, subject, verb, callback);
                    break;
                default:
                    if (callback != null) {
                        callback();
                    }
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

    dispositionResponse(result) {
        console.log("result = ", result);
        if (result == null || result.type == null) {
            this.hideAlert();
            return;
        }
        let type = result.type || "", subject = result.subject || "", verb = result.verb || "";
        if (type === "unauthorized" && result.response != null && result.response.statusText != null) {
            this.handleError("", result.response.statusText)
        } else if (type === "success") {
            this.handleSuccess(subject, verb);
        } else if (type === "failure" && result.responseMessage != null) {
            this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", result.responseMessage);
        } else if (type === "error" && result.error != null && result.errorMessage != null) {
            let error = result.response;
            if (error != null && error.response != null && error.response.status === 504) {
                localStorage.removeItem('token');
                this.props.history.push("/Login");
            }
            this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", result.errorMessage);
        } else {
            this.hideAlert();
        }
    }

    handleSuccess(subject, verb) {
        this.setState({
            //complete: true,
            alert: (
                <SweetAlert success title={subject + " " + verb + " Successful!"} onConfirm={this.hideAlert}>
                </SweetAlert>
            )
        });
    }

    handleError(title, message) {
        this.setState({
            alert: (
                <SweetAlert danger title={title} onConfirm={this.hideAlert}>
                    {message}
                </SweetAlert>
            )
        });
    }

    hideAlert(e) {
        this.setState({ alert: null });
    }

    render() {
        let data = addresses;
        let showSummaryErrors = this.props.showSummaryErrors;
        console.log("showSummaryErrors = ", showSummaryErrors);
        let listErrors = this.compileListErrors();
        let addrTypeErrors = showSummaryErrors ? listErrors.addrTypeErrors : this.state.addrTypeErrors;
        let addrLine1Errors = showSummaryErrors ? listErrors.addrLine1Errors : this.state.addrLine1Errors;
        let addrLine2Errors = showSummaryErrors ? listErrors.addrLine2Errors : this.state.addrLine2Errors;
        let addrCityErrors = showSummaryErrors ? listErrors.addrCityErrors : this.state.addrCityErrors;
        let addrStateErrors = showSummaryErrors ? listErrors.addrStateErrors : this.state.addrStateErrors;
        let addrZipErrors = showSummaryErrors ? listErrors.addrZipErrors : this.state.addrZipErrors;
        let addressesErrors = this.state.addressesErrors;
        console.log("addressesErrors = ", addressesErrors);
        let that = this;
        return (
                            <div className="card-block">
                                <section>
                                    <div>
                                        <p>Please provide the contact addresses for the account.</p>
                                    </div>
                                    <table className="table table-striped table-bordered regen kcp-addr" id="columnFilteredTable">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Address</th>
                                                <th>City</th>
                                                <th>State</th>
                                                <th>Postal Code</th>
                                                <th>
                                                    <i id="IsActiveAll" name="IsActiveAll"
                                                        className={this.state.selectAll["IsActiveAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                        onClick={this.handleSelectAll}
                                                        data-type="IsActive"
                                                        aria-hidden="true"></i>
                                                    <span>&nbsp;Active</span>
                                                </th>
                                                <th>Primary</th>
                                                <th>
                                                    <i id="RemoveAll" name="RemoveSelectedAll"
                                                        className={"fa fa-trash"}
                                                        onClick={this.handleRemoveAll}
                                                        data-type="Delete"
                                                        aria-hidden="true"></i>
                                                    <span>&nbsp;</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <td>Address</td>
                                                <td>City</td>
                                                <th></th>
                                                <td>Postal Code</td>
                                                <th colSpan="3"/>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map(function (data, index) {
                                                let typeErrors = null;
                                                //console.log("addrTypeErrors = ", addrTypeErrors);
                                                if (addrTypeErrors != null) {
                                                    typeErrors = addrTypeErrors["addr_type_" + data.AccountAddressId];
                                                }
                                                let line1Errors = null;
                                                //console.log("addrLine1Errors = ", addrLine1Errors);
                                                if (addrLine1Errors != null) {
                                                    line1Errors = addrLine1Errors["addr_1_" + data.AccountAddressId];
                                                }
                                                let line2Errors = null;
                                                //console.log("addrLine2Errors = ", addrLine2Errors);
                                                if (addrLine2Errors != null) {
                                                    line2Errors = addrLine2Errors["addr_2_" + data.AccountAddressId];
                                                }
                                                let cityErrors = null;
                                                //console.log("addrCityErrors = ", addrCityErrors);
                                                if (addrCityErrors != null) {
                                                    cityErrors = addrCityErrors["addr_city_" + data.AccountAddressId];
                                                }
                                                let stateErrors = null;
                                               // console.log("addrStateErrors = ", addrStateErrors);
                                                if (addrStateErrors != null) {
                                                    stateErrors = addrStateErrors["addr_state_" + data.AccountAddressId];
                                                }
                                                let zipErrors = null;
                                                //console.log("addrZipErrors = ", addrZipErrors);
                                                if (addrZipErrors != null) {
                                                    zipErrors = addrZipErrors["addr_zip_" + data.AccountAddressId];
                                                }
                                                return (
                                                    <tr key={"data" + index}>
                                                        <td>
                                                            <ValidationSelect isRequired={true} receivedData={that.state.receivedData}
                                                                style={{ width: '110px' }} 
                                                                id={"addr_type_" + data.AccountAddressId} name="addrType"
                                                                placeholder="Type"
                                                                valueKey="AddressTypeId" labelKey="AddressTypeName"
                                                                value={data.AddressType}
                                                                data={that.state.addressTypes}
                                                                validation={that.validation} errors={typeErrors}
                                                                handleChange={(e) => that.handleAddressTypeChange(e, data.AccountAddressId, data.AddressType)}
                                                                handleBlur={(e) => that.handleAddressTypeChange(e, data.AccountAddressId, data.AddressType)} />  
                                                        </td>
                                                        <td>
                                                            <ValidationInput isRequired={true}
                                                                style={{ width: '150px' }} 
                                                                id={"addr_1_" + data.AccountAddressId}
                                                                name="addrLine1" value={data.AddressLine1}
                                                                data={data}
                                                                validation={that.validation} errors={line1Errors}
                                                                handleChange={that.handleChange} handleBlur={that.handleChange} />
                                                            <br />
                                                            <ValidationInput
                                                                style={{ width: '150px' }} 
                                                                id={"addr_2_" + data.AccountAddressId}
                                                                name="addrLine2" value={data.AddressLine2}
                                                                data={data}
                                                                validation={that.validation} errors={line2Errors}
                                                                handleChange={that.handleChange} handleBlur={that.handleChange} />
                                                        </td>
                                                        <td>
                                                            <ValidationInput isRequired={true}
                                                                style={{ width: '95px' }}
                                                                id={"addr_city_" + data.AccountAddressId}
                                                                name="addrCity" value={data.City}
                                                                data={data}
                                                                validation={that.validation} errors={cityErrors}
                                                                handleChange={that.handleChange} handleBlur={that.handleChange} />
                                                        </td>
                                                        <td>
                                                            <ValidationSelect isRequired={true} receivedData={that.state.receivedData}
                                                                style={{ width: '75px' }} 
                                                                id={"addr_state_" + data.AccountAddressId} name="addrState"
                                                                placeholder="State"
                                                                valueKey="value" labelKey="value"
                                                                value={data.State}
                                                                data={that.state.addressStates}
                                                                validation={that.validation} errors={stateErrors}
                                                                handleChange={(e) => that.handleAddressStateChange(e, data.AccountAddressId, data.State)}
                                                                handleBlur={(e) => that.handleAddressStateChange(e, data.AccountAddressId, data.State)} /> 
                                                        </td>
                                                        <td>
                                                            <ValidationInput isRequired={true}
                                                                style={{ width: '75px' }} 
                                                                id={"addr_zip_" + data.AccountAddressId}
                                                                name="addrZip" value={data.Zip}
                                                                data={data}
                                                                validation={that.validation} errors={zipErrors}
                                                                handleChange={that.handleChange} handleBlur={that.handleChange} />
                                                        </td>
                                                        <td>
                                                            <i id={"addr_active_" + data.AccountAddressId}
                                                                name="AddressSelected"
                                                                className={data.IsActive ? "fa fa-check-square-o" : "fa fa-square-o"} style={{ width: '65px' }}
                                                                onClick={that.handleSelect}
                                                                data-value={JSON.stringify(data)} data-type="IsActive"
                                                                aria-hidden="true"></i>
                                                        </td>
                                                        <td>
                                                            <i id={"addr_primary_" + data.AccountAddressId}
                                                                name="AddressPrimary"
                                                                className={data.IsPrimary ? "fa fa-check-square-o" : "fa fa-square-o"} style={{ width: '65px' }}
                                                                onClick={that.handleSelectExclusive}
                                                                data-value={JSON.stringify(data)} data-type="IsPrimary"
                                                                aria-hidden="true"></i>
                                                        </td>
                                                        <td>
                                                            <i id={"addr_delete_" + data.AccountAddressId}
                                                                name="AssociationSelected"
                                                                className="fa fa-trash"
                                                                onClick={that.handleRemove}
                                                                data-value={JSON.stringify(data)} data-type="Delete"
                                                                aria-hidden="true"></i>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                    <br />
                                    <button className=" btn btn-warning" onClick={this.handleAddNewRow}>+ Add New</button>
                                </section>
                                {showSummaryErrors ?
                                    <div className="invalid-block">
                                        <br />
                                        <ul className="invalid" role="alert">
                                            {this.validation.getClass(addressesErrors) === " invalid" ?
                                                addressesErrors.map(function (error, index) {
                                                    return <li key={index}>{error}</li>;
                                                })
                                                :
                                                ""
                                            }
                                        </ul>
                                    </div>
                                    :
                                    ""
                                }
                            </div>
        )
    }
}