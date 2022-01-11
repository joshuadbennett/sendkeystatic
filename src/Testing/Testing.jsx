import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import ApiActions from '../Components/ApiActions';
import SweetAlert from 'react-bootstrap-sweetalert';
import Captcha from '../Utils/Captcha';
import Validation from '../Components/Validation.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import base64ByteData from './Base64Bytes';

export default class Testing extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectName: "Test",
            data: [],
            action: "Send",
            magicWord: Captcha(5),
            username: "",
            authKey: "",
            apiToken: "",
            authenticated: false,
            loadTestRunning: false,
            loadTestData: [],
            loadTestFreq: 1,
            loadTestLimit: 1,
            msgTo: "",
            msgFrom: "",
            msgBody: "This is a test from Sendkey.",
            msgMediaUrl: "https://i.chzbgr.com/full/875511040/h8EB4D6E9/",
            msgMediaMimeType: base64ByteData.StopItNow.MediaMimeType,
            msgMediaBytes: base64ByteData.StopItNow.MediaBytes,
            voiceTo: "",
            voiceFrom: "",
            //voiceRedirectNumber: "316-942-3102",
            voiceAction: JSON.stringify(this.getVoiceAction(), null, 4),
            configId: "",
            ivrConfig: "",
            ivrMenus: [],
            ivrMenuOptions: [],
            menuId: "",
            ivrMenu: "",
            faxTo: "",
            faxFrom: "",
            faxMediaUrl: "",
            faxMediaMimeType: base64ByteData.OnePagePdf.MediaMimeType,
            faxMediaBytes: base64ByteData.OnePagePdf.MediaBytes,
            faxMediaQuality: base64ByteData.OnePagePdf.Quality,
            emailTo: "",
            emailFromDisplayName: "Sendkey Test",
            emailSubject: "Sendkey Test",
            emailBody: "This is a test from Sendkey.<br /><br />",
            msgToErrors: null,
            msgFromErrors: null,
            msgBodyErrors: null,
            msgMediaUrlErrors: null,
            voiceToErrors: null,
            voiceFromErrors: null,
            voiceRedirectNumberErrors: null,
            voiceActionErrors: null,
            ivrConfigErrors: null,
            ivrMenuErrors: null,
            faxToErrors: null,
            faxFromErrors: null,
            faxMediaBytesErrors: null,
            faxMediaUrlErrors: null,
            emailToErrors: null,
            emailFromDisplayNameErrors: null,
            emailSubjectErrors: null,
            emailBodyErrors: null,
            receivedData: true,
            alert: null
        };
        this.actionStatusTimer = false;
        this.validation = new Validation();
        this.testData = [];
        this.testCount = 0;
        this.loadTestTimer = false;
    }

    componentDidMount() {
    }

    getNumberErrors = (value) => {
        var errors = [];
        if (!this.validation.patternValid(value, /^\+?[1-9][0-9]{1,14}$/, "")) errors.push("Must be a valid E.164 number.");
        return errors;
    }

    getBodyErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 100;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        return errors;
    }

    getUrlErrors = (value) => {
        var errors = [];
        // eslint-disable-next-line
        if (!this.validation.patternValid(value, /^((http[s]?|ftp):\/)?\/?([^\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/, "")) errors.push("Must be a valid url.");
        return errors;
    }

    getApiKeyErrors = (value) => {
        var errors = [];
        var minLength = 32, maxLength = 32;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.patternValid(value, /^[A-Za-z0-9-_]*$/, "")) errors.push("Must be an api key.");
        return errors;
    }

    getVoiceActionErrors = (value) => {
        var errors = [];
        return errors;
    }

    getIVRConfigErrors = (value) => {
        var errors = [];
        return errors;
    }

    getIVRMenuErrors = (value) => {
        var errors = [];
        return errors;
    }

    getEmailErrors = (value) => {
        var errors = [];
        var minLength = 1, maxLength = 254;
        if (!this.validation.stringLengthMinValid(value, minLength)) errors.push(this.validation.stringLengthMinInvalidMessage(minLength));
        if (!this.validation.stringLengthMaxValid(value, maxLength)) errors.push(this.validation.stringLengthMaxInvalidMessage(maxLength));
        if (!this.validation.patternValid(value, /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,3}$/, "")) errors.push("Must be an email address.");
        if (!this.validation.patternValid(value, /^\S*$/, "")) errors.push("Must not contain spaces.");
        return errors;
    }

    getFormValid = (...args) => {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    handleChange = (e) => {
        //let username = this.state.username;
        let msgToErrors = this.state.msgToErrors;
        let msgFromErrors = this.state.msgFromErrors;
        let msgBodyErrors = this.state.msgBodyErrors;
        let msgMediaUrlErrors = this.state.msgMediaUrlErrors;
        let voiceToErrors = this.state.voiceToErrors;
        let voiceFromErrors = this.state.voiceFromErrors;
        let voiceActionErrors = this.state.voiceActionErrors;
        let ivrConfigErrors = this.state.ivrConfigErrors;
        let ivrMenuErrors = this.state.ivrMenuErrors;
        let faxToErrors = this.state.faxToErrors;
        let faxFromErrors = this.state.faxFromErrors;
        let faxMediaUrlErrors = this.state.faxMediaUrlErrors;
        let faxMediaBytesErrors = this.state.faxMediaBytesErrors;
        let emailToErrors = this.state.emailToErrors;
        let emailFromDisplayNameErrors = this.state.emailFromDisplayNameErrors;
        let emailSubjectErrors = this.state.emailSubjectErrors;
        let emailBodyErrors = this.state.emailBodyErrors;
        let value = e.target.value;
        //console.log("name = ", e.target.name, "| value = ", value);
        switch (e.target.name) {
            case "msgTo":
                msgToErrors = this.getNumberErrors(value);
                break;
            case "msgFrom":
                msgFromErrors = this.getNumberErrors(value);
                break;
            case "msgBody":
                msgBodyErrors = this.getBodyErrors(value);
                break;
            case "msgMediaUrl":
                msgMediaUrlErrors = this.getUrlErrors(value);
                break;
            case "voiceTo":
                voiceToErrors = this.getNumberErrors(value);
                break;
            case "voiceFrom":
                voiceFromErrors = this.getNumberErrors(value);
                break;
            case "voiceAction":
                voiceActionErrors = this.getVoiceActionErrors(value);
                break;
            case "ivrConfig":
                ivrConfigErrors = this.getIVRConfigErrors(value);
                break;
            case "ivrMenu":
                ivrMenuErrors = this.getIVRMenuErrors(value);
                break;
            case "faxTo":
                faxToErrors = this.getNumberErrors(value);
                break;
            case "faxFrom":
                faxFromErrors = this.getNumberErrors(value);
                break;
            case "faxMediaUrl":
                faxMediaUrlErrors = [];
                if ((value || "") !== "") faxMediaUrlErrors = this.getUrlErrors(value);
                break;
            case "faxMediaBytes":
                //faxMediaBytesErrors = ;
                break;
            case "emailTo":
                emailToErrors = this.getEmailErrors(value);
                break;
            case "emailFromDisplayName":
                //emailFromDisplayNameErrors = ;
                break;
            case "emailSubject":
                //emailSubjectErrors = ;
                break;
            case "emailBody":
                //emailBodyErrors = ;
                break;
            default:
                break;
        }
        this.setState({
            [e.target.name]: value,
            msgToErrors: msgToErrors,
            msgFromErrors: msgFromErrors,
            msgBodyErrors: msgBodyErrors,
            msgMediaUrlErrors: msgMediaUrlErrors,
            voiceToErrors: voiceToErrors,
            voiceFromErrors: voiceFromErrors,
            voiceActionErrors: voiceActionErrors,
            ivrConfigErrors: ivrConfigErrors,
            ivrMenuErrors: ivrMenuErrors,
            faxToErrors: faxToErrors,
            faxFromErrors: faxFromErrors,
            faxMediaUrlErrors: faxMediaUrlErrors,
            faxMediaBytesErrors: faxMediaBytesErrors,
            emailToErrors: emailToErrors,
            emailFromDisplayNameErrors: emailFromDisplayNameErrors,
            emailSubjectErrors: emailSubjectErrors,
            emailBodyErrors: emailBodyErrors
        });
    }

    handleBlur = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    handleAuth = (e) => {
        let subject = "Auth";
        let verb = "Request";
        let payload = {
            AssociationNumber: this.state.username,
            AuthKey: this.state.authKey
        };
        this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
        let apiActions = new ApiActions();
        let apiBaseUrl = Configuration().apiUrl;
        //console.log("apiBaseUrl = ", apiBaseUrl);
        axios.post(apiBaseUrl + 'api/Auth', payload)
            .then((response) => {
                clearTimeout(this.actionStatusTimer);
                //console.log("response = ", response);
                if (response.status === 401) {
                    this.handleError("", response.statusText);
                }
                else if (response.status === 204 || response.status === 200) {
                    console.log(subject + " " + verb + " Successful!");
                    let apiToken = response.data;
                    //console.log("apiToken = ", apiToken);
                    //SetAuthorizationToken(response.headers.token);
                    this.handleSuccess(subject, verb);
                    this.setState({
                        msgFrom: this.state.username,
                        voiceFrom: this.state.username,
                        faxFrom: this.state.username,
                        authenticated: true,
                        apiToken: apiToken
                    });
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
                    //localStorage.removeItem('token');
                    this.setState({
                        authenticated: false,
                        apiToken: ""
                    });
                    this.props.history.push("/Login");
                }
                let errorMessage = apiActions.getErrorMessage(error);
                this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                console.log("error", error);
            });
    }

    handleSendMessage = (e) => {
        e.preventDefault();
        let msgToErrors = this.getNumberErrors(this.state.msgTo);
        let msgFromErrors = this.getNumberErrors(this.state.msgFrom);
        let msgBodyErrors = this.getBodyErrors(this.state.msgBody);
        let msgMediaUrlErrors = this.getUrlErrors(this.state.msgMediaUrl);
        //console.log(msgToErrors, msgFromErrors, msgBodyErrors, msgMediaUrlErrors);
        let formValid = this.getFormValid(msgToErrors, msgFromErrors, msgBodyErrors, msgMediaUrlErrors);
        if (formValid) {
            //let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Message/Send";
            let payload = {
                To: this.state.msgTo,
                From: this.state.msgFrom,
                Body: this.state.msgBody
            };
            if ((this.state.msgMediaUrl || "") !== "") {
                payload.Media = [
                    { MediaUrl: this.state.msgMediaUrl },
                    { MediaMimeType: this.state.msgMediaMimeType, MediaBytes: this.state.msgMediaBytes }
                ];
            }
            let note = "This will send a message with the selected parameters.\n\n";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK.";
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
                msgToErrors: msgToErrors,
                msgFromErrors: msgFromErrors,
                msgBodyErrors: msgBodyErrors,
                msgMediaUrlErrors: msgMediaUrlErrors
            });
        }
    }

    getVoiceAction = () => {
        return {
            Output: {
                Type: "text_to_speech",
                Message: "This is a test from Sendkey.",
                Voice: "alice",
                Language: "en-US"
            }
        };
    }

    handleSendVoice = (e) => {
        e.preventDefault();
        let voiceToErrors = this.getNumberErrors(this.state.voiceTo);
        let voiceFromErrors = this.getNumberErrors(this.state.voiceFrom);
        let voiceActionErrors = this.getVoiceActionErrors(this.state.voiceAction);
        //console.log(voiceToErrors, voiceFromErrors, voiceActionErrors);
        let formValid = this.getFormValid(voiceToErrors, voiceFromErrors, voiceActionErrors);
        if (formValid) {
            let voiceAction = this.state.voiceAction;
            try {
                voiceAction = JSON.parse(voiceAction);
            } catch (e) {
                this.setState({
                    alert: (
                        <SweetAlert
                            cancelBtnBsStyle="default"
                            confirmBtnBsStyle="danger"
                            title="JSON Parse Error"
                            onCancel={this.hideAlert.bind(this)}
                        >
                            Error parsing Voice action json
                        </SweetAlert>
                    )
                });
                return;
            }
            //let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Voice/Send";
            let payload = {
                To: this.state.voiceTo,
                From: this.state.voiceFrom,
                Action: voiceAction
            };
            let note = "This will make a call with the selected parameters.\n\n";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK.";
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
                voiceToErrors: voiceToErrors,
                voiceFromErrors: voiceFromErrors,
                voiceActionErrors: voiceActionErrors
            });
        }
    }

    getIVRConfig = () => {
        this.setState({
            alert: null,
            receivedData: true
        });
        let subject = "IVR config";
        let verb = "fetch";
        //console.log("send", new Date());
        this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
        let options = {
            headers: { Authorization: "Bearer " + this.state.apiToken }
        };
        let apiActions = new ApiActions();
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/IVR/Config', options)
            .then((response) => {
                clearTimeout(this.actionStatusTimer);
                console.log("response = ", response);
                if (response.status === 401) {
                    this.handleError("", response.statusText);
                }
                else if (response.status === 204 || response.status === 200) {
                    //console.log("done", new Date());
                    console.log(subject + " " + verb + " Successful!");
                    //SetAuthorizationToken(response.headers.token);
                    this.setState({
                        configId: response.data.IVRConfigId,
                        ivrConfig: JSON.stringify(response.data, null, 4),
                        alert: null
                    }, this.getIVRConfigMenus);
                    //this.handleSuccess(subject, verb);
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
                    //localStorage.removeItem('token');
                    this.props.history.push("/Dashboard");
                }
                let errorMessage = apiActions.getErrorMessage(error);
                console.log(errorMessage);
                this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                console.log("error", error);
            });
    }

    getIVRConfigMenus = () => {
        this.setState({
            alert: null,
            receivedData: true
        });
        let subject = "IVR config menus";
        let verb = "fetch";
        //console.log("send", new Date());
        this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
        let options = {
            headers: { Authorization: "Bearer " + this.state.apiToken }
        };
        let apiActions = new ApiActions();
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/IVR/Config/' + this.state.configId + '/Menus', options)
            .then((response) => {
                clearTimeout(this.actionStatusTimer);
                console.log("response = ", response);
                if (response.status === 401) {
                    this.handleError("", response.statusText);
                }
                else if (response.status === 204 || response.status === 200) {
                    //console.log("done", new Date());
                    console.log(subject + " " + verb + " Successful!");
                    //SetAuthorizationToken(response.headers.token);
                    let ivrMenuOptions = [];
                    let ivrMenus = response.data;
                    for (let i = 0; i < ivrMenus.length; i++) {
                        let menu = ivrMenus[i];
                        ivrMenuOptions.push({ value: menu.IVRMenuId, label: menu.LanguageCode });
                    }
                    this.setState({
                        ivrMenus: ivrMenus,
                        ivrMenuOptions: ivrMenuOptions,
                        alert: null
                    });
                    //this.handleSuccess(subject, verb);
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
                    //localStorage.removeItem('token');
                    this.props.history.push("/Dashboard");
                }
                let errorMessage = apiActions.getErrorMessage(error);
                console.log(errorMessage);
                this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                console.log("error", error);
            });
    }

    handleUpdateIVRConfig = (e) => {
        e.preventDefault();
        let ivrConfig = this.state.ivrConfig;
        let ivrConfigErrors = this.getIVRConfigErrors(ivrConfig);
        let errors = ivrConfigErrors;
        //console.log(errors);
        let formValid = this.getFormValid(errors);
        if (formValid) {
            let subject = "IVR config";
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "IVR/Config/Update";
            let payload = this.state.ivrConfig;
            try {
                payload = JSON.parse(ivrConfig);
            } catch (e) {
                this.setState({
                    alert: (
                        <SweetAlert
                            cancelBtnBsStyle="default"
                            confirmBtnBsStyle="danger"
                            title="JSON Parse Error"
                            onCancel={this.hideAlert.bind(this)}
                        >
                            Error parsing IVR config json
                        </SweetAlert>
                    )
                });
            }
            let note = "This will update the association " + subject + " with the selected parameters.\n\n";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK.";
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
                ivrConfigErrors: ivrConfigErrors,
                errors: errors
            });
        }
    }

    handleIVRMenuChange = (value) => {
        let menuId = this.state.menuId;
        let match = this.state.ivrMenus.find((item) => item.IVRMenuId === value);
        if (match !== null) {
            menuId = match.IVRMenuId;
        }
        this.setState({
            menuId: menuId
        }, this.getIVRMenu);
    }

    getIVRMenu = () => {
        this.setState({
            alert: null,
            receivedData: true
        });
        let subject = "IVR menu";
        let verb = "fetch";
        //console.log("send", new Date());
        this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
        let options = {
            headers: { Authorization: "Bearer " + this.state.apiToken }
        };
        let apiActions = new ApiActions();
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/IVR/Menu/' + this.state.menuId, options)
            .then((response) => {
                clearTimeout(this.actionStatusTimer);
                console.log("response = ", response);
                if (response.status === 401) {
                    this.handleError("", response.statusText);
                }
                else if (response.status === 204 || response.status === 200) {
                    //console.log("done", new Date());
                    console.log(subject + " " + verb + " Successful!");
                    //SetAuthorizationToken(response.headers.token);
                    this.setState({
                        ivrMenu: JSON.stringify(response.data, null, 4),
                        alert: null
                    });
                    //this.handleSuccess(subject, verb);
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
                    //localStorage.removeItem('token');
                    this.props.history.push("/Dashboard");
                }
                let errorMessage = apiActions.getErrorMessage(error);
                console.log(errorMessage);
                this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                console.log("error", error);
            });
    }

    handleUpdateIVRMenu = (e) => {
        e.preventDefault();
        let ivrMenu = this.state.ivrMenu;
        let ivrMenuErrors = this.getIVRMenuErrors(ivrMenu);
        let errors = ivrMenuErrors;
        //console.log(errors);
        let formValid = this.getFormValid(errors);
        if (formValid) {
            let subject = "IVR menu";
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "IVR/Menu/Update";
            let payload = ivrMenu;
            try {
                payload = JSON.parse(ivrMenu);
            } catch (e) {
                this.setState({
                    alert: (
                        <SweetAlert
                            cancelBtnBsStyle="default"
                            confirmBtnBsStyle="danger"
                            title="JSON Parse Error"
                            onCancel={this.hideAlert.bind(this)}
                        >
                            Error parsing IVR menu json
                        </SweetAlert>
                    )
                });
            }
            let note = "This will update the " + subject + " with the selected parameters.\n\n";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK.";
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
                ivrMenuErrors: ivrMenuErrors,
                errors: errors
            });
        }
    }

    handleSendFax = (e) => {
        e.preventDefault();
        let faxToErrors = this.getNumberErrors(this.state.faxTo);
        let faxFromErrors = this.getNumberErrors(this.state.faxFrom);
        let faxMediaBytesErrors = [];//this.get?Errors(this.state.faxMediaBytes);
        let faxMediaUrlErrors = ((this.state.faxMediaUrl || "") !== "") ? this.getUrlErrors(this.state.faxMediaUrl) : [];
        //console.log(faxToErrors, faxFromErrors, faxMediaUrlErrors);
        let formValid = this.getFormValid(faxToErrors, faxFromErrors, faxMediaUrlErrors);
        if (formValid) {
            //let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Fax/Send";
            let payload = {
                To: this.state.faxTo,
                From: this.state.faxFrom,
                MediaUrl: this.state.faxMediaUrl,
                MediaMimeType: this.state.faxMediaMimeType,
                MediaBytes: this.state.faxMediaBytes,
                Quality: this.state.faxMediaQuality
            };
            let note = "This will send a fax with the selected parameters.\n\n";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK.";
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
                faxToErrors: faxToErrors,
                faxFromErrors: faxFromErrors,
                faxMediaBytesErrors: faxMediaBytesErrors,
                faxMediaUrlErrors: faxMediaUrlErrors
            });
        }
    }

    handleSendEmail = (e) => {
        e.preventDefault();
        console.log(this);
        let emailToErrors = this.getEmailErrors(this.state.emailTo);
        let emailFromDisplayNameErrors = [];
        let emailSubjectErrors = [];
        let emailBodyErrors = [];
        //console.log(emailToErrors, emailFromDisplayNameErrors, emailSubjectErrors, emailBodyErrors);
        let formValid = this.getFormValid(emailToErrors, emailFromDisplayNameErrors, emailSubjectErrors, emailBodyErrors);
        if (formValid) {
            //let subject = this.state.objectName;
            let change = this.state.action;
            let magicWord = Captcha(5);
            let action = "Email/Send";
            let payload = {
                To: this.state.emailTo,
                FromDisplayName: this.state.emailFromDisplayName,
                Subject: this.state.emailSubject,
                Body: this.state.emailBody
            };
            let note = "This will send an email with the selected parameters.\n\n";
            let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK.";
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
                emailToErrors: emailToErrors,
                emailFromDisplayNameErrors: emailFromDisplayNameErrors,
                emailSubjectErrors: emailSubjectErrors,
                emailBodyErrors: emailBodyErrors
            });
        }
    }

    recieveInput = (payload, text, magicWord, action, verb) => {
        //console.log(payload, text, magicWord, action, verb);
        let subject = this.state.objectName;
        if (text === magicWord) {
            let options = {
                headers: { Authorization: "Bearer " + this.state.apiToken }
            };
            //console.log(payload);
            //console.log("send", new Date());
            this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
            let apiActions = new ApiActions();
            let apiBaseUrl = Configuration().apiUrl;
            axios.post(apiBaseUrl + 'api/' + action, payload, options)
                .then((response) => {
                    clearTimeout(this.actionStatusTimer);
                    console.log("response = ", response);
                    if (response.status === 401) {
                        this.handleError("", response.statusText);
                    }
                    else if (response.status === 204 || response.status === 200) {
                        //console.log("done", new Date());
                        console.log(subject + " " + verb + " Successful!");
                        //SetAuthorizationToken(response.headers.token);
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
                        //localStorage.removeItem('token');
                        this.props.history.push("/Login");
                    }
                    let errorMessage = apiActions.getErrorMessage(error);
                    console.log(errorMessage);
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
                        <i className="fa fa-spinner fa-pulse fa-5x fa-fw" />
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
                <SweetAlert success title={subject + " " + verb + " Successful!"} onConfirm={this.hideAlert} />
            )
        });
    }

    handleError = (title, message) => {
        console.log(title, message);
        this.setState({
            alert: (
                <SweetAlert danger title={title} onConfirm={this.hideAlert}>
                    {message}
                </SweetAlert>
            )
        });
    }

    hideAlert = () => {
        this.setState({ alert: null });
    }

    render() {
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Testing (Experimental)</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li><Link to={{ pathname: '/Layout/MigrateCredentials' }}><i className="ft-chevrons-right"></i></Link></li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-body">
                            {this.state.receivedData ?
                                <div className="card-block">
                                    <section>
                                        <fieldset>
                                            <p>Authentication</p>
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                    <ValidationInput label="AssociationNumber:" isRequired={true}
                                                        name="username" value={this.state.username}
                                                        validation={this.validation} errors={this.state.usernameErrors}
                                                        handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                </div>
                                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                    <ValidationInput label="AuthKey:" isRequired={true} isPassword={true}
                                                        name="authKey" value={this.state.authKey}
                                                        validation={this.validation} errors={this.state.passwordErrors}
                                                        handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                    <button className="btn btn-primary" onClick={this.handleAuth}>Authenticate</button>
                                                </div>
                                            </div>
                                            {this.state.authenticated ?
                                                <div>
                                                    <hr />
                                                    <p>Message</p>
                                                    <div className="row">
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="To:" isRequired={true}
                                                                name="msgTo" value={this.state.msgTo}
                                                                validation={this.validation} errors={this.state.msgToErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="From:" isRequired={false} readOnly={true}
                                                                name="msgFrom" value={this.state.username}
                                                                validation={this.validation} errors={this.state.msgFromErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <ValidationInput label="Body:" isRequired={true} readOnly={true}
                                                                name="msgBody" value={this.state.msgBody}
                                                                validation={this.validation} errors={this.state.msgBodyErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <ValidationInput label="Media Url:" isRequired={false} readOnly={true}
                                                                name="msgMediaUrl" value={this.state.msgMediaUrl}
                                                                validation={this.validation} errors={this.state.msgMediaUrlErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <span>Media Bytes:</span><br />
                                                            <textarea style={{ width: "auto", minWidth: "100%" }} readOnly={true}
                                                                name="msgMediaBytes" value={this.state.msgMediaBytes}
                                                                onChange={this.handleChange} onBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                            <button className="btn btn-primary" onClick={this.handleSendMessage}>Send</button>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <p>Voice</p>
                                                    <div className="row">
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="To:" isRequired={true}
                                                                name="voiceTo" value={this.state.voiceTo}
                                                                validation={this.validation} errors={this.state.voiceToErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="From:" isRequired={false} readOnly={true}
                                                                name="voiceFrom" value={this.state.username}
                                                                validation={this.validation} errors={this.state.voiceFromErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <span>{"Action:"}</span><br />
                                                            <textarea style={{ width: "auto", minWidth: "100%", minHeight: "25%" }} readOnly={false}
                                                                name="voiceAction" value={this.state.voiceAction}
                                                                onChange={this.handleChange} onBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                            <button className="btn btn-primary" onClick={this.handleSendVoice}>Send</button>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <p>IVR</p>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <span>{"IVR Config: " + this.state.configId}</span><br />
                                                            <textarea style={{ width: "auto", minWidth: "100%", minHeight: "10%" }} readOnly={false}
                                                                name="ivrConfig" value={this.state.ivrConfig}
                                                                onChange={this.handleChange} onBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <button className="btn btn-primary" onClick={this.getIVRConfig}>Get</button>
                                                            <button className="btn btn-primary ml-1" onClick={this.handleUpdateIVRConfig}>Update</button>
                                                            {/*<Link to="/Layout/IVRGenerator" className="btn btn-primary ml-1">Configurator</Link>*/}
                                                        </div>
                                                    </div>
                                                    <br />
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <ValidationSelect isRequired={false} receivedData={this.state.receivedData}
                                                                label={"IVR Menu: " + this.state.menuId}
                                                                id="ivrMenuSelect" name="ivrMenuSelect"
                                                                placeholder="Select menu"
                                                                valueKey="value" labelKey="label"
                                                                value={this.state.menuId}
                                                                data={this.state.ivrMenuOptions}
                                                                validation={this.validation} errors={null}
                                                                handleChange={this.handleIVRMenuChange}
                                                                handleBlur={this.handleIVRMenuChange} />
                                                            <textarea style={{ width: "auto", minWidth: "100%", minHeight: "10%" }} readOnly={false}
                                                                name="ivrMenu" value={this.state.ivrMenu}
                                                                onChange={this.handleChange} onBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            {/*<button className="btn btn-primary" onClick={this.getIVRMenu}>Get</button>*/}
                                                            <button className="btn btn-primary" onClick={this.handleUpdateIVRMenu}>Update</button>
                                                            {/*<Link to="/Layout/IVRGenerator" className="btn btn-primary ml-1">Configurator</Link>*/}
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <p>Fax</p>
                                                    <div className="row">
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="To:" isRequired={true}
                                                                name="faxTo" value={this.state.faxTo}
                                                                validation={this.validation} errors={this.state.faxToErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="From:" isRequired={false} readOnly={true}
                                                                name="faxFrom" value={this.state.username}
                                                                validation={this.validation} errors={this.state.faxFromErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <ValidationInput label="Media Url:" isRequired={false} readOnly={false}
                                                                name="faxMediaUrl" value={this.state.faxMediaUrl}
                                                                validation={this.validation} errors={this.state.faxMediaUrlErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <span>Media Bytes:</span><br />
                                                            <textarea style={{ width: "auto", minWidth: "100%" }} readOnly={true}
                                                                name="faxMediaBytes" value={this.state.faxMediaBytes}
                                                                onChange={this.handleChange} onBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                            <button className="btn btn-primary" onClick={this.handleSendFax}>Send</button>
                                                        </div>
                                                    </div>
                                                    <hr />
                                                    <p>Email</p>
                                                    <div className="row">
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="To:" isRequired={true}
                                                                name="emailTo" value={this.state.emailTo}
                                                                validation={this.validation} errors={this.state.emailToErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                                            <ValidationInput label="From Display Name:" isRequired={false} readOnly={true}
                                                                name="emailFromDisplayName" value={this.state.emailFromDisplayName}
                                                                validation={this.validation} errors={this.state.emailFromDisplayNameErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <ValidationInput label="Subject:" isRequired={true} readOnly={true}
                                                                name="emailSubject" value={this.state.emailSubject}
                                                                validation={this.validation} errors={this.state.emailSubjectErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                            <ValidationInput label="Body:" isRequired={true} readOnly={true}
                                                                name="emailBody" value={this.state.emailBody}
                                                                validation={this.validation} errors={this.state.emailBodyErrors}
                                                                handleChange={this.handleChange} handleBlur={this.handleBlur} />
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-sm-2 col-md-2 col-lg-2 col-xl-2">
                                                            <button className="btn btn-primary" onClick={this.handleSendEmail}>Send</button>
                                                        </div>
                                                    </div>
                                                </div>
                                                :
                                                ""
                                            }
                                        </fieldset>
                                    </section>
                                </div>
                                :
                                <div className="card-block offset-lg-5 offset-md-5">
                                    <i className="fa fa-spinner fa-pulse fa-5x fa-fw" />
                                    <span className="sr-only">Loading...</span>
                                </div>
                            }
                        </div>
                    </div>
                </section>
                {this.state.alert}
            </ContentPane>
        );
    }
}
