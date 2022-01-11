import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Formatting from '../Components/Formatting.jsx';

export default class TransactionDetails extends React.Component {
    constructor(props) {
        super(props);
        let transactionId = "00000000-0000-0000-0000-000000000000";
        if (props != null && props.location != null && props.location.state != null && props.location.state.transactionId != null) {
            transactionId = props.location.state.transactionId;
        } else {
            this.props.history.goBack();
        }
        this.state = {
            transactionId: transactionId,
            data: [],
            receivedData: false,
            alert: null
        }
        this.formatting = new Formatting();
    }

    componentDidMount() {
        var apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Transactions/' + this.state.transactionId)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("transaction details data = ", data);
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
        let serviceType = data.ServiceType || noData;
        let currencySymbol = "$"; //USD
        const T = { SMS: "SMS", MMS: "MMS", Voice: "Voice", Fax: "Fax", Email: "Email" };
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        {this.state.receivedData ?
                            <div className="card col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xl-10 offset-md-1">
                                <div className="card-header">
                                    <h4 className="card-title">{"Transaction" + (data != null ? " - " + data.TransactionId : " Details")}</h4>
                                </div>
                                <div className="card-body">
                                    <div className="card-block">
                                        <div className="row">
                                            {(this.state.data != null && Object.keys(this.state.data).length > 0) ?
                                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <div style={{ overflow: 'auto' }}>
                                                        <table className="table table-bordered">
                                                            <tbody>
                                                                <tr><th>AccountId</th><td>{data.AccountId}</td></tr>
                                                                <tr><th>AssociationId</th><td>{data.AssociationId}</td></tr>
                                                                <tr><th>ServiceId</th><td>{data.ServiceId || noData}</td></tr>
                                                                <tr><th>ReferenceServiceId</th><td>{data.ReferenceServiceId || noData}</td></tr>
                                                                <tr><th>DirectionType</th><td>{data.DirectionType || noData}</td></tr>
                                                                <tr><th>ServiceName</th><td>{data.ServiceName || noData}</td></tr>
                                                                <tr><th>ServiceType</th><td>{data.ServiceType || noData}</td></tr>
                                                                <tr><th>ServiceRate</th><td>{data.ServiceRate || noData}</td></tr>
                                                                <tr><th>Units</th><td>{data.Units || noData}</td></tr>
                                                                {serviceType === T.Voice ? <tr><th>Minutes</th><td>{data.Minutes || noData}</td></tr> : null}
                                                                <tr><th>To</th><td>{data.To || noData}</td></tr>
                                                                {serviceType === T.Email ? <tr><th>Cc</th><td>{data.Cc || noData}</td></tr> : null}
                                                                {serviceType === T.Email ? <tr><th>Bcc</th><td>{data.Bcc || noData}</td></tr> : null}
                                                                <tr><th>From</th><td>{data.From || noData}</td></tr>
                                                                {serviceType === T.Email ? <tr><th>FromDisplayName</th><td>{data.FromDisplayName || noData}</td></tr> : null}
                                                                {serviceType === T.Email ? <tr><th>Subject</th><td>{data.Subject || noData}</td></tr> : null}
                                                                <tr><th>Body</th><td>{data.Body || noData}</td></tr>
                                                                {serviceType === T.Fax ? <tr><th>HostedFileId</th><td>{data.HostedFileId || noData}</td></tr> : null}
                                                                {serviceType === T.Fax ? <tr><th>MediaId</th><td>{data.MediaId || noData}</td></tr> : null}
                                                                {serviceType === T.Fax ? <tr><th>MediaUrl</th><td>{data.MediaUrl || noData}</td></tr> : null}
                                                                {serviceType === T.Fax ? <tr><th>MediaMimeType</th><td>{data.MediaMimeType || noData}</td></tr> : null}
                                                                {serviceType === T.Fax ? <tr><th>NumPages</th><td>{data.NumPages || noData}</td></tr> : null}
                                                                {serviceType === T.Fax ? <tr><th>Quality</th><td>{data.Quality || noData}</td></tr> : null}
                                                                {serviceType === T.Voice ? <tr><th>VoiceConnectUrl</th><td>{data.VoiceConnectUrl || noData}</td></tr> : null}
                                                                {serviceType === T.Voice ? <tr><th>VoiceRedirectNumber</th><td>{data.VoiceRedirectNumber || noData}</td></tr> : null}
                                                                <tr><th>Retries</th><td>{data.Retries || noData}</td></tr>
                                                                <tr><th>MaxRetries</th><td>{data.MaxRetries || noData}</td></tr>
                                                                <tr><th>ErrorCode</th><td>{data.ErrorCode || noData}</td></tr>
                                                                <tr><th>Error</th><td>{data.Error || noData}</td></tr>
                                                                <tr><th>MinimumCharge</th><td>{currencySymbol + that.formatting.formatDecimal(data.MinimumCharge, 6) || noData}</td></tr>
                                                                <tr><th>Price</th><td>{currencySymbol + that.formatting.formatDecimal(data.Price, 6) || noData}</td></tr>
                                                                <tr><th>Status</th><td>{data.Status || noData}</td></tr>
                                                                <tr><th>TransactionDate</th><td>{data.TransactionDate != null ? that.formatting.formatDateLocal(data.TransactionDate) : noData}</td></tr>
                                                                <tr><th>CompleteDate</th><td>{data.CompleteDate != null ? that.formatting.formatDateLocal(data.CompleteDate) : noData}</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-3 col-lg-3 col-xl-3">
                                                            <Link to={{ pathname: '/Layout/Transactions', state: { accountId: data.AccountId } }} className="btn btn-default">Back to Transactions</Link>
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
