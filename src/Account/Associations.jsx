import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Validation from '../Components/Validation.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import LocalStorage from '../Utils/LocalStorage';
import loadScript from '../Utils/load-script';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';
import AssociationStatus from './AssociationStatus';

const defaultAccountId = "00000000-0000-0000-0000-000000000000";

export default class Associations extends React.Component {
    constructor(props) {
        super(props);
        this.local = new LocalStorage(props);
        let accountId = defaultAccountId;
        if (props != null && props.location != null) {
            let location = props.location;
            accountId = (this.local.get("accountId") || accountId);
            if (location.state != null) {
                let state = location.state;
                //console.log("state = ", state);
                if (state.accountId != null) accountId = state.accountId;
            }
        }
        this.state = {
            accountId: accountId,
            objectId: null,
            objectName: "Association",
            data: [],
            action: "<None>",
            magicWord: Captcha(5),
            receivedData: false,
            alert: null
        }
        this.validation = new Validation();
        this.formatting = new Formatting();
        this.status = new AssociationStatus();
    }

    componentDidMount() {
        this.getAccounts();
        //if (!this.hasAccount()) return;
        this.refreshData();
    }

    componentWillUnmount() {
        this.validation = null;
        this.formatting = null;
        this.status = null;
        this.local.set("accountId", null);
        localStorage.removeItem("DataTables_columnFilteredTable_/");
    }

    refreshData = () => {
        this.setState({
            alert: null,
            receivedData: false
        });
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Associations/Table';
        let apiQuery = '';
        if (this.state.accountId != null) {
            let query = [];
            let accountId = this.state.accountId;
            if (accountId !== defaultAccountId) {
                query.push('accountId=' + accountId);
                //console.log("query = ", query);
            }
            apiQuery = (query.length > 0) ? '?' + query.join("&") : apiQuery;
            //console.log("apiQuery = ", apiQuery);
        }
        axios.get(apiBaseUrl + apiRouteUrl + apiQuery)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("associations data = ", data);
                this.setState({
                    data: data,
                    receivedData: true
                });
                loadScript('/app-assets/js/scripts/tables/datatables/datatable-basic.js', () => { });
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error);
            });
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

    validate = (e) => {
        e.preventDefault();
        let accountId = this.state.accountId;
        let accountErrors = [];//this.getAccountErrors(accountId);
        //console.log(accountErrors);
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
                            <h2 className="card-title">Associations</h2>
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
                                        {/*
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                <div><span className="danger">*</span> denotes required field<br /><br /></div>
                                            </div>
                                        </div>
                                        */}
                                        <div className="row">
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <ValidationSelect isRequired={false} receivedData={this.state.receivedData}
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
                                                        Filter
                                                    </button>
                                                </fieldset>
                                            </div>
                                        </div>
                                        {(this.hasData() && !this.hasAccountErrors()) ?
                                            <div style={{ overflow: 'auto' }}>
                                                <table className="table table-striped table-bordered associations" id="columnFilteredTable">
                                                    <thead>
                                                        <tr>
                                                            <th>Account</th>
                                                            <th>Number</th>
                                                            <th>Billing Id</th>
                                                            <th>Description</th>
                                                            <th>Webhook</th>
                                                            <th>Error?</th>
                                                            <th>Msg</th>
                                                            <th>Voice</th>
                                                            <th>Fax</th>
                                                            <th>Email</th>
                                                            <th>Video</th>
                                                            <th>Active</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.data.map(function (data, index) {
                                                            return (
                                                                <tr key={"data" + index}>
                                                                    <td>{data.AccountDisplayName}</td>
                                                                    <td>{data.AssociationNumber}</td>
                                                                    <td>{data.AssociationBillingId}</td>
                                                                    <td>{data.Description}</td>
                                                                    <td>
                                                                        <span>Url: {data.WebhookUrl}</span><br />
                                                                        <span>AuthType: {data.WebhookAuthType}</span><br />
                                                                        <span>Status: {that.status.getIcon(data.WebhookStatus)}</span><br />
                                                                        <span>AuthStatus: {that.status.getIcon(data.WebhookAuthStatus)}</span><br />
                                                                    </td>
                                                                    <td>{that.status.isError(data) ? "Y" : "N"}</td>
                                                                    <td>
                                                                        <i id={"assoc_sms_" + index}
                                                                            className={data.AllowSMS ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                            aria-hidden="true"></i>
                                                                    </td>
                                                                    <td>
                                                                        <i id={"assoc_voice_" + index}
                                                                            className={data.AllowVoice ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                            aria-hidden="true"></i>
                                                                    </td>
                                                                    <td>
                                                                        <i id={"assoc_fax_" + index}
                                                                            className={data.AllowFax ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                            aria-hidden="true"></i>
                                                                    </td>
                                                                    <td>
                                                                        <i id={"assoc_email_" + index}
                                                                            className={data.AllowEmail ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                            aria-hidden="true"></i>
                                                                    </td>
                                                                    <td>
                                                                        <i id={"assoc_video_" + index}
                                                                            className={data.AllowVideo ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                            aria-hidden="true"></i>
                                                                    </td>
                                                                    <td>
                                                                        <span>
                                                                            {data.IsActive ?
                                                                                <div className="text-xs-left text-success">
                                                                                    <i className="fa fa-cloud-upload font-medium-5"><span className="hidden">1</span></i>
                                                                                </div>
                                                                                :
                                                                                <div className="text-xs-left text-danger">
                                                                                    <i className="fa fa-cloud-download font-medium-5"><span className="hidden">0</span></i>
                                                                                </div>
                                                                            }
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <div className="btn-group">
                                                                            <button type="button" className="btn btn-icon btn-info btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-bars font-small-1" /></button>
                                                                            <div className="dropdown-menu">
                                                                                <Link to={{ pathname: '/Layout/AssociationDetails', state: { data: data } }} className="dropdown-item">Details</Link>
                                                                                <Link to={{ pathname: '/Layout/FunctionalTest', state: { accountId: data.AccountId, data: [data] } }} className="dropdown-item">Run Functional Test</Link>
                                                                            </div>
                                                                        </div>
                                                                    </td>
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
