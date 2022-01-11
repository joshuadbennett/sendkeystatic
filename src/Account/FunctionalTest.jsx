import React from 'react';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
//import ApiActions from '../Components/ApiActions';
import SweetAlert from 'react-bootstrap-sweetalert';
import LocalStorage from '../Utils/LocalStorage';
import Validation from '../Components/Validation.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import Formatting from '../Components/Formatting.jsx';
import AssociationStatus from './AssociationStatus';

const RUNNING = "Running";
const NA = "N/A";
const FAILURE = "Error";

const defaultAccountId = "00000000-0000-0000-0000-000000000000";

export default class FunctionalTest extends React.Component {
    constructor(props) {
        super(props);
        this.local = new LocalStorage(props);
        let accountId = defaultAccountId;
        let data = null;
        let testTypes = null;
        let tests = null;
        if (props != null && props.location != null) {
            let location = props.location;
            accountId = (this.local.get("accountId") || accountId);
            if (location.state != null) {
                let state = location.state;
                //console.log("state = ", state);
                if (state.accountId != null) accountId = state.accountId;
                if (state.data != null) data = state.data;
                if (state.testTypes != null) data = state.testTypes;
                if (state.tests != null) data = state.tests;
            }
        }
        this.state = {
            accountId: accountId,
            accounts: [],
            accountErrors: null,
            objectId: null,
            objectName: "Functional test",
            data: data || [],
            testTypes: testTypes || [],
            tests: tests || [],
            results: [],
            currentTestIndex: 0,
            receivedData: false,
            alert: null
        }
        this.actionStatusTimer = false;
        this.validation = new Validation();
        this.formatting = new Formatting();
        this.status = new AssociationStatus();
    }

    componentDidMount() {
        this.getAccounts();
        if (!this.hasAccount()) return;
        this.refreshData();
    }

    componentWillUnmount() {
        this.validation = null;
        this.formatting = null;
        this.status = null;
        this.local.set("accountId", null);
    }

    refreshData = () => {
        let data = this.state.data;
        if (data == null || data.length < 1) {
            this.getAssociations();
        } else if (data.length === 1) {
            this.setupTest();
        } else {
            this.setupBulkTest();
        }
    }

    refreshGrid = () => {
        this.refreshData();
    }

    hasData = () => {
        let data = this.state.data;
        return (data != null && data.length > 0);
    }

    hasAccount = () => {
        return (this.state.accountId != null && this.state.accountId !== defaultAccountId);
    }

    hasAccountErrors = () => {
        return (this.state.accountErrors != null && this.state.accountErrors.length > 0);
    }

    getAccountErrors = (value) => {
        let errors = [];
        if (value == null || !this.state.accounts.some((item) => value === item.AccountId)) errors.push("Must be a valid account.");
        return errors;
    }

    getFormValid = (...args) => {
        let valid = true;
        args.forEach(errors => valid = valid && this.validation.getClass(errors) === " valid");
        return valid;
    }

    getAccounts = () => {
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Accounts';
        axios.get(apiBaseUrl + apiRouteUrl)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("accounts data = ", data);
                this.accountOptions = [];
                for (let i = 0; i < data.length; i++) {
                    let account = data[i];
                    this.accountOptions.push({ value: account.AccountId, label: account.DisplayName });
                }
                this.setState({
                    accounts: data,
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
    }

    handleAccountChange = (value) => {
        let accountId = "";
        let accountErrors = this.state.accountErrors;
        let match = this.state.accounts.find((item) => item.AccountId === value);
        if (match != null) {
            accountId = match.AccountId;
            accountErrors = this.getAccountErrors(accountId);
        }
        this.setState({
            accountId: accountId,
            accountErrors: accountErrors
        });
        this.local.set("accountId", accountId);
    }

    getAssociations = () => {
        this.setState({
            alert: null,
            receivedData: false
        });
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Accounts/' + this.state.accountId + '/Associations';
        axios.get(apiBaseUrl + apiRouteUrl)
            .then((response) => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("associations data = ", data);
                this.setState({
                    data: data,
                    currentTestIndex: 0,
                    receivedData: true
                }, this.setupBulkTest);
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error);
            });
    }

    validate = (e) => {
        e.preventDefault();
        let accountId = this.state.accountId;
        let accountErrors = this.getAccountErrors(accountId);
        let formValid = this.getFormValid(accountErrors);
        if (formValid) {
            this.refreshData();
        } else {
            this.setState({
                accountId: accountId,
                accountErrors: accountErrors
            });
        }
    }

    newTestRun = (item) => {
        if (item == null) return null;
        let webhookStatus = (item.WebhookUrl != null && item.WebhookUrl.trim() !== "") ? RUNNING : NA;
        let run = {
            Number: item.AssociationNumber,
            WebhookStatus: webhookStatus,
            WebhookAuthStatus: (webhookStatus !== NA && item.WebhookAuthType != null && item.WebhookAuthType.trim() !== "") ? RUNNING : NA,
            SMSStatus: item.AllowSMS ? RUNNING : NA,
            MMSStatus: item.AllowMMS ? RUNNING : NA,
            VoiceStatus: item.AllowVoice ? RUNNING : NA,
            FaxStatus: item.AllowFax ? RUNNING : NA,
            EmailStatus: item.AllowEmail ? RUNNING : NA,
            Errors: "",
            Result: ""
        };
        return run;
    }

