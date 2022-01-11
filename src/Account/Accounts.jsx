import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions';
import SweetAlert from 'react-bootstrap-sweetalert';
import loadScript from '../Utils/load-script';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';

export default class Accounts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            objectName: "Account",
            data: [],
            receivedData: false,
            alert: null
        }
        this.formatting = new Formatting();
    }

    componentDidMount() {
        this.refreshData();
    }

    componentWillUnmount() {
        this.formatting = null;
        localStorage.removeItem("DataTables_columnFilteredTable_/");
    }

    refreshData = () => {
        this.setState({
            alert: null,
            receivedData: false
        });
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Accounts/Table')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("accounts data = ", data);
                this.setState({
                    data: data || [],
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

    handleChange = (value, change, action) => {
        let subject = this.state.objectName;
        let magicWord = Captcha(5);
        let payload = {
            "id": value
        };
        let note = "This will " + change.toLocaleLowerCase() + " the selected " + subject.toLocaleLowerCase() + ".\n\n";
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

    recieveInput = (payload, text, magicWord, action, verb) => {
        let subject = this.state.objectName;
        if (text === magicWord) {
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
                })
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
                <SweetAlert success title={subject + " " + verb + " Successful!"} onConfirm={this.refreshGrid.bind(this)}>
                </SweetAlert>
            )
        });
    }

    handleError = (title, message) => {
        this.setState({
            alert: (
                <SweetAlert danger title={title} onConfirm={this.hideAlert.bind(this)}>
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
                            <h2 className="card-title">Accounts</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li><Link to="/Layout/AddUpdateAccount"><i className="ft-file-plus"></i></Link></li>
                                    {/*<li><Link to="/Layout/AddUpdateAccount" className="btn btn-primary pull-right">Create Account</Link></li>*/}
                                    <li><a onClick={this.refreshGrid}><i className="ft-rotate-cw"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-body">
                            {this.state.receivedData ?
                                <div className="card-block">
                                    <section>
                                        <div>
                                            <p>Communication counts are for this month and as of the date and time requested.</p>
                                        </div>
                                        <div style={{ overflow: 'auto' }}>
                                            <table className="table table-striped table-bordered accounts" id="columnFilteredTable">
                                                <thead>
                                                    <tr>
                                                        {/*<th>Type</th>*/}
                                                        <th>Name</th>
                                                        <th>Email Address</th>
                                                        <th>PIN</th>
                                                        <th>Rate</th>
                                                        <th>Msg</th>
                                                        <th>Voice</th>
                                                        <th>Fax</th>
                                                        <th>Email</th>
                                                        <th>Video</th>
                                                        {/*<th>Balance</th>*/}
                                                        {/*<th>Balance Date</th>*/}
                                                        <th>Active</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.data.map(function (data, index) {
                                                        let activeChangeVerb = data.IsActive ? "Deactivate" : "Activate";
                                                        //let currencySymbol = "$"; //USD
                                                        return (
                                                            <tr key={"data" + index}>
                                                                {/*<td>{data.AccountTypeName}</td>*/}
                                                                <td>{data.DisplayName}</td>
                                                                <td>{data.EmailAddress}</td>
                                                                <td>{data.PIN}</td>
                                                                <td>{data.RateName}</td>
                                                                <td>{data.MonthSMSCount + data.MonthMMSCount}</td>
                                                                <td>{data.MonthVoiceCount}</td>
                                                                <td>{data.MonthFaxCount}</td>
                                                                <td>{data.MonthEmailCount}</td>
                                                                <td>{data.MonthVideoCount}</td>
                                                                {/*<td>{currencySymbol + that.formatting.formatDecimal(data.Balance, 6)}</td>*/}
                                                                {/*<td>{that.formatting.formatDateLocal(data.BalanceDate)}</td>*/}
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
                                                                            <Link to={{ pathname: '/Layout/AddUpdateAccount', state: { accountId: data.AccountId, editMode: true } }} className="dropdown-item">Edit</Link>
                                                                            <a className="dropdown-item" onClick={that.handleChange.bind(that, data.AccountId, activeChangeVerb, "Accounts/ChangeActiveStatus")}>{activeChangeVerb}</a>
                                                                            <Link to={{ pathname: '/Layout/FunctionalTest', state: { accountId: data.AccountId } }} className="dropdown-item">Run Functional Test</Link>
                                                                            <Link to={{ pathname: '/Layout/Associations', state: { accountId: data.AccountId } }} className="dropdown-item">Associations</Link>
                                                                            <Link to={{ pathname: '/Layout/Transactions', state: { accountId: data.AccountId } }} className="dropdown-item">Transactions</Link>
                                                                            {data.IsActive ? <Link to={{ pathname: '/Layout/EmergencyCodes', state: { accountId: data.AccountId, editMode: true, displayName: data.DisplayName } }} className="dropdown-item">Emergency Codes</Link> : ""}
                                                                            {data.IsActive ? <Link to={{ pathname: '/Layout/EmergencyContacts', state: { accountId: data.AccountId, editMode: true, displayName: data.DisplayName } }} className="dropdown-item">Emergency Contacts</Link> : ""}
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
