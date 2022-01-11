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

export default class EmergencyContacts extends React.Component {
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
            objectName: "Emergency contact",
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
            apiRouteUrl += '/' + this.state.accountId + '/EmergencyContacts';
        }
        axios.get(apiBaseUrl + apiRouteUrl)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("emergency contact data = ", data);
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
                Name: "<name>",
                Location: "<location>",
                Phone: "<E.164 phone number>",
                Email: "<email address>",
                IsCoordinator: "<Y or N>"
            });
            csv.push({
                Name: "Jane Doe",
                Location: "Site 1",
                Phone: "+18004444444",
                Email: "1@2.com",
                IsCoordinator: "Y"
            });
            csv.push({
                Name: "John Doe",
                Location: "Site 2",
                Phone: "+13169591122",
                Email: "a@b.com",
                IsCoordinator: "N"
            });
            return csv;
        }
        csv = data.map((item, index) => {
            return {
                Name: item.Name,
                Location: item.Location,
                Phone: item.PhoneNumber,
                Email: item.EmailAddress,
                IsCoordinator: item.IsCoordinatorString
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
                            <h2 className="card-title">Emergency Contacts{editMode ? " - " + this.state.displayName : ""}</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li><Link to={{ pathname: '/Layout/AddUpdateEmergencyContact', state: { accountId: this.state.accountId, editMode: true, displayName: this.state.displayName } }}><i className="ft-file-plus"></i></Link></li>
                                    <li><a onClick={this.refreshGrid}><i className="ft-rotate-cw"></i></a></li>
                                    <li>
                                        <CSVLink data={this.state.csv}
                                            filename={"EmergencyContacts-" + this.state.displayName.replace(" ", "_") + ".csv"}
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
                                            <p>Phone number must be provided in <a href="https://www.itu.int/rec/T-REC-E.164/en" target="_blank" rel="noopener noreferrer">E.164</a> format [+][country code][subscriber number including area code] (e.g. +18001234567 or +13165551234).</p>
                                        </div>
                                        <div style={{ overflow: 'auto' }}>
                                            <table className="table table-striped table-bordered alert-contacts" id="columnFilteredTable">
                                                <thead>
                                                    <tr>
                                                        <th>Account</th>
                                                        <th>Name</th>
                                                        <th>Location</th>
                                                        <th>Phone</th>
                                                        <th>Email</th>
                                                        <th>IsCoordinator</th>
                                                        <th>Last Communication</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.data.map(function (data, index) {
                                                        return (
                                                            <tr key={"data" + index}>
                                                                <td>{data.DisplayName}</td>
                                                                <td>{data.Name}</td>
                                                                <td>{data.Location}</td>
                                                                <td>{data.PhoneNumber}</td>
                                                                <td>{data.EmailAddress}</td>
                                                                <td>{data.IsCoordinatorString}</td>
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
