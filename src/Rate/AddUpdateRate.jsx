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
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';

export default class AddUpdateRate extends React.Component {
    constructor(props) {
        super(props);
        let editMode = false;
        let rateId = "00000000-0000-0000-0000-000000000000";
        let isReserved = false;
        if (props != null && props.location != null && props.location.state != null) {
            if (props.location.state.editMode != null) editMode = props.location.state.editMode;
            if (props.location.state.rateId != null) rateId = props.location.state.rateId;
            if (props.location.state.isReserved != null) isReserved = props.location.state.isReserved;
        }
        //console.log("editMode = ", editMode, " | rateId = ", rateId, " | isReserved = ", isReserved);
        let action = editMode ? "Update" : "Create";
        this.state = {
            editMode: editMode,
            objectName: "Rate",
            action: action,
            complete: false,
            data: [],
            rateId: rateId,
            rateName: "",
            rateNames: [],
            baseSmsCharge: null,
            baseMmsCharge: null,
            baseVoiceCharge: null,
            baseFaxCharge: null,
            baseEmailCharge: null,
            baseSmsAllocation: null,
            baseMmsAllocation: null,
            baseVoiceAllocation: null,
            baseFaxAllocation: null,
            baseEmailAllocation: null,
            sendSmsRatePerUnit: null,
            sendMmsRatePerUnit: null,
            sendVoiceRatePerMinute: null,
            sendVoiceMinimumCharge: null,
            sendFaxRatePerUnit: null,
            sendEmailRatePerUnit: null,
            receiveSmsRatePerUnit: null,
            receiveMmsRatePerUnit: null,
            receiveVoiceRatePerMinute: null,
            receiveVoiceMinimumCharge: null,
            receiveFaxRatePerUnit: null,
            receiveEmailRatePerUnit: null,
            isDefault: false,
            isActive: false,
            isReserved: isReserved,
            rateNameErrors: null,
            baseSmsChargeErrors: null,
            baseMmsChargeErrors: null,
            baseVoiceChargeErrors: null,
            baseFaxChargeErrors: null,
            baseEmailChargeErrors: null,
            baseSmsAllocationErrors: null,
            baseMmsAllocationErrors: null,
            baseVoiceAllocationErrors: null,
            baseFaxAllocationErrors: null,
            baseEmailAllocationErrors: null,
            sendSmsRatePerUnitErrors: null,
            sendMmsRatePerUnitErrors: null,
            sendVoiceRatePerMinuteErrors: null,
            sendVoiceMinimumChargeErrors: null,
            sendFaxRatePerUnitErrors: null,
            sendEmailRatePerUnitErrors: null,
            receiveSmsRatePerUnitErrors: null,
            receiveMmsRatePerUnitErrors: null,
            receiveVoiceRatePerMinuteErrors: null,
            receiveVoiceMinimumChargeErrors: null,
            receiveFaxRatePerUnitErrors: null,
            receiveEmailRatePerUnitErrors: null,
            receivedData: false,
            alert: null,
            baseVideoChatCharge: null,
            baseVideoChatAllocation: null,
            sendVideoChatRatePerMinute: null,
            sendVideoChatMinimumCharge: null,
            receiveVideoChatRatePerMinute: null,
            receiveVideoChatMinimumCharge: null,
            baseVideoChatChargeErrors: null,
            baseVideoChatAllocationErrors: null,
            sendVideoChatRatePerMinuteErrors: null,
            sendVideoChatMinimumChargeErrors: null,
            receiveVideoChatRatePerMinuteErrors: null,
            receiveVideoChatMinimumChargeErrors: null                    
        };
        this.actionStatusTimer = false;
        this.formatting = new Formatting();
        this.validation = new Validation();
    }

