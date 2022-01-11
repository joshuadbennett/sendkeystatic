import React from 'react';
import { Link } from 'react-router-dom';
import ContentPane from '../Layout/ContentPane.jsx';
import Formatting from '../Components/Formatting.jsx';

export default class AssociationDetails extends React.Component {
    constructor(props) {
        super(props);
        let data = [];
        if (props != null && props.location != null && props.location.state != null && props.location.state.data != null) {
            data = props.location.state.data;
            //console.log("props data = ", data);
        } else {
            this.props.history.goBack();
        }
        this.state = {
            data: data,
            receivedData: true,
            alert: null
        }
        this.formatting = new Formatting();
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        this.formatting = null;
    }

    render() {
        let that = this;
        let data = this.state.data;
        let noData = "N/A";
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        {this.state.receivedData ?
                            <div className="card col-xs-10 col-sm-10 col-md-10 col-lg-10 col-xl-10 offset-md-1">
                                <div className="card-header">
                                    <h4 className="card-title">{"Association" + (data != null ? " - " + data.AssociationNumber : " Details")}</h4>
                                </div>
                                <div className="card-body">
                                    <div className="card-block">
                                        <div className="row">
                                            {(this.state.data != null && Object.keys(this.state.data).length > 0) ?
                                                <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                                                    <div style={{ overflow: 'auto' }}>
                                                        <table className="table table-bordered">
                                                            <tbody>
                                                                <tr><th>AssociationId</th><td>{data.AssociationId}</td></tr>
                                                                <tr><th>AccountId</th><td>{data.AccountId}</td></tr>
                                                                <tr><th>AuthKey</th><td>{data.AuthKey}</td></tr>
                                                                <tr><th>AssociationBillingId</th><td>{data.AssociationBillingId || noData}</td></tr>
                                                                <tr><th>Description</th><td>{data.Description || noData}</td></tr>
                                                                <tr><th>MessageService</th><td>{data.MessageService || noData}</td></tr>
                                                                <tr><th>VoiceService</th><td>{data.VoiceService || noData}</td></tr>
                                                                <tr><th>FaxService</th><td>{data.FaxService || noData}</td></tr>
                                                                <tr><th>EmailService</th><td>{data.EmailService || noData}</td></tr>
                                                                <tr><th>WebhookUrl</th><td>{data.WebhookUrl || noData}</td></tr>
                                                                <tr><th>WebhookAuthType</th><td>{data.WebhookAuthType || noData}</td></tr>
                                                                <tr><th>WebhookUsername</th><td>{data.WebhookUsername || noData}</td></tr>
                                                                <tr><th>WebhookPassword</th><td>{data.WebhookPassword || noData}</td></tr>
                                                                <tr><th>WebhookApiKey</th><td>{data.WebhookApiKey || noData}</td></tr>
                                                                <tr><th>ReceiveFaxFormat</th><td>{data.ReceiveFaxFormat || noData}</td></tr>
                                                                <tr><th>AllowSMS</th><td>{data.AllowSMS != null ? (data.AllowSMS ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>AllowMMS</th><td>{data.AllowMMS != null ? (data.AllowMMS ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>AllowVoice</th><td>{data.AllowVoice != null ? (data.AllowVoice ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>AllowFax</th><td>{data.AllowFax != null ? (data.AllowFax ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>AllowEmail</th><td>{data.AllowEmail != null ? (data.AllowEmail ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>AllowVideo</th><td>{data.AllowVideo != null ? (data.AllowVideo ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>IsActive</th><td>{data.IsActive != null ? (data.IsActive ? "Y" : "N") : noData}</td></tr>
                                                                <tr><th>LastCommunicationOn</th><td>{data.LastCommunicationOn != null ? that.formatting.formatDateLocal(data.CompleteDate) : noData}</td></tr>
                                                                <tr><th>SystemNotificationId</th><td>{data.SystemNotificationId || noData}</td></tr>
                                                                <tr><th>WebhookStatus</th><td>{data.WebhookStatus || noData}</td></tr>
                                                                <tr><th>WebhookAuthStatus</th><td>{data.WebhookAuthStatus || noData}</td></tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-3 col-lg-3 col-xl-3">
                                                            <Link to={{ pathname: '/Layout/Associations', state: { accountId: data.AccountId } }} className="btn btn-default">Back to Associations</Link>
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
