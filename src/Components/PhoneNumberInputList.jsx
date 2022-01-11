import React from 'react';
import Validation from '../Components/Validation.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import loadScript from '../Utils/load-script';
import uuidv4 from 'uuid/v4';

var phones = [];

var phoneTypes = [
    { PhoneTypeId: "Home", PhoneTypeName: "Home" },
    { PhoneTypeId: "Office", PhoneTypeName: "Office" },
    { PhoneTypeId: "Mobile", PhoneTypeName: "Mobile" },
    { PhoneTypeId: "Other", PhoneTypeName: "Other" },
];

export default class PhoneNumberInputList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //showSummaryErrors: (props.showSummaryErrors != null) ? props.showSummaryErrors : true,
            data: props.data || phones || [],
            phoneTypes: props.phoneTypes || phoneTypes || [],
            selectAll: [],
            currentPage: 1,
            phnTypeErrors: null,
            phnNumberErrors: null,
            receivedData: false,
            alert: null
        }
        phones = this.state.data;
        this.getFormValid = props.getFormValid !== undefined ? props.getFormValid.bind(this) : this.getFormValid.bind(this);
        this.validation = props.validation || new Validation();
        this.getIndex = this.getIndex.bind(this);
        this.getRequiredErrors = this.getRequiredErrors.bind(this);
        this.getPhoneNumberErrors = this.getPhoneNumberErrors.bind(this);
        this.getPhonesErrors = this.getPhonesErrors.bind(this);
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
        this.handlePhoneTypeChange = this.handlePhoneTypeChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        // set phones or an unfilled row if none exist
        if (phones.length < 1) {
            phones = this.addNewRow();
        }
        let listErrors = this.compileListErrors();
        console.log("(componentDidMount) listErrors = ", listErrors);
        this.props.handleUpdates(phones, listErrors);
        this.setState({
            selectAll: this.getSelectAll(),
            phonesErrors: listErrors.phonesErrors,
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

    getPhoneNumberErrors(value) {
        var errors = [];
        var minLength = 1, maxLength = 30;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (value != null && !this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && !this.validation.patternValid(value, /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/, "")) errors.push("Must be a phone number.");
        return errors;
    }

    getPhonesErrors(phnTypeErrors, phnNumberErrors) {
        var errors = [];
        var minLength = 1;
        if (!this.validation.arrayLengthMinValid(phones, minLength)) errors.push(this.validation.arrayLengthMinInvalidMessage(minLength));
        if (phnTypeErrors != null && Object.keys(phnTypeErrors).length > 0) errors.push("All phone number types listed must be valid.");
        if (phnNumberErrors != null && Object.keys(phnNumberErrors).length > 0) errors.push("All phone numbers listed must be valid.");
        return errors;
    }

    getFieldErrors(arr, idPrefix, idProp, prop, type) {
        arr = arr == null ? [] : arr;
        var errors = [];
        for (var i = 0; i < phones.length; i++) {
            let item = phones[i];
            let id = idPrefix + item[idProp];
            errors = this.updateErrors(errors, id, item[prop], type);
        }
        return errors;
    }

    updateErrors(arr, id, value, type) {
        arr = arr == null ? [] : arr;
        let errors = [];
        switch (type) {
            case "phnType":
                errors = this.getRequiredErrors(value);
                break;
            case "phnNumber":
                errors = this.getPhoneNumberErrors(value);
                console.log("updateErrors (phNumber) = ", errors);
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
        let phnTypeErrors = this.getFieldErrors(phones, "phn_type_", "AccountPhoneNumberId", "PhoneNumberType", "phnType");
        let phnNumberErrors = this.getFieldErrors(phones, "phn_nbr_", "AccountPhoneNumberId", "PhoneNumber", "phnNumber");
        let phonesErrors = this.getPhonesErrors(phnTypeErrors, phnNumberErrors);
        let listErrors = {
            phnTypeErrors: phnTypeErrors,
            phnNumberErrors: phnNumberErrors,
            phonesErrors: phonesErrors
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
        let phn = phones.find(item => item.AccountPhoneNumberId === row.AccountPhoneNumberId);
        phn[type] = checked;
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
            for (var i = 0; i < phones.length; i++) {
                let item = phones[i];
                item[type] = false;
                let obj = document.getElementById("phn_primary_" + item.AccountAddressId);
                if (obj != null) {
                    obj.className = "fa fa-square-o";
                }
            }
        }
        let phn = phones.find(item => item.AccountPhoneNumberId === row.AccountPhoneNumberId);
        phn[type] = checked;
        let obj = document.getElementById(e.target.id);
        if (obj != null) {
            obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
        }
    }

    handleSelectAll(e) {
        let type = e.target.getAttribute("data-type");
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        for (var i = 0; i < phones.length; i++) {
            phones[i][type] = checked;
            let obj = document.getElementById(e.target.id);
            if (obj != null) {
                obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
            }
        }
        // verify
        let allSelected = this.areAllSelected(type);
        let objAll = document.getElementById(e.target.id);
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
        selectAll["IsSMSAll"] = this.areAllSelected("IsSMS");
        selectAll["IsActiveAll"] = this.areAllSelected("IsActive");
        return selectAll;
    }

    areAllSelected(type) {
        for (var i = 0; i < phones.length; i++) {
            let item = phones[i];
            if (!item[type]) {
                return false;
            }
        }
        return true;
    }

    addNewRow() {
        let selectAll = this.getSelectAll();
        let newRow = {
            AccountPhoneNumberId: uuidv4(), AccountId: this.state.accountId,
            PhoneNumberType: null,
            PhoneNumber: null,
            IsSMS: selectAll["IsSMSAll"],
            IsActive: selectAll["IsActiveAll"],
            IsPrimary: false
        }
        phones = this.state.data.concat(newRow);
        //console.log("phones = ", phones);
        return phones;
    }

    handleAddNewRow(e) {
        let phones = this.addNewRow();
        let listErrors = this.compileListErrors();
        console.log("(handleAddNewRow) phonesErrors = ", listErrors.phonesErrors);
        this.setState({
            data: phones,
            selectAll: this.getSelectAll(),
            phonesErrors: listErrors.phonesErrors
        });
        this.props.handleUpdates(phones, listErrors);
    }

    handleRemove(e) {
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let data = this.state.data;
        let index = this.getIndex(data, "AccountPhoneNumberId", row.AccountPhoneNumberId);
        if (index > -1) {
            data.splice(index, 1);
        }
        let listErrors = this.compileListErrors();
        console.log("(handleRemove) phonesErrors = ", listErrors.phonesErrors);
        this.setState({
            data: data,
            phonesErrors: listErrors.phonesErrors
        });
        this.props.handleUpdates(phones, listErrors);
    }

    handleRemoveAll(e) {
        let data = this.state.data;
        data.splice(0);
        let listErrors = this.compileListErrors();
        console.log("(handleRemove) phonesErrors = ", listErrors.phonesErrors);
        this.setState({
            data: data,
            phonesErrors: listErrors.phonesErrors
        });
        this.props.handleUpdates(phones, listErrors);
    }

    handlePhoneTypeChange(value, id) {
        let match = phoneTypes.find((item) => item.PhoneTypeId === value);
        if (match != null) {
            let index = this.getIndex(phones, "AccountPhoneNumberId", id);
            if (index > -1) {
                phones[index].PhoneNumberType = value.trim();
            }
        }
        let listErrors = this.compileListErrors();
        console.log("(handlePhoneTypeChange) phonesErrors = ", listErrors.phonesErrors);
        this.setState({
            data: phones,
            phonesErrors: listErrors.phonesErrors
        });
        this.props.handleUpdates(phones, listErrors.phonesErrors);
    }

    handleChange(e) {
        let phnTypeErrors = this.state.phnTypeErrors;
        let phnNumberErrors = this.state.phnNumberErrors;
        let data = JSON.parse(e.target.getAttribute("data-value"));
        let index = this.getIndex(phones, "AccountPhoneNumberId", data.AccountPhoneNumberId);
        let value = e.target.value;
        switch (e.target.name) {
            case "phnType":
                phnTypeErrors = this.updateErrors(phnTypeErrors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { phones[index].PhoneNumberType = value; }
                break;
            case "phnNumber":
                phnNumberErrors = this.updateErrors(phnNumberErrors, e.target.id, value, e.target.name);
                // set the value for the specific item
                if (index > -1) { phones[index].PhoneNumber = value; }
                break;
            default:
                break;
        }
        let phonesErrors = this.getPhonesErrors(phnTypeErrors, phnNumberErrors);
        console.log("(handleChange) phonesErrors = ", phonesErrors);
        this.setState({
            [e.target.name]: value,
            data: phones,
            phnTypeErrors: phnTypeErrors,
            phnNumberErrors: phnNumberErrors,
            phonesErrors: phonesErrors
        });
        let listErrors = this.compileListErrors();
        this.props.handleUpdates(phones, listErrors);
    }

    handleBlur(e) {
        this.setState({
            [e.target.name]: e.target.value.trim()
        });
    }

    render() {
        let data = phones;
        let showSummaryErrors = this.props.showSummaryErrors;
        let listErrors = this.compileListErrors();
        let phnTypeErrors = showSummaryErrors ? listErrors.phnTypeErrors : this.state.phnTypeErrors;
        let phnNumberErrors = showSummaryErrors ? listErrors.phnNumberErrors : this.state.phnNumberErrors;
        let phonesErrors = this.state.phonesErrors;
        console.log("phonesErrors = ", phonesErrors);
        let that = this;
        return (
                            <div className="card-block">
                                <section>
                                    <div>
                                        <p>Please provide the contact phone numbers for the account.</p>
                                    </div>
                                    <table className="table table-striped table-bordered regen kcp-phn" id="columnFilteredTable">
                                        <thead>
                                            <tr>
                                                <th>Type</th>
                                                <th>Number</th>
                                                <th>
                                                    <i id="IsSMSAll" name="IsSMSAll"
                                                        className={this.state.selectAll["IsSMSAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                        onClick={this.handleSelectAll}
                                                        data-type="IsSMS"
                                                        aria-hidden="true"></i>
                                                    <span>&nbsp;Contact Via SMS</span>
                                                </th>
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
                                                <td>Number</td>
                                                <th colSpan="4"/>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.map(function (data, index) {
                                                let typeErrors = null;
                                                //console.log("phnTypeErrors = ", phnTypeErrors);
                                                if (phnTypeErrors != null) {
                                                    typeErrors = phnTypeErrors["phn_type_" + data.AccountPhoneNumberId];
                                                }
                                                let numberErrors = null;
                                                //console.log("phnNumberErrors = ", phnNumberErrors);
                                                if (phnNumberErrors != null) {
                                                    numberErrors = phnNumberErrors["phn_nbr_" + data.AccountPhoneNumberId];
                                                }
                                                return (
                                                    <tr key={"data" + index}>
                                                        <td>
                                                            <ValidationSelect isRequired={true} receivedData={that.state.receivedData}
                                                                style={{ width: '110px' }} 
                                                                id={"phn_type_" + data.AccountPhoneNumberId} name="phnType"
                                                                placeholder="Type"
                                                                valueKey="PhoneTypeId" labelKey="PhoneTypeName"
                                                                value={data.PhoneNumberType}
                                                                data={that.state.phoneTypes}
                                                                validation={that.validation} errors={typeErrors}
                                                                handleChange={(e) => that.handlePhoneTypeChange(e, data.AccountPhoneNumberId, data.PhoneNumberType)}
                                                                handleBlur={(e) => that.handlePhoneTypeChange(e, data.AccountPhoneNumberId, data.PhoneNumberType)} />  
                                                        </td>
                                                        <td>
                                                            <ValidationInput isRequired={true}
                                                                style={{ width: '150px' }} 
                                                                id={"phn_nbr_" + data.AccountPhoneNumberId}
                                                                name="phnNumber" value={data.PhoneNumber}
                                                                data={data}
                                                                validation={that.validation} errors={numberErrors}
                                                                handleChange={that.handleChange} handleBlur={that.handleChange} />
                                                        </td>
                                                        <td>
                                                            <i id={"phn_sms_" + data.AccountPhoneNumberId}
                                                                name="PhoneSelected"
                                                                className={data.IsSMS ? "fa fa-check-square-o" : "fa fa-square-o"} style={{ width: '65px' }}
                                                                onClick={that.handleSelect}
                                                                data-value={JSON.stringify(data)} data-type="IsSMS"
                                                                aria-hidden="true"></i>
                                                        </td>
                                                        <td>
                                                            <i id={"phn_active_" + data.AccountPhoneNumberId}
                                                                name="PhoneSelected"
                                                                className={data.IsActive ? "fa fa-check-square-o" : "fa fa-square-o"} style={{ width: '65px' }}
                                                                onClick={that.handleSelect}
                                                                data-value={JSON.stringify(data)} data-type="IsActive"
                                                                aria-hidden="true"></i>
                                                        </td>
                                                        <td>
                                                            <i id={"phn_primary_" + data.AccountPhoneNumberId}
                                                                name="PhonePrimary"
                                                                className={data.IsPrimary ? "fa fa-check-square-o" : "fa fa-square-o"} style={{ width: '65px' }}
                                                                onClick={that.handleSelectExclusive}
                                                                data-value={JSON.stringify(data)} data-type="IsPrimary"
                                                                aria-hidden="true"></i>
                                                        </td>
                                                        <td>
                                                            <i id={"phn_delete_" + data.AccountPhoneNumberId}
                                                                name="PhoneSelected"
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
                                            {this.validation.getClass(phonesErrors) === " invalid" ?
                                                phonesErrors.map(function (error, index) {
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