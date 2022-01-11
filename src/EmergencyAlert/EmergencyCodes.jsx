import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
//import SweetAlert from 'react-bootstrap-sweetalert';
import loadScript from '../Utils/load-script';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';
import { CSVLink } from 'react-csv';

export default class EmergencyCodes extends React.Component {
    constructor(props) {
        super(props);
        let editMode = false;
        let accountId = "00000000-0000-0000-0000-000000000000";
        let displayName = "";
        if (props != null && props.location != null && props.location.state != null) {
            if (props.location.state.editMode != null) editMode = props.location.state.editMode;
            if (props.location.state.accountId != null) accountId = props.location.state.accountId;
            if (props.location.state.displayName != null) displayName = props.location.state.displayName;
        }
        //console.log("editMode = ", editMode, " | accountId = ", accountId, " | displayName = ", displayName);
        this.state = {
            editMode: editMode,
            accountId: accountId,
            displayName: displayName,
            objectId: null,
            objectName: "Emergency codes",
            data: [],
            csv: [],
            action: "<None>",
            magicWord: Captcha(5),
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
        let apiRouteUrl = 'api/Accounts';
        if (this.state.accountId != null) {
            apiRouteUrl += '/' + this.state.accountId + '/EmergencyCodes';
        }
        axios.get(apiBaseUrl + apiRouteUrl)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("emergency contact code data = ", data);
                this.setState({
                    data: data,
                    csv: this.buildCSV(data),
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

    buildCSV = (data) => {
        let csv = [];
        if (data == null || data.length < 1) {
            csv.push({
                Code: "Test",
                Message: "This is a test of the Sendkey emergency alert system. This is ONLY a test."
            });
            csv.push({
                Code: "AllClear",
                Message: "The situation is ALL CLEAR. There are currently no active Sendkey emergency alerts."
            });
            return csv;
        }
        csv = data.map((item, index) => {
            return {
                Code: item.Code,
                Message: item.Message
            };
        });
        return csv;
    }

    hideAlert = () => {
        this.setState({ alert: null });
    }

    render() {
        let that = this;
        let editMode = this.state.editMode;
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Emergency Codes{editMode ? " - " + this.state.displayName : ""}</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li><Link to={{ pathname: '/Layout/AddUpdateEmergencyCode', state: { accountId: this.state.accountId, editMode: true, displayName: this.state.displayName } }}><i className="ft-file-plus"></i></Link></li>
                                    <li><a onClick={this.refreshGrid}><i className="ft-rotate-cw"></i></a></li>
                                    <li>
                                        <CSVLink data={this.state.csv}
                                            filename={"EmergencyCodes-" + this.state.displayName.replace(" ", "_") + ".csv"}
                                            className="ft-download"
                                            target="_blank"></CSVLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-body">
                            {this.state.receivedData ?
                                <div className="card-block">
                                    <section>
                                        <div>
                                            <p>Sendkey uses delimited files to make configuration quick and easy.
                                                Configure codes, coordinators, and contacts by uploading a delimited file.
                                                You can download a file of existing data or a sample file if no data exist.</p>
                                        </div>
                                        <div style={{ overflow: 'auto' }}>
                                            <table className="table table-striped table-bordered alert-codes" id="columnFilteredTable">
                                                <thead>
                                                    <tr>
                                                        <th>Account</th>
                                                        <th>PIN</th>
                                                        <th>Code</th>
                                                        <th>Message</th>
                                                        <th>Last Communication</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.data.map(function (data, index) {
                                                        return (
                                                            <tr key={"data" + index}>
                                                                <td>{data.DisplayName}</td>
                                                                <td>{data.PIN}</td>
                                                                <td>{data.Code}</td>
                                                                <td>{data.Message}</td>
                                                                <td>{(data.LastCommunicationOn == null) ? "Never" : that.formatting.formatDateLocal(data.LastCommunicationOn)}</td>
                                                            </tr>
                                                        )
                                                    })}
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
