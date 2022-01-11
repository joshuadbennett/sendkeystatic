import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions';
import SweetAlert from 'react-bootstrap-sweetalert';
import Validation from '../Components/Validation.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import DatePickerInput from '../Components/DatePickerInput.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import LocalStorage from '../Utils/LocalStorage';
import loadScript from '../Utils/load-script';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';

const DATE_FORMAT = "YYYY-MM-DD";
const defaultAccountId = "00000000-0000-0000-0000-000000000000";

export default class Transactions extends React.Component {
    constructor(props) {
        super(props);
        this.local = new LocalStorage(props);
        let accountId = defaultAccountId;
        let startDate = null;
        let endDate = null;
        if (props != null && props.location != null) {
            let location = props.location;
            accountId = (this.local.get("accountId") || accountId);
            startDate = (this.local.get("startDate") || startDate);
            endDate = (this.local.get("endDate") || endDate);
            if (location.state != null) {
                let state = location.state;
                //console.log("state = ", state);
                if (state.accountId != null) accountId = state.accountId;
                if (state.startDate != null) startDate = state.startDate;
                if (state.endDate != null) endDate = state.endDate;
            }
        }
        let filters = {
            TransactionDateStart: this.dateValid(startDate) ? moment(startDate) : moment().subtract(6, 'months').startOf('day'),
            TransactionDateEnd: this.dateValid(endDate) ? moment(endDate) : moment().endOf('day')
        };
        //console.log("filters =", filters);
        this.state = {
            accountId: accountId,
            accounts: [],
            accountErrors: null,
            associations: [],
            transactions: [],
            updates: [],
            objectId: null,
            objectName: "Transaction",
            data: [],
            filters: filters,
            selectAll: [],
            action: "<None>",
            magicWord: Captcha(5),
            receivedData: false,
            complete: false,
            alert: null
        }
        this.local.set("accountId", accountId);
        this.actionStatusTimer = false;
        this.validation = new Validation();
        this.formatting = new Formatting();
    }

    componentDidMount() {
        this.getAccounts();
        if (!this.hasAccount()) return;
        this.refreshData();
    }

    componentWillUnmount() {
        this.validation = null;
        this.formatting = null;
        this.local.set("accountId", null);
        this.local.set("startDate", null);
        this.local.set("endDate", null);
        localStorage.removeItem("DataTables_columnFilteredTable_/");
    }

    refreshData = () => {
        this.setState({
            alert: null,
            receivedData: false
        });
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Accounts';
        let apiQuery = '';
        if (this.state.accountId != null) {
            apiRouteUrl += '/' + this.state.accountId + '/Transactions';
            let query = [];
            let startDate = this.state.filters.TransactionDateStart;
            //console.log("startDate = ", startDate);
            if (this.dateValid(startDate)) {
                //let startDateUTC = moment.utc(moment.parseZone(startDate.format(FULL_DATE_FORMAT)));
                //console.log("startDateUTC = ", startDateUTC);
                //query.push('startDate=' + startDateUTC.format(DATE_FORMAT));
                query.push('startDate=' + startDate.format(DATE_FORMAT));
                //console.log("query = ", query);
            }
            let endDate = this.state.filters.TransactionDateEnd;
            //console.log("endDate = ", endDate);
            if (this.dateValid(endDate)) {
                //let endDateUTC = moment.utc(moment.parseZone(endDate.format(FULL_DATE_FORMAT)));
                //console.log("endDateUTC = ", endDateUTC);
                //query.push('endDate=' + endDateUTC.format(DATE_FORMAT));
                query.push('endDate=' + endDate.format(DATE_FORMAT));
                //console.log("query = ", query);
            }
            apiQuery = (query.length > 0) ? '?' + query.join("&") : apiQuery;
            //console.log("apiQuery = ", apiQuery);
        }
        axios.get(apiBaseUrl + apiRouteUrl + apiQuery)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("transactions data = ", data);
                let associations = [];
                let transactions = [];
                let updates = [];
                if (data != null) {
                    associations = (data.Associations || []);
                    transactions = (data.TransactionInfoList || []);
                    transactions = transactions.map((item) => {
                        item.RetryEnabled = this.canRetry(item, associations);
                        item.Retry = false;
                        return item;
                    });
                    updates = transactions.filter((item) => item["RetryEnabled"]);
                }
                let selectAll = this.getSelectAll(transactions);
                this.setState({
                    associations: associations,
                    updates: updates,
                    data: transactions,
                    selectAll: selectAll,
                    receivedData: true,
                    complete: false
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

    dateValid = (d) => {
        return d != null && d !== "Invalid date" && moment(d).isValid();
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

    handleTransactionDateStartChange = (m) => {
        let filters = this.state.filters;
        filters.TransactionDateStart = m;
        if ((filters.TransactionDateEnd || "") === "" || filters.TransactionDateEnd < filters.TransactionDateStart) {
            filters.TransactionDateEnd = m;
        }
        this.setState({ filters: filters });
        this.local.set("startDate", filters.TransactionDateStart);
    }

    handleTransactionDateEndChange = (m) => {
        let filters = this.state.filters;
        filters.TransactionDateEnd = m;
        if ((filters.TransactionDateStart || "") === "" || filters.TransactionDateStart > filters.TransactionDateEnd) {
            filters.TransactionDateStart = m;
        }
        this.setState({ filters: filters });
        this.local.set("endDate", filters.TransactionDateEnd);
    }

    handleSelect = (e) => {
        let type = e.target.getAttribute("data-type");
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        let list = this.state.updates;
        let item = list.find((item) => item.TransactionId === row.TransactionId);
        item[type] = checked;
        let obj = document.getElementById(e.target.id);
        if (obj != null) {
            obj.className = checked ? "fa fa-check-square-o" : "fa fa-square-o";
        }
        let allSelected = this.areAllSelected(list, type);
        let objAll = document.getElementById(type + "All");
        if (objAll != null) {
            objAll.className = allSelected ? "fa fa-check-square-o" : "fa fa-square-o";
        }
    }

    handleSelectAll = (e) => {
        let type = e.target.getAttribute("data-type");
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        let list = this.state.updates;
        for (let i = 0; i < list.length; i++) {
            if (type === "Retry") {
                if (!list[i]["RetryEnabled"]) {
                    continue;
                }
            }
            list[i][type] = checked;
        }
        // verify
        let allSelected = this.areAllSelected(list, type);
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

    getSelectAll = (data) => {
        let selectAll = [];
        selectAll["RetryAll"] = this.areAllSelected(data, "Retry");
        return selectAll;
    }

    areAllSelected = (data, type) => {
        let list = data;
        if (list == null || list.length < 1) return false;
        return !list.some((item) => !item[type]);
    }

    canRetry = (row, associations) => {
        if (row == null) return false;
        if (row.CompleteDate != null) return false;
        if (!row.IsRetryStatus) return false;
        if (row.HoursOld > 24) return false;
        let list = associations;
        let match = list.find((item) => item.AssociationId === row.AssociationId);
        if (match == null) return false;
        if (match.WebhookStatus !== "Active" || match.WebhookAuthStatus !== "Active") return false;
        return true;
    }

    handleRetry = () => {
        let list = this.state.updates;
        let retryList = list.filter((item) => {
            return (item != null && item.Retry != null && item.Retry && item.TransactionId != null);
        });
        if (retryList == null || retryList.length < 1) {
            this.setState({
                alert: (
                    <SweetAlert warning
                        title="Retry"
                        onConfirm={this.hideAlert.bind(this)}
                    >
                        No items selected
                    </SweetAlert>
                )
            });
            return;
        }
        let change = "Retry";
        let action = "Transactions/BulkUpdate";
        let subject = this.state.objectName;
        let magicWord = Captcha(5);
        let payload = retryList.map((item) => item.TransactionId);
        let note = "This will " + change.toLocaleLowerCase() + " the selected " + subject.toLocaleLowerCase() + "(s).\n\n";
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
    }

    validate = (e) => {
        e.preventDefault();
        let accountId = this.state.accountId;
        let accountErrors = this.getAccountErrors(accountId);
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
                    else if (response.status === 200 || response.status === 204) {
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

    hideAlert = () => {
        this.setState({ alert: null });
        if (this.state.complete) {
            this.refreshGrid();
        }
    }

    render() {
        let that = this;
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Transactions</h2>
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
                                                <div className="form-group">
                                                    <label htmlFor="startDateFilter">
                                                        Start Date
                                                        &nbsp;
                                                    </label>
                                                    <DatePicker name="startDateFilter"
                                                        dateFormat={DATE_FORMAT}
                                                        placeholderText="Select start date"
                                                        customInput={<DatePickerInput />}
                                                        selected={this.state.filters.TransactionDateStart}
                                                        selectsStart
                                                        startDate={this.state.filters.TransactionDateStart}
                                                        endDate={this.state.filters.TransactionDateEnd}
                                                        onChange={this.handleTransactionDateStartChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <div className="form-group">
                                                    <label htmlFor="endDateFilter">
                                                        End Date
                                                        &nbsp;
                                                    </label>
                                                    <DatePicker name="endDateFilter"
                                                        dateFormat={DATE_FORMAT}
                                                        placeholderText="Select end date"
                                                        customInput={<DatePickerInput />}
                                                        selected={this.state.filters.TransactionDateEnd}
                                                        selectsEnd
                                                        startDate={this.state.filters.TransactionDateStart}
                                                        endDate={this.state.filters.TransactionDateEnd}
                                                        onChange={this.handleTransactionDateEndChange} />
                                                </div>
                                            </div>
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <fieldset className="form-group">
                                                    <button className="btn btn-icon btn-primary pull-left"
                                                        style={{ marginTop: '1.75em' }}
                                                        onClick={this.validate}>
                                                        Filter
                                                    </button>
                                                    <button className="ml-1 btn btn-icon btn-primary pull-left"
                                                        style={{ marginTop: '1.75em' }}
                                                        onClick={this.handleRetry}>
                                                        Retry
                                                    </button>
                                                </fieldset>
                                            </div>
                                        </div>
                                        {(this.hasData() && !this.hasAccountErrors()) ?
                                            <div style={{ overflow: 'auto' }}>
                                                <div>
                                                    <p>Maximum of 500 rows listed or all from the last 2 days</p>
                                                </div>
                                                <table className="table table-striped table-bordered transactions" id="columnFilteredTable">
                                                    <thead>
                                                        <tr>
                                                            <th>TransactionId</th>
                                                            <th>Direction</th>
                                                            <th>Type</th>
                                                            <th>From</th>
                                                            <th>To</th>
                                                            <th>Status</th>
                                                            <th>Transact Date</th>
                                                            <th>Complete Date</th>
                                                            <th>
                                                                <div>
                                                                    <i id="RetryAll" name="RetryAll"
                                                                        className={this.state.selectAll["RetryAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                        onClick={this.handleSelectAll}
                                                                        data-type="Retry"
                                                                        aria-hidden="true"></i>
                                                                    <span>&nbsp;Retry</span>
                                                                </div>
                                                            </th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.data.map(function (data, index) {
                                                            return (
                                                                <tr key={"data" + index}>
                                                                    <td>{data.TransactionId}</td>
                                                                    <td>{data.DirectionType}</td>
                                                                    <td>{data.ServiceType}</td>
                                                                    <td>{data.From}</td>
                                                                    <td>{(data.To != null && data.To.length > 25) ? data.To.substring(0, 22) + ' ...' : data.To}</td>
                                                                    <td>{(data.Status != null) ? data.Status.replace("_", " ") : data.Status}</td>
                                                                    <td>{that.formatting.formatDateLocal(data.TransactionDate)}</td>
                                                                    <td>{(data.CompleteDate != null) ? that.formatting.formatDateLocal(data.CompleteDate) : ""}</td>
                                                                    <td>
                                                                        <div>
                                                                            <i id={"txn_retry_" + data.TransactionId}
                                                                                name="Retry"
                                                                                className={data.RetryEnabled ? (data.Retry ? "fa fa-check-square-o" : "fa fa-square-o") : ""}
                                                                                onClick={that.handleSelect}
                                                                                data-value={JSON.stringify(data)} data-type="Retry"
                                                                                aria-hidden="true"><span className="hidden">{data.RetryEnabled ? (data.Retry ? 1 : 0) : ""}</span></i>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="btn-group">
                                                                            <button type="button" className="btn btn-icon btn-info btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-bars font-small-1" /></button>
                                                                            <div className="dropdown-menu">
                                                                                <Link to={{ pathname: '/Layout/TransactionDetails', state: { transactionId: data.TransactionId } }} className="dropdown-item">Details</Link>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })
                                                        }
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