    componentDidMount() {
        let apiBaseUrl = Configuration().apiUrl;
        if (!this.state.editMode || this.state.rateId == null) {
            axios.get(apiBaseUrl + 'api/Rates/Names')
                .then(response => {
                    SetAuthorizationToken(response.headers.token);
                    let rateNames = JSON.parse(response.data);
                    //console.log("rateNames = ", rateNames);
                    this.setState({
                        rateNames: rateNames || [],
                        receivedData: true
                    });
                })
                .catch((error) => {
                    if (error != null && error.response != null && error.response.status === 504) {
                        localStorage.removeItem('token');
                        this.props.history.push("/Login");
                    }
                    console.log("error", error);
                });
            return;
        }

        let that = this;
        axios.all([
            axios.get(apiBaseUrl + 'api/Rates/' + this.state.rateId),
            axios.get(apiBaseUrl + 'api/Rates/' + this.state.rateId + '/OtherNames')
        ])
            .then(axios.spread(function (rate, otherNames) {
                SetAuthorizationToken(otherNames.headers.token);
                let data = JSON.parse(rate.data)
                //console.log("data = ", data);
                let rateNames = JSON.parse(otherNames.data);
                //console.log("rateNames = ", rateNames);
                that.setState({
                    data: data,
                    rateName: data.RateName,
                    rateNames: rateNames,
                    baseSmsCharge: data.BaseSMSCharge,
                    baseMmsCharge: data.BaseMMSCharge,
                    baseVoiceCharge: data.BaseVoiceCharge,
                    baseFaxCharge: data.BaseFaxCharge,
                    baseEmailCharge: data.BaseEmailCharge,
                    baseSmsAllocation: data.BaseSMSAllocation,
                    baseMmsAllocation: data.BaseMMSAllocation,
                    baseVoiceAllocation: data.BaseVoiceAllocation,
                    baseFaxAllocation: data.BaseFaxAllocation,
                    baseEmailAllocation: data.BaseEmailAllocation,
                    sendSmsRatePerUnit: data.SendSMSRatePerUnit,
                    sendMmsRatePerUnit: data.SendMMSRatePerUnit,
                    sendVoiceRatePerMinute: data.SendVoiceRatePerMinute,
                    sendVoiceMinimumCharge: data.SendVoiceMinimumCharge,
                    sendFaxRatePerUnit: data.SendFaxRatePerUnit,
                    sendEmailRatePerUnit: data.SendEmailRatePerUnit,
                    receiveSmsRatePerUnit: data.ReceiveSMSRatePerUnit,
                    receiveMmsRatePerUnit: data.ReceiveMMSRatePerUnit,
                    receiveVoiceRatePerMinute: data.ReceiveVoiceRatePerMinute,
                    receiveVoiceMinimumCharge: data.ReceiveVoiceMinimumCharge,
                    receiveFaxRatePerUnit: data.ReceiveFaxRatePerUnit,
                    receiveEmailRatePerUnit: data.ReceiveEmailRatePerUnit,
                    isDefault: data.IsDefault,
                    isActive: data.IsActive,
                    receivedData: true,
                    baseVideoChatCharge: data.BaseVideoChatCharge,
                    baseVideoChatAllocation: data.BaseVideoChatAllocation,
                    sendVideoChatRatePerMinute: data.SendVideoChatRatePerMinute,
                    sendVideoChatMinimumCharge: data.SendVideoChatMinimumCharge,
                    receiveVideoChatRatePerMinute: data.ReceiveVideoChatRatePerMinute,
                    receiveVideoChatMinimumCharge: data.receiveVideoChatMinimumCharge
                });
            }))
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    that.props.history.push("/Login");
                }
                this.setState({
                    receivedData: true
                });
                console.log("error", error);
            });
    }

    componentWillUnmount() {
        this.validation = null;
        this.formatting = null;
    }

    strVal = (value) => {
        return value != null ? String(value) : "";
    }

    getRateNameErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (value != null && String.prototype.trim.call(value) === "") errors.push("Must contain at least 1 valid non-whitespace character.");
        if (!this.validation.patternValid(value, "^[A-Za-z0-9 _]+$", "")) errors.push("Can contain only letters, numbers, spaces, and underscores.");
        if (value != null && !this.validation.uniqueValid(value.trim(), this.state.rateNames, "RateName")) errors.push(this.validation.uniqueInvalidMessage(value.trim()));
        return errors;
    }

    getBaseErrors = (value) => {
        let errors = [];
        let min = 0.000000, p = 12, s = 6;
        if (!this.validation.numberMinValid(value, min)) errors.push(this.validation.numberMinInvalidMessage(min));
        if (!this.validation.decimalValid((value || "").toString(), p, s)) errors.push(this.validation.decimalInvalidMessage(p, s));
        return errors;
    }

    getAllocationErrors = (value) => {
        let errors = [];
        let min = 0;
        if (!this.validation.numberMinValid(value, min)) errors.push(this.validation.numberMinInvalidMessage(min));
        return errors;
    }

    getRatePerErrors = (value) => {
        let errors = [];
        let min = 0.000001, max = 10, p = 12, s = 6;
        if (!this.validation.numberMinValid(value, min)) errors.push(this.validation.numberMinInvalidMessage(min));
        if (!this.validation.numberMaxValid(value, max)) errors.push(this.validation.numberMaxInvalidMessage(max));
        if (!this.validation.decimalValid((value || "").toString(), p, s)) errors.push(this.validation.decimalInvalidMessage(p, s));
        return errors;
    }

    getFormValid = (...args) => {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    handleChange = (e) => {
        let rateNameErrors = this.state.rateNameErrors;
        let baseSmsChargeErrors = this.state.baseSmsChargeErrors;
        let baseMmsChargeErrors = this.state.baseMmsChargeErrors;
        let baseVoiceChargeErrors = this.state.baseVoiceChargeErrors;
        let baseFaxChargeErrors = this.state.baseFaxChargeErrors;
        let baseEmailChargeErrors = this.state.baseEmailChargeErrors;
        let baseSmsAllocationErrors = this.state.baseSmsAllocationErrors;
        let baseMmsAllocationErrors = this.state.baseMmsAllocationErrors;
        let baseVoiceAllocationErrors = this.state.baseVoiceAllocationErrors;
        let baseFaxAllocationErrors = this.state.baseFaxAllocationErrors;
        let baseEmailAllocationErrors = this.state.baseEmailAllocationErrors;
        let sendSmsRatePerUnitErrors = this.state.sendSmsRatePerUnitErrors;
        let sendMmsRatePerUnitErrors = this.state.sendMmsRatePerUnitErrors;
        let sendVoiceRatePerMinuteErrors = this.state.sendVoiceRatePerMinuteErrors;
        let sendVoiceMinimumChargeErrors = this.state.sendVoiceMinimumChargeErrors;
        let sendFaxRatePerUnitErrors = this.state.sendFaxRatePerUnitErrors;
        let sendEmailRatePerUnitErrors = this.state.sendEmailRatePerUnitErrors;
        let receiveSmsRatePerUnitErrors = this.state.receiveSmsRatePerUnitErrors;
        let receiveMmsRatePerUnitErrors = this.state.receiveMmsRatePerUnitErrors;
        let receiveVoiceRatePerMinuteErrors = this.state.receiveVoiceRatePerMinuteErrors;
        let receiveVoiceMinimumChargeErrors = this.state.receiveVoiceMinimumChargeErrors;
        let receiveFaxRatePerUnitErrors = this.state.receiveFaxRatePerUnitErrors;
        let receiveEmailRatePerUnitErrors = this.state.receiveEmailRatePerUnitErrors;
        let baseVideoChatChargeErrors = this.state.baseVideoChatChargeErrors;
        let baseVideoChatAllocationErrors = this.state.baseVideoChatAllocationErrors;
        let sendVideoChatRatePerMinuteErrors = this.state.sendVideoChatRatePerMinuteErrors;
        let sendVideoChatMinimumChargeErrors = this.state.sendVideoChatMinimumChargeErrors;
        let receiveVideoChatRatePerMinuteErrors = this.state.receiveVideoChatRatePerMinuteErrors;
        let receiveVideoChatMinimumChargeErrors = this.state.receiveVideoChatMinimumChargeErrors;
        
        let value = e.target.value;
        //console.log("id = ", e.target.id, "| name = ", e.target.name, "| value = ", value);
        switch (e.target.name) {
            case "rateName": rateNameErrors = this.state.isReserved ? [] : this.getRateNameErrors(value); break;
            case "baseSmsCharge": baseSmsChargeErrors = this.getBaseErrors(value); break;
            case "baseMmsCharge": baseMmsChargeErrors = this.getBaseErrors(value); break;
            case "baseVoiceCharge": baseVoiceChargeErrors = this.getBaseErrors(value); break;
            case "baseFaxCharge": baseFaxChargeErrors = this.getBaseErrors(value); break;
            case "baseEmailCharge": baseEmailChargeErrors = this.getBaseErrors(value); break;
            case "baseSmsAllocation": baseSmsAllocationErrors = this.getAllocationErrors(value); break;
            case "baseMmsAllocation": baseMmsAllocationErrors = this.getAllocationErrors(value); break;
            case "baseVoiceAllocation": baseVoiceAllocationErrors = this.getAllocationErrors(value); break;
            case "baseFaxAllocation": baseFaxAllocationErrors = this.getAllocationErrors(value); break;
            case "baseEmailAllocation": baseEmailAllocationErrors = this.getAllocationErrors(value); break;
            case "sendSmsRatePerUnit": sendSmsRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "sendMmsRatePerUnit": sendMmsRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "sendVoiceRatePerMinute": sendVoiceRatePerMinuteErrors = this.getRatePerErrors(value); break;
            case "sendVoiceMinimumCharge": sendVoiceMinimumChargeErrors = this.getRatePerErrors(value); break;
            case "sendFaxRatePerUnit": sendFaxRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "sendEmailRatePerUnit": sendEmailRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "receiveSmsRatePerUnit": receiveSmsRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "receiveMmsRatePerUnit": receiveMmsRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "receiveVoiceRatePerMinute": receiveVoiceRatePerMinuteErrors = this.getRatePerErrors(value); break;
            case "receiveVoiceMinimumCharge": receiveVoiceMinimumChargeErrors = this.getRatePerErrors(value); break;
            case "receiveFaxRatePerUnit": receiveFaxRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "receiveEmailRatePerUnit": receiveEmailRatePerUnitErrors = this.getRatePerErrors(value); break;
            case "baseVideoChatChargeErrors" : this.getBaseErrors(value); break;
            case "baseVideoChatAllocationErrors": this.getAllocationErrors(value);break;
            case "sendVideoChatRatePerMinuteErrors": this.getRatePerErrors(value); break;
            case "sendVideoChatMinimumChargeErrors": this.getRatePerErrors(value); break;
            case "receiveVideoChatRatePerMinuteErrors":this.getRatePerErrors(value); break;
            case "receiveVideoChatMinimumChargeErrors": this.getRatePerErrors(value); break;
            default: break;
        }
        this.setState({
            [e.target.name]: value,
            rateNameErrors: rateNameErrors,
            baseSmsChargeErrors: baseSmsChargeErrors,
            baseMmsChargeErrors: baseMmsChargeErrors,
            baseVoiceChargeErrors: baseVoiceChargeErrors,
            baseFaxChargeErrors: baseFaxChargeErrors,
            baseEmailChargeErrors: baseEmailChargeErrors,
            baseSmsAllocationErrors: baseSmsAllocationErrors,
            baseMmsAllocationErrors: baseMmsAllocationErrors,
            baseVoiceAllocationErrors: baseVoiceAllocationErrors,
            baseFaxAllocationErrors: baseFaxAllocationErrors,
            baseEmailAllocationErrors: baseEmailAllocationErrors,
            sendSmsRatePerUnitErrors: sendSmsRatePerUnitErrors,
            sendMmsRatePerUnitErrors: sendMmsRatePerUnitErrors,
            sendVoiceRatePerMinuteErrors: sendVoiceRatePerMinuteErrors,
            sendVoiceMinimumChargeErrors: sendVoiceMinimumChargeErrors,
            sendFaxRatePerUnitErrors: sendFaxRatePerUnitErrors,
            sendEmailRatePerUnitErrors: sendEmailRatePerUnitErrors,
            receiveSmsRatePerUnitErrors: receiveSmsRatePerUnitErrors,
            receiveMmsRatePerUnitErrors: receiveMmsRatePerUnitErrors,
            receiveVoiceRatePerMinuteErrors: receiveVoiceRatePerMinuteErrors,
            receiveVoiceMinimumChargeErrors: receiveVoiceMinimumChargeErrors,
            receiveFaxRatePerUnitErrors: receiveFaxRatePerUnitErrors,
            receiveEmailRatePerUnitErrors: receiveEmailRatePerUnitErrors,
            baseVideoChatChargeErrors 			:baseVideoChatChargeErrors,
            baseVideoChatAllocationErrors 		:baseVideoChatAllocationErrors,
            sendVideoChatRatePerMinuteErrors 	:sendVideoChatRatePerMinuteErrors,
            sendVideoChatMinimumChargeErrors 	:sendVideoChatMinimumChargeErrors,
            receiveVideoChatRatePerMinuteErrors :receiveVideoChatRatePerMinuteErrors,
            receiveVideoChatMinimumChargeErrors :receiveVideoChatMinimumChargeErrors 
        });
    }

    handleCheckboxChange = (e) => {
        let updateState = { [e.target.name]: e.target.checked };
        if (
            (e.target.name === "isDefault" && e.target.checked && !this.state.isActive) ||
            (e.target.name === "isActive" && !e.target.checked && this.state.isDefault)
        ) {
            updateState["isActive"] = true;
        }
        this.setState(updateState);
    }

    handleBlur = (e) => {
        this.setState({ [e.target.name]: e.target.value.trim() });
    }

    validate = (e) => {
        e.preventDefault();
        let rateName = (this.state.rateName || "").trim();
        let rateNameErrors = this.state.isReserved ? [] : this.getRateNameErrors(rateName);
        let baseSmsCharge = this.state.baseSmsCharge;
        let baseSmsChargeErrors = this.getBaseErrors(baseSmsCharge);
        let baseMmsCharge = this.state.baseMmsCharge;
        let baseMmsChargeErrors = this.getBaseErrors(baseMmsCharge);
        let baseVoiceCharge = this.state.baseVoiceCharge;
        let baseVoiceChargeErrors = this.getBaseErrors(baseVoiceCharge);
        let baseFaxCharge = this.state.baseFaxCharge;
        let baseFaxChargeErrors = this.getBaseErrors(baseFaxCharge);
        let baseEmailCharge = this.state.baseEmailCharge;
        let baseEmailChargeErrors = this.getBaseErrors(baseEmailCharge);
        let baseSmsAllocation = this.state.baseSmsAllocation;
        let baseSmsAllocationErrors = this.getAllocationErrors(baseSmsAllocation);
        let baseMmsAllocation = this.state.baseMmsAllocation;
        let baseMmsAllocationErrors = this.getAllocationErrors(baseMmsAllocation);
        let baseVoiceAllocation = this.state.baseVoiceAllocation;
        let baseVoiceAllocationErrors = this.getAllocationErrors(baseVoiceAllocation);
        let baseFaxAllocation = this.state.baseFaxAllocation;
        let baseFaxAllocationErrors = this.getAllocationErrors(baseFaxAllocation);
        let baseEmailAllocation = this.state.baseEmailAllocation;
        let baseEmailAllocationErrors = this.getAllocationErrors(baseEmailAllocation);
        let sendSmsRatePerUnit = this.state.sendSmsRatePerUnit;
        let sendSmsRatePerUnitErrors = this.getRatePerErrors(sendSmsRatePerUnit);
        let sendMmsRatePerUnit = this.state.sendMmsRatePerUnit;
        let sendMmsRatePerUnitErrors = this.getRatePerErrors(sendMmsRatePerUnit);
        let sendVoiceRatePerMinute = this.state.sendVoiceRatePerMinute;
        let sendVoiceRatePerMinuteErrors = this.getRatePerErrors(sendVoiceRatePerMinute);
        let sendVoiceMinimumCharge = this.state.sendVoiceMinimumCharge;
        let sendVoiceMinimumChargeErrors = this.getRatePerErrors(sendVoiceMinimumCharge);
        let sendFaxRatePerUnit = this.state.sendFaxRatePerUnit;
        let sendFaxRatePerUnitErrors = this.getRatePerErrors(sendFaxRatePerUnit);
        let sendEmailRatePerUnit = this.state.sendEmailRatePerUnit;
        let sendEmailRatePerUnitErrors = this.getRatePerErrors(sendEmailRatePerUnit);
        let receiveSmsRatePerUnit = this.state.receiveSmsRatePerUnit;
        let receiveSmsRatePerUnitErrors = this.getRatePerErrors(receiveSmsRatePerUnit);
        let receiveMmsRatePerUnit = this.state.receiveMmsRatePerUnit;
        let receiveMmsRatePerUnitErrors = this.getRatePerErrors(receiveMmsRatePerUnit);
        let receiveVoiceRatePerMinute = this.state.receiveVoiceRatePerMinute;
        let receiveVoiceRatePerMinuteErrors = this.getRatePerErrors(receiveVoiceRatePerMinute);
        let receiveVoiceMinimumCharge = this.state.receiveVoiceMinimumCharge;
        let receiveVoiceMinimumChargeErrors = this.getRatePerErrors(receiveVoiceMinimumCharge);
        let receiveFaxRatePerUnit = this.state.receiveFaxRatePerUnit;
        let receiveFaxRatePerUnitErrors = this.getRatePerErrors(receiveFaxRatePerUnit);
        let receiveEmailRatePerUnit = this.state.receiveEmailRatePerUnit;
        let receiveEmailRatePerUnitErrors = this.getRatePerErrors(receiveEmailRatePerUnit);
        let isDefault = this.state.isDefault;
        let isActive = this.state.isActive;
		let baseVideoChatCharge = this.state.baseVideoChatCharge;
		let baseVideoChatChargeErrors = this.getBaseErrors(baseVideoChatCharge);
		let baseVideoChatAllocation = this.state.baseVideoChatAllocation;
		let baseVideoChatAllocationErrors = this.getBaseErrors(baseVideoChatAllocation);
		let sendVideoChatRatePerMinute  = this.state.sendVideoChatRatePerMinute;
		let sendVideoChatRatePerMinuteErrors = this.getRatePerErrors(sendVideoChatRatePerMinute);
		let sendVideoChatMinimumCharge  = this.state.sendVideoChatMinimumCharge;
		let sendVideoChatMinimumChargeErrors = this.getRatePerErrors(sendVideoChatMinimumCharge);	
		let receiveVideoChatRatePerMinute  = this.state.receiveVideoChatRatePerMinute;
		let receiveVideoChatRatePerMinuteErrors = this.getRatePerErrors(receiveVideoChatRatePerMinute);
		let receiveVideoChatMinimumCharge  = this.state.receiveVideoChatMinimumCharge;
		let receiveVideoChatMinimumChargeErrors = this.getRatePerErrors(receiveVideoChatMinimumCharge);        
        /*console.log(rateNameErrors,
            baseSmsChargeErrors, baseSmsAllocationErrors,
            baseMmsChargeErrors, baseMmsAllocationErrors,
            baseVoiceChargeErrors, baseVoiceAllocationErrors,
            baseFaxChargeErrors, baseFaxAllocationErrors,
            baseEmailChargeErrors, baseEmailAllocationErrors,
            sendSmsRatePerUnitErrors, receiveSmsRatePerUnitErrors,
            sendMmsRatePerUnitErrors, receiveMmsRatePerUnitErrors,
            sendVoiceRatePerMinuteErrors, receiveVoiceRatePerMinuteErrors,
            sendVoiceMinimumChargeErrors, receiveVoiceMinimumChargeErrors,
            sendFaxRatePerUnitErrors, receiveFaxRatePerUnitErrors,
            sendEmailRatePerUnitErrors, receiveEmailRatePerUnitErrors);*/
        let formValid = this.getFormValid(rateNameErrors,
            baseSmsChargeErrors, baseSmsAllocationErrors,
            baseMmsChargeErrors, baseMmsAllocationErrors,
            baseVoiceChargeErrors, baseVoiceAllocationErrors,
            baseFaxChargeErrors, baseFaxAllocationErrors,
            baseEmailChargeErrors, baseEmailAllocationErrors,
            sendSmsRatePerUnitErrors, receiveSmsRatePerUnitErrors,
            sendMmsRatePerUnitErrors, receiveMmsRatePerUnitErrors,
            sendVoiceRatePerMinuteErrors, receiveVoiceRatePerMinuteErrors,
            sendVoiceMinimumChargeErrors, receiveVoiceMinimumChargeErrors,
            sendFaxRatePerUnitErrors, receiveFaxRatePerUnitErrors,
            sendEmailRatePerUnitErrors, receiveEmailRatePerUnitErrors, 
            baseVideoChatChargeErrors, baseVideoChatAllocationErrors, 
            sendVideoChatRatePerMinuteErrors, sendVideoChatMinimumChargeErrors,
            receiveVideoChatRatePerMinuteErrors, receiveVideoChatMinimumChargeErrors);
        if (formValid) {
            let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Rates/" + change;
            let payload = {
                RateId: this.state.editMode ? this.state.rateId : null,
                RateName: this.state.rateName,
                BaseSMSCharge: baseSmsCharge,
                BaseMMSCharge: baseMmsCharge,
                BaseVoiceCharge: baseVoiceCharge,
                BaseFaxCharge: baseFaxCharge,
                BaseEmailCharge: baseEmailCharge,
                BaseSMSAllocation: baseSmsAllocation,
                BaseMMSAllocation: baseMmsAllocation,
                BaseVoiceAllocation: baseVoiceAllocation,
                BaseFaxAllocation: baseFaxAllocation,
                BaseEmailAllocation: baseEmailAllocation,
                SendSMSRatePerUnit: sendSmsRatePerUnit,
                SendMMSRatePerUnit: sendMmsRatePerUnit,
                SendVoiceRatePerMinute: sendVoiceRatePerMinute,
                SendVoiceMinimumCharge: sendVoiceMinimumCharge,
                SendFaxRatePerUnit: sendFaxRatePerUnit,
                SendEmailRatePerUnit: sendEmailRatePerUnit,
                ReceiveSMSRatePerUnit: receiveSmsRatePerUnit,
                ReceiveMMSRatePerUnit: receiveMmsRatePerUnit,
                ReceiveVoiceRatePerMinute: receiveVoiceRatePerMinute,
                ReceiveVoiceMinimumCharge: receiveVoiceMinimumCharge,
                ReceiveFaxRatePerUnit: receiveFaxRatePerUnit,
                ReceiveEmailRatePerUnit: receiveEmailRatePerUnit,
                IsDefault: isDefault,
                IsActive: isActive,
                BaseVideoChatCharge : baseVideoChatCharge,
                BaseVideoChatAllocation : baseVideoChatAllocation,
                SendVideoChatRatePerMinute : sendVideoChatRatePerMinute,
                SendVideoChatMinimumCharge : sendVideoChatMinimumCharge,	
                ReceiveVideoChatRatePerMinute : receiveVideoChatRatePerMinute,
                ReceiveVideoChatMinimumCharge : receiveVideoChatMinimumCharge            
            };
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
                rateName: rateName,
                baseSmsCharge: baseSmsCharge,
                baseMmsCharge: baseMmsCharge,
                baseVoiceCharge: baseVoiceCharge,
                baseFaxCharge: baseFaxCharge,
                baseEmailCharge: baseEmailCharge,
                baseSmsAllocation: baseSmsAllocation,
                baseMmsAllocation: baseMmsAllocation,
                baseVoiceAllocation: baseVoiceAllocation,
                baseFaxAllocation: baseFaxAllocation,
                baseEmailAllocation: baseEmailAllocation,
                sendSmsRatePerUnit: sendSmsRatePerUnit,
                sendMmsRatePerUnit: sendMmsRatePerUnit,
                sendVoiceRatePerMinute: sendVoiceRatePerMinute,
                sendFaxRatePerUnit: sendFaxRatePerUnit,
                sendEmailRatePerUnit: sendEmailRatePerUnit,
                receiveSmsRatePerUnit: receiveSmsRatePerUnit,
                receiveMmsRatePerUnit: receiveMmsRatePerUnit,
                receiveVoiceRatePerMinute: receiveVoiceRatePerMinute,
                receiveFaxRatePerUnit: receiveFaxRatePerUnit,
                receiveEmailRatePerUnit: receiveEmailRatePerUnit,
                isDefault: isDefault,
                isActive: isActive,
                rateNameErrors: rateNameErrors,
                baseSmsChargeErrors: baseSmsChargeErrors,
                baseMmsChargeErrors: baseMmsChargeErrors,
                baseVoiceChargeErrors: baseVoiceChargeErrors,
                baseFaxChargeErrors: baseFaxChargeErrors,
                baseEmailChargeErrors: baseEmailChargeErrors,
                baseSmsAllocationErrors: baseSmsAllocationErrors,
                baseMmsAllocationErrors: baseMmsAllocationErrors,
                baseVoiceAllocationErrors: baseVoiceAllocationErrors,
                baseFaxAllocationErrors: baseFaxAllocationErrors,
                baseEmailAllocationErrors: baseEmailAllocationErrors,
                sendSmsRatePerUnitErrors: sendSmsRatePerUnitErrors,
                sendMmsRatePerUnitErrors: sendMmsRatePerUnitErrors,
                sendVoiceRatePerMinuteErrors: sendVoiceRatePerMinuteErrors,
                sendVoiceMinimumChargeErrors: sendVoiceMinimumChargeErrors,
                sendFaxRatePerUnitErrors: sendFaxRatePerUnitErrors,
                sendEmailRatePerUnitErrors: sendEmailRatePerUnitErrors,
                receiveSmsRatePerUnitErrors: receiveSmsRatePerUnitErrors,
                receiveMmsRatePerUnitErrors: receiveMmsRatePerUnitErrors,
                receiveVoiceRatePerMinuteErrors: receiveVoiceRatePerMinuteErrors,
                receiveVoiceMinimumChargeErrors: receiveVoiceMinimumChargeErrors,
                receiveFaxRatePerUnitErrors: receiveFaxRatePerUnitErrors,
                receiveEmailRatePerUnitErrors: receiveEmailRatePerUnitErrors,
                baseVideoChatCharge : baseVideoChatCharge,
                baseVideoChatAllocation : baseVideoChatAllocation,
                sendVideoChatRatePerMinute : sendVideoChatRatePerMinute,
                sendVideoChatMinimumCharge : sendVideoChatMinimumCharge,	
                receiveVideoChatRatePerMinute : receiveVideoChatRatePerMinute,
                receiveVideoChatMinimumCharge : receiveVideoChatMinimumCharge,
                baseVideoChatChargeErrors : baseVideoChatChargeErrors, 			
                baseVideoChatAllocationErrors : baseVideoChatAllocationErrors, 		
                sendVideoChatRatePerMinuteErrors : sendVideoChatRatePerMinuteErrors,	 
                sendVideoChatMinimumChargeErrors : sendVideoChatMinimumChargeErrors, 	
                receiveVideoChatRatePerMinuteErrors : receiveVideoChatRatePerMinuteErrors, 
                receiveVideoChatMinimumChargeErrors : receiveVideoChatMinimumChargeErrors
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
            this.props.history.push("/Layout/Rates");
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
                                    <h2 className="card-title">{editMode ? "Edit" : "Create"} Rate{editMode ? " - " + this.state.rateName : ""}</h2>
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
                                    <fieldset>
                                        <div>
                                            <p>Please provide base charge, allocation, send and receive rate values. Default rates must be active.</p>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                <div><span className="danger">*</span> denotes required field<br /><br /></div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                <ValidationInput label="Rate Name:" isRequired={true} readOnly={this.state.isReserved}
                                                    name="rateName" value={this.state.rateName}
                                                    validation={this.validation} errors={this.state.rateNameErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                                SMS
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                <ValidationInput label="Base Charge($):" isRequired={true}
                                                    name="baseSmsCharge" value={this.strVal(this.state.baseSmsCharge)}
                                                    validation={this.validation} errors={this.state.baseSmsChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Base Allocation:" isRequired={true}
                                                    name="baseSmsAllocation" value={this.strVal(this.state.baseSmsAllocation)}
                                                    validation={this.validation} errors={this.state.baseSmsAllocationErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Rate Per Unit($):" isRequired={true}
                                                    name="sendSmsRatePerUnit" value={this.strVal(this.state.sendSmsRatePerUnit)}
                                                    validation={this.validation} errors={this.state.sendSmsRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Rate Per Unit($):" isRequired={true}
                                                    name="receiveSmsRatePerUnit" value={this.strVal(this.state.receiveSmsRatePerUnit)}
                                                    validation={this.validation} errors={this.state.receiveSmsRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                                MMS
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                <ValidationInput label="Base Charge($):" isRequired={true}
                                                    name="baseMmsCharge" value={this.strVal(this.state.baseMmsCharge)}
                                                    validation={this.validation} errors={this.state.baseMmsChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Base Allocation:" isRequired={true}
                                                    name="baseMmsAllocation" value={this.strVal(this.state.baseMmsAllocation)}
                                                    validation={this.validation} errors={this.state.baseMmsAllocationErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send MMS Rate Per Unit($):" isRequired={true}
                                                    name="sendMmsRatePerUnit" value={this.strVal(this.state.sendMmsRatePerUnit)}
                                                    validation={this.validation} errors={this.state.sendMmsRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive MMS Rate Per Unit($):" isRequired={true}
                                                    name="receiveMmsRatePerUnit" value={this.strVal(this.state.receiveMmsRatePerUnit)}
                                                    validation={this.validation} errors={this.state.receiveMmsRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                                Voice
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                <ValidationInput label="Base Charge($):" isRequired={true}
                                                    name="baseVoiceCharge" value={this.strVal(this.state.baseVoiceCharge)}
                                                    validation={this.validation} errors={this.state.baseVoiceChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Base Allocation:" isRequired={true}
                                                    name="baseVoiceAllocation" value={this.strVal(this.state.baseVoiceAllocation)}
                                                    validation={this.validation} errors={this.state.baseVoiceAllocationErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Rate Per Minute($):" isRequired={true}
                                                    name="sendVoiceRatePerMinute" value={this.strVal(this.state.sendVoiceRatePerMinute)}
                                                    validation={this.validation} errors={this.state.sendVoiceRatePerMinuteErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Rate Per Minute($):" isRequired={true}
                                                    name="receiveVoiceRatePerMinute" value={this.strVal(this.state.receiveVoiceRatePerMinute)}
                                                    validation={this.validation} errors={this.state.receiveVoiceRatePerMinuteErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Minimum Charge($):" isRequired={true}
                                                    name="sendVoiceMinimumCharge" value={this.strVal(this.state.sendVoiceMinimumCharge)}
                                                    validation={this.validation} errors={this.state.sendVoiceMinimumChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Minimum Charge($):" isRequired={true}
                                                    name="receiveVoiceMinimumCharge" value={this.strVal(this.state.receiveVoiceMinimumCharge)}
                                                    validation={this.validation} errors={this.state.receiveVoiceMinimumChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                                Fax
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                <ValidationInput label="Base Charge($):" isRequired={true}
                                                    name="baseFaxCharge" value={this.strVal(this.state.baseFaxCharge)}
                                                    validation={this.validation} errors={this.state.baseFaxChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Base Allocation:" isRequired={true}
                                                    name="baseFaxAllocation" value={this.strVal(this.state.baseFaxAllocation)}
                                                    validation={this.validation} errors={this.state.baseFaxAllocationErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Rate Per Unit($):" isRequired={true}
                                                    name="sendFaxRatePerUnit" value={this.strVal(this.state.sendFaxRatePerUnit)}
                                                    validation={this.validation} errors={this.state.sendFaxRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Rate Per Unit($):" isRequired={true}
                                                    name="receiveFaxRatePerUnit" value={this.strVal(this.state.receiveFaxRatePerUnit)}
                                                    validation={this.validation} errors={this.state.receiveFaxRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                                Email
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                <ValidationInput label="Base Charge($):" isRequired={true}
                                                    name="baseEmailCharge" value={this.strVal(this.state.baseEmailCharge)}
                                                    validation={this.validation} errors={this.state.baseEmailChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Base Allocation:" isRequired={true}
                                                    name="baseEmailAllocation" value={this.strVal(this.state.baseEmailAllocation)}
                                                    validation={this.validation} errors={this.state.baseEmailAllocationErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Email Rate Per Unit($):" isRequired={true}
                                                    name="sendEmailRatePerUnit" value={this.strVal(this.state.sendEmailRatePerUnit)}
                                                    validation={this.validation} errors={this.state.sendEmailRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Email Rate Per Unit($):" isRequired={true}
                                                    name="receiveEmailRatePerUnit" value={this.strVal(this.state.receiveEmailRatePerUnit)}
                                                    validation={this.validation} errors={this.state.receiveEmailRatePerUnitErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-1 col-md-1 col-lg-1 col-xl-1">
                                                Video
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                <ValidationInput label="Base Charge($):" isRequired={true}
                                                    name="baseVideoChatCharge" value={this.strVal(this.state.baseVideoChatCharge)}
                                                    validation={this.validation} errors={this.state.baseVideoChatChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Base Allocation:" isRequired={true}
                                                    name="baseVideoChatAllocation" value={this.strVal(this.state.baseVideoChatAllocation)}
                                                    validation={this.validation} errors={this.state.baseVideoChatAllocationErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Rate Per Minute($):" isRequired={true}
                                                    name="sendVideoChatRatePerMinute" value={this.strVal(this.state.sendVideoChatRatePerMinute)}
                                                    validation={this.validation} errors={this.state.sendVideoChatRatePerMinuteErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Rate Per Minute($):" isRequired={true}
                                                    name="receiveVideoChatRatePerMinute" value={this.strVal(this.state.receiveVideoChatRatePerMinute)}
                                                    validation={this.validation} errors={this.state.receiveVideoChatRatePerMinuteErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Send Minimum Charge($):" isRequired={true}
                                                    name="sendVideoChatMinimumCharge" value={this.strVal(this.state.sendVideoChatMinimumCharge)}
                                                    validation={this.validation} errors={this.state.sendVideoChatMinimumChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationInput label="Receive Minimum Charge($):" isRequired={true}
                                                    name="receiveVideoChatMinimumCharge" value={this.strVal(this.state.receiveVideoChatMinimumCharge)}
                                                    validation={this.validation} errors={this.state.receiveVideoChatMinimumChargeErrors}
                                                    handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2 mb-1">
                                                <div className="form-group">
                                                    <label className="inline custom-control custom-checkbox block">
                                                        <input type="checkbox" className="custom-control-input" id="isDefault" name="isDefault" checked={this.state.isDefault} onChange={this.handleCheckboxChange} />
                                                        <span className="custom-control-indicator"></span>
                                                        <span className="custom-control-description ml-0">Default</span>
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2 mb-1">
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
                                    {this.state.complete ?
                                        <div className="pull-right">
                                            <Link to="/Layout/Rates" className="btn btn-default pull-right">Back to Rates</Link>
                                        </div>
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