import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import SweetAlert from 'react-bootstrap-sweetalert';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Validation from '../Components/Validation.jsx';
import ValidationInput from '../Components/ValidationInput.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import loadScript from '../Utils/load-script';
import uuidv4 from 'uuid/v4';
import Formatting from '../Components/Formatting.jsx';
import ApiActions from '../Components/ApiActions.jsx'

export default class PerformApiAction extends React.Component {
    constructor(props) {
        super(props);
        //console.log(props);
        this.state = {
            editMode: this.props.editMode || false,
            subject: this.props.subject || "",
            verb: this.props.verb || "",
            route: this.props.route || "",
            action: this.props.action || "",
            method: this.props.method || "POST",
            callback: this.props.callback || null,
            payload: this.props.payload,
            magicWord: this.props.magicWord || this.props.action.toUpperCase(),
            complete: false,
            alert: null
        };
        //console.log(this.state);
        this.actionStatusTimer = false;
        this.receiveInput = this.receiveInput.bind(this);
        this.performPost = this.performPost.bind(this);
        this.performGet = this.performGet.bind(this);
        this.handleProcessing = this.handleProcessing.bind(this);
        this.getResponseMessage = this.getResponseMessage.bind(this);
        this.getErrorMessage = this.getErrorMessage.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
        this.handleError = this.handleError.bind(this);
        this.hideAlert = this.hideAlert.bind(this);
    }

    componentDidMount() {
        //console.log("mounted");
        /*
        let editMode = this.state.editMode;
        let subject = this.state.subject;
        let verb = this.state.verb;
        let action = this.state.action;
        let payload = this.state.payload;
        let magicWord = this.state.magicWord;
        let callback = this.state.callback;
        let note = editMode ? "This will update the selected " + subject.toLocaleLowerCase() + ".\n\n" : "";
        let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK."
        this.setState({
            callback: callback || this.hideAlert,
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
        */

    }

    componentWillUnmount() {

    }

    receiveInput(payload, text, magicWord, action, verb) {
        //console.log(payload, text, magicWord, action);
        let subject = this.state.subject;
        //let action = this.state.action;
        //let magicWord = this.state.magicWord.substring(0, 6); //this.state.magicWord;
        if (text === magicWord) {
            let route = this.state.route;
            let apiBaseUrl = Configuration().apiUrl;
            let method = this.state.method;
            let callback = this.state.callback;
            //console.log("method = ", method.toUpperCase());
            let apiActions = new ApiActions();
            switch (method.toUpperCase()) {
                case "GET":
                    apiActions.performGet(apiBaseUrl, route, action, payload, subject, verb, callback);
                    break;
                case "POST":
                    apiActions.performPost(apiBaseUrl, route, action, payload, subject, verb, callback);
                    break;
                default:
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

    handleProcessing() {
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

    handleSuccess(subject, verb) {
        this.setState({
            complete: true,
            alert: (
                <SweetAlert success title={subject + " " + verb + " Successful!"} onConfirm={this.hideAlert}>
                </SweetAlert>
            )
        });
    }

    handleError(title, message) {
        this.setState({
            alert: (
                <SweetAlert danger title={title} onConfirm={this.hideAlert.bind(this)}>
                    {message}
                </SweetAlert>
            )
        });
    }

    hideAlert(e) {
        this.setState({ alert: null });
    }

    render() {
        return this.state.alert;
    }
}
