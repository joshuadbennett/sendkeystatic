import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Formatting from '../Components/Formatting.jsx';

export default class AccountDetails extends React.Component {
    constructor(props) {
        super(props);
        let accountId = "00000000-0000-0000-0000-000000000000";
        if (props != null && props.location != null && props.location.state != null && props.location.state.accountId != null) {
            accountId = props.location.state.accountId;
        } else {
            this.props.history.push("/Layout/Accounts");
        }
        this.state = {
            accountId: accountId,
            data: [],
            receivedData: false,
            alert: null
        }
        this.formatting = new Formatting();
    }

    componentDidMount() {
        var apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Accounts/' + this.state.accountId)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("account details data = ", data);
                this.setState({
                    data: data,
                    receivedData: true
                });
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                this.setState({
                    receivedData: true
                });
                console.log("error", error)
            });
    }

    componentWillUnmount() {
        this.formatting = null;
    }

    render() {
        let that = this;
        let data = this.state.data;
        let noData = "N/A";
        let currencySymbol = "$"; //USD
        return (
            <ContentPane>
                <section>
                    <div className="card">
                    {this.state.receivedData ?
                        <div className="card col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xl-10 offset-md-1">
                            <div className="card-header">
                                <h4 className="card-title">{data.DisplayName || "Account Details"}</h4>
                            </div>
                            <div className="card-body">
                                <div className="card-block">
                                    <div className="row">
                                        {(data != null && Object.keys(data).length > 0) ?
                                            <div className="ccol-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                <div style={{ overflow: 'auto' }}>
                                                    <table className="table table-bordered">
                                                        <tbody>
                                                            <tr><th>Rate</th><td>{data.Rate.RateName || noData}</td></tr>
                                                            <tr><th>Billing Id</th><td>{data.AccountBillingId}</td></tr>
                                                            <tr><th>Contact Title</th><td>{data.Title || noData}</td></tr>
                                                            <tr><th>Contact First Name</th><td>{data.FirstName || noData}</td></tr>
                                                            <tr><th>Contact Middle Name</th><td>{data.MiddleName || noData}</td></tr>
                                                            <tr><th>Contact Last Name</th><td>{data.LastName || noData}</td></tr>
                                                            <tr><th>Suffix</th><td>{data.Suffix || noData}</td></tr>
                                                            <tr><th>Email Address</th><td>{data.EmailAddress || noData}</td></tr>
                                                            <tr><th>PIN</th><td>{data.PIN || noData}</td></tr>
                                                            <tr><th>Balance</th><td>{data.Balance != null ? currencySymbol + that.formatting.formatDecimal(data.Balance, 6) : noData}</td></tr>
                                                            <tr><th>Balance Date</th><td>{data.BalanceDate != null ? that.formatting.formatDateLocal(data.BalanceDate) : noData}</td></tr>
                                                            <tr><th>Credit Limit</th><td>{data.CreditLimit != null ? currencySymbol + that.formatting.formatDecimal(data.CreditLimit, 6) : noData}</td></tr>
                                                            <tr><th>Last Communication On</th><td>{data.LastCommunicationOn != null ? that.formatting.formatDateLocal(data.LastCommunicationOn) : noData}</td></tr>
                                                            <tr><th>Is Active</th><td>{data.IsActive ? "Yes" : "No"}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-3 col-lg-3 col-xl-3">
                                                        <Link to="/Layout/Accounts" className="btn btn-default">Back to Accounts</Link>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            null
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className="card-block offset-lg-5 offset-md-5">
                            <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                            <span className="sr-only">Loading...</span>
                        </div>
                    }
                    </div>
                </section>
            </ContentPane>
        )
    }
}
