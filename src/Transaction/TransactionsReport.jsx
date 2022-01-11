import React from 'react';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Validation from '../Components/Validation.jsx';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import DatePickerInput from '../Components/DatePickerInput.jsx';
import 'react-datepicker/dist/react-datepicker.css';
import LocalStorage from '../Utils/LocalStorage';
import loadScript from '../Utils/load-script';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';
import { CSVLink } from 'react-csv';

const DATE_FORMAT = "YYYY-MM-DD";
//const FULL_DATE_FORMAT = "YYYY-MM-DD HH:mm:ssZ";
const defaultAccountId = "00000000-0000-0000-0000-000000000000";

export default class TransactionsReport extends React.Component {
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
            TransactionDateStart: this.dateValid(startDate) ? moment(startDate) : moment().subtract(1, 'months').startOf('month'),
            TransactionDateEnd: this.dateValid(endDate) ? moment(endDate) : moment().subtract(1, 'months').endOf('month')
        };
        this.state = {
            accountId: accountId,
            accounts: [],
            accountErrors: null,
            objectId: null,
            objectName: "Billing",
            data: [],
            filters: filters,
            csv: [],
            action: "<None>",
            magicWord: Captcha(5),
            receivedData: false,
            alert: null
        }

        this.local.set("accountId", accountId);
        this.actionStatusTimer = false;
        this.validation = new Validation();
        this.formatting = new Formatting();
    }

    componentDidMount() {
        this.getAccounts();
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
        let apiRouteUrl = 'api/Transactions/Report';
        let apiQuery = '';
        if (this.state.accountId != null) {
            let query = [];
            let startDate = this.state.filters.TransactionDateStart;
            //console.log("startDate = ", startDate);
            if (this.dateValid(startDate)) {
                query.push('startDate=' + startDate.format(DATE_FORMAT));
                //console.log("query = ", query);
            }
            let endDate = this.state.filters.TransactionDateEnd;
            //console.log("endDate = ", endDate);
            if (this.dateValid(endDate)) {
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
                //console.log("transactions report data = ", data);
                let csv = this.buildCSV(data);
                this.setState({
                    data: (data || []),
                    csv: csv,
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
        return (this.state.data != null && this.state.data.length > 0);
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
        //if (value == null || !this.state.accounts.some((item) => value === item.AccountId)) errors.push("Must be a valid account.");
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

    getFilename = (filters) => {
        let suffix = "_";
        if (filters != null) {
            suffix += (filters.TransactionDateStart != null) ? filters.TransactionDateStart.format(DATE_FORMAT) : "-";
            suffix += "_To_";
            suffix += (filters.TransactionDateEnd != null) ? filters.TransactionDateEnd.format(DATE_FORMAT) : "-";
        }
        return "TransactionReport" + suffix + ".csv";
    }

    buildCSV = (data) => {
        //console.log("buildCSV arg = ", data);
        let csv = [];
        if (data != null && data.length > 0) {
            csv.push(Object.keys(data[0]));
            data.forEach((item) => {
                csv.push(Object.values(item));
            });
        } else {
            csv.push(["No items"])
        }
        //console.log("csv = ", csv);
        return csv;
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

    hideAlert = () => {
        this.setState({ alert: null });
    }

    render() {
        let that = this;
        let filters = this.state.filters;
        let csv = this.state.csv;
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Billing</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li>
                                        <CSVLink data={csv}
                                            filename={this.getFilename(filters)}
                                            className="ft-download"
                                            target="_blank"></CSVLink>
                                    </li>
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
                                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                <div><p>Dates selected and reported are as tracked by the Sendkey server</p></div>
                                            </div>
                                        </div>
                                        <div className="row">
                                            {/*
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
                                            */}
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
                                                        onClick={this.refreshData}>
                                                        Filter
                                                    </button>
                                                </fieldset>
                                            </div>
                                        </div>
                                        {(this.hasData() && !this.hasAccountErrors()) ?
                                            <div style={{ overflow: 'auto' }}>
                                                <table className="table table-striped table-bordered billing" id="columnFilteredTable">
                                                    <thead>
                                                        <tr>
                                                            <th>Acct. Name</th>
                                                            <th>Acct. Billing Id</th>
                                                            <th>Acct. Id</th>
                                                            <th>Assoc. #</th>
                                                            <th>Assoc. Billing Id</th>
                                                            <th>Assoc. Id</th>
                                                            <th>Direction</th>
                                                            <th>Service</th>
                                                            <th>Price</th>
                                                            <th>Date</th>
                                                            <th>Base Rate</th>
                                                            <th>Base Allocation</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {this.state.data.map(function (data, index) {
                                                            let currencySymbol = "$"; //USD
                                                            return (
                                                                <tr key={"data" + index}>
                                                                    <td>{data.AccountName}</td>
                                                                    <td>{data.AccountBillingId}</td>
                                                                    <td>{data.AccountId}</td>
                                                                    <td>{data.AssociationNumber}</td>
                                                                    <td>{data.AssociationBillingId}</td>
                                                                    <td>{data.AssociationId}</td>
                                                                    <td>{data.DirectionType}</td>
                                                                    <td>{data.ServiceType}</td>
                                                                    <td>{currencySymbol + that.formatting.formatDecimal(data.Price, 6)}</td>
                                                                    <td>{moment.utc(data.TransactionDate).format("YYYY-MM-DD HH:mm:ss")}</td>
                                                                    <td>{currencySymbol + that.formatting.formatDecimal(data.BaseRate, 6)}</td>
                                                                    <td>{data.BaseAllocation}</td>
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