    newTestError = (item) => {
        if (item == null) return null;
        let webhookStatus = (item.WebhookUrl != null && item.WebhookUrl.trim() !== "") ? RUNNING : NA;
        let error = {
            Number: item.AssociationNumber,
            WebhookStatus: webhookStatus,
            WebhookAuthStatus: (webhookStatus !== NA && item.WebhookAuthType != null && item.WebhookAuthType.trim() !== "") ? FAILURE : NA,
            SMSStatus: item.AllowSMS ? FAILURE : NA,
            MMSStatus: item.AllowMMS ? FAILURE : NA,
            VoiceStatus: item.AllowVoice ? FAILURE : NA,
            FaxStatus: item.AllowFax ? FAILURE : NA,
            EmailStatus: item.AllowEmail ? FAILURE : NA,
            Errors: "",
            Result: ""
        };
        return error;
    }

    setupTest = () => {
        this.setState({
            results: [],
            currentTestIndex: 0
        }, this.runTest);
    }

    runTest = () => {
        //console.log("send", new Date());
        //this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
        //let apiActions = new ApiActions();
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Associations/Test/' + this.state.data[0].AssociationId;
        //let subject = "Test";
        //let verb = "Run";
        axios.get(apiBaseUrl + apiRouteUrl)
            .then((response) => {
                //console.log("response = ", response);
                clearTimeout(this.actionStatusTimer);
                SetAuthorizationToken(response.headers.token);
                if (response.status === 401) {
                    this.handleError("Unauthorized", "Please try again later");
                }
                else if (response.status === 204 || response.status === 200) {
                    let data = JSON.parse(response.data);
                    //console.log("results data = ", data);
                    this.setState({
                        results: data
                    });
                }
                else {
                    this.handleError("Test results unknown", "Please try again later");
                }
            })
            .catch((error) => {
                clearTimeout(this.actionStatusTimer);
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                //let errorMessage = apiActions.getErrorMessage(error);
                //this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                console.log("error", error);
            });
    }

    setupBulkTest = () => {
        this.setState({
            results: [],
            currentTestIndex: 0
        }, this.runBulkTest);
    }

    runBulkTest = () => {
        //console.log("send", new Date());
        //this.actionStatusTimer = setTimeout(() => this.handleProcessing(), 1000);
        //let apiActions = new ApiActions();
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Associations/BulkTest/' + this.state.accountId;
        //let subject = "Bulk test";
        //let verb = "Run";
        axios.get(apiBaseUrl + apiRouteUrl)
            .then((response) => {
                //console.log("response = ", response);
                clearTimeout(this.actionStatusTimer);
                SetAuthorizationToken(response.headers.token);
                if (response.status === 401) {
                    this.handleError("Unauthorized", "Please try again later");
                }
                else if (response.status === 204 || response.status === 200) {
                    let data = JSON.parse(response.data);
                    //console.log("results data = ", data);
                    this.setState({
                        results: data
                    });
                }
                else {
                    this.handleError("Test results unknown", "Please try again later");
                }
            })
            .catch((error) => {
                clearTimeout(this.actionStatusTimer);
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                //let errorMessage = apiActions.getErrorMessage(error);
                //this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", errorMessage);
                console.log("error", error);
            });
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
        let that = this;
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Functional Test</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li><a onClick={this.refreshGrid}><i className="ft-rotate-cw"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-body">
                            {this.state.receivedData ?
                                <div className="card-block">
                                    <section>
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                <div><span className="danger">*</span> denotes required field<br /><br /></div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationSelect isRequired={true} receivedData={this.state.receivedData}
                                                    label="Account"
                                                    id="accountFilter" name="accountFilter"
                                                    placeholder="Select account"
                                                    valueKey="value" labelKey="label"
                                                    value={this.state.accountId}
                                                    data={this.accountOptions}
                                                    validation={this.validation} errors={this.state.accountErrors}
                                                    handleChange={this.handleAccountChange} handleBlur={this.handleBlur} />
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <fieldset className="form-group">
                                                    <button className="btn btn-icon btn-primary pull-left"
                                                        style={{ marginTop: '1.75em' }}
                                                        onClick={this.validate}>
                                                        Run
                                                    </button>
                                                </fieldset>
                                            </div>
                                        </div>
                                        {(this.hasData() && !this.hasAccountErrors()) ?
                                            <div style={{ overflow: 'auto' }}>
                                                <table className="table table-striped table-bordered zero-configuration">
                                                    <thead>
                                                        <tr>
                                                            <th>Number</th>
                                                            <th>Webhook</th>
                                                            <th>WebhookAuth</th>
                                                            <th>Errors</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.results.map(function (data, index) {
                                                            return (
                                                                <tr key={"data" + index}>
                                                                    <td>{data.Number}</td>
                                                                    <td><span>{that.status.getIcon(data.WebhookStatus)}</span></td>
                                                                    <td><span>{that.status.getIcon(data.WebhookAuthStatus)}</span></td>
                                                                    <td>{data.Errors}</td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            :
                                            ""
                                        }
                                    </section>
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
