import React from 'react';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import ApiActions from '../Components/ApiActions';
import SweetAlert from 'react-bootstrap-sweetalert';
import LocalStorage from '../Utils/LocalStorage';
import Captcha from '../Utils/Captcha';
import Formatting from '../Components/Formatting.jsx';
import AssociationStatus from './AssociationStatus';

const NA = "N/A";
const SUCCESS = "Active";

const authTypes = {
    NONE: "",
    X509CERTIFICATE: "X.509 Certificate",
    CREDENTIALS: "Credentials"
}

const defaultAccountId = "00000000-0000-0000-0000-000000000000";

export default class MigrateCredentials extends React.Component {
    constructor(props) {
        super(props);
        this.local = new LocalStorage(props);
        let accountId = defaultAccountId;
        let data = null;
        if (props != null && props.location != null) {
            let location = props.location;
            accountId = (this.local.get("accountId") || accountId);
            if (location.state != null) {
                let state = location.state;
                //console.log("state = ", state);
                if (state.accountId != null) accountId = state.accountId;
                if (state.data != null) data = state.data;
            }
        }
        this.state = {
            accountId: accountId,
            objectId: null,
            objectName: "Credential",
            data: data || [],
            updates: [],
            selectAll: [],
            receivedData: false,
            alert: null
        }
        this.actionStatusTimer = false;
        this.formatting = new Formatting();
        this.status = new AssociationStatus();
    }

    componentDidMount() {
        this.setState({
            receivedData: true
        });
        this.refreshData();
    }

    componentWillUnmount() {
        this.formatting = null;
        this.status = null;
    }

    refreshData = () => {
        this.getAssociations();
    }

    refreshGrid = () => {
        this.setState({
            alert: null,
            receivedData: false
        }, this.refreshData);
    }

    getAssociations = () => {
        let apiBaseUrl = Configuration().apiUrl;
        let apiRouteUrl = 'api/Associations/Table';
        axios.get(apiBaseUrl + apiRouteUrl)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let associations = JSON.parse(response.data);
                //console.log("associations data = ", associations);
                let data = [];
                let updates = [];
                if (associations != null) {
                    data = associations.map((item) => {
                        let enabled = (item.WebhookAuthType === authTypes.CREDENTIALS &&
                            item.WebhookPassword == null &&
                            item.WebhookApiKey != null &&
                            item.WebhookApiKey.trim() !== "");
                        return {
                            MigrateEnabled: enabled,
                            Migrate: false,
                            AssociationId: item.AssociationId,
                            AssociationNumber: item.AssociationNumber,
                            WebhookAuthType: item.WebhookAuthType,
                            Notes: this.getNotes(item),
                            MigrationStatus: item.WebhookPassword != null && item.WebhookPassword.trim() !== "" ? SUCCESS : (enabled ? "" : NA)
                        }
                    });
                    updates = data.filter((item) => item["MigrateEnabled"]);
                }
                //console.log("migration data = ", data);
                //console.log("updates = ", updates);
                let selectAll = this.getSelectAll(data);
                this.setState({
                    data: data,
                    updates: updates,
                    selectAll: selectAll,
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

    getNotes = (item) => {
        let notes = []
        if (item == null) return notes;
        if (item.WebhookAuthType !== authTypes.CREDENTIALS) notes.push("WebhookAuthType not " + authTypes.CREDENTIALS);
        if (item.WebhookPassword != null && item.WebhookPassword.trim() !== "") notes.push("WebhookPassword already exists");
        if (item.WebhookApiKey == null || item.WebhookApiKey.trim() === "") notes.push("No value to migrate");
        return notes;
    }

    handleSelect = (e) => {
        let type = e.target.getAttribute("data-type");
        let row = JSON.parse(e.target.getAttribute("data-value"));
        let checked = e.target.className === "fa fa-square-o"; // className is as it was before onClick, so after it should be the opposite
        let list = this.state.updates;
        let item = list.find((item) => item.AssociationId === row.AssociationId);
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
            if (type === "Migrate") {
                if (!list[i]["MigrateEnabled"]) {
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
        selectAll["MigrateAll"] = this.areAllSelected(data, "Migrate");
        return selectAll;
    }

    areAllSelected = (data, type) => {
        let list = data;
        if (list == null || list.length < 1) return false;
        return !list.some((item) => !item[type]);
    }

    handleMigrate = () => {
        let list = this.state.updates;
        let actionList = list.filter((item) => {
            return (item != null && item.Migrate != null && item.Migrate && item.AssociationId != null);
        });
        if (actionList == null || actionList.length < 1) {
            this.setState({
                alert: (
                    <SweetAlert warning
                        title="Migrate"
                        onConfirm={this.hideAlert.bind(this)}
                    >
                        No items selected
                    </SweetAlert>
                )
            });
            return;
        }
        let change = "Migrate";
        let action = "Associations/MigrateCredentials";
        let subject = this.state.objectName;
        let magicWord = Captcha(5);
        let payload = actionList.map((item) => item.AssociationId);
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
                            <h2 className="card-title">Migrate Credentials</h2>
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
                                            <div className="col-sm-3 col-md-3 col-lg-3 col-xl-3">
                                                <fieldset className="form-group">
                                                    <button className="ml-1 btn btn-icon btn-primary pull-left"
                                                        style={{ marginTop: '1.75em' }}
                                                        onClick={this.handleMigrate}>
                                                        Migrate
                                                    </button>
                                                </fieldset>
                                            </div>
                                        </div>
                                        <div style={{ overflow: 'auto' }}>
                                            <table className="table table-striped table-bordered zero-configuration">
                                                <thead>
                                                    <tr>
                                                        <th>
                                                            <div>
                                                                <i id="MigrateAll" name="MigrateAll"
                                                                    className={this.state.selectAll["MigrateAll"] ? "fa fa-check-square-o" : "fa fa-square-o"}
                                                                    onClick={this.handleSelectAll}
                                                                    data-type="Migrate"
                                                                    aria-hidden="true"></i>
                                                                <span>&nbsp;Migrate</span>
                                                            </div>
                                                        </th>
                                                        <th>Number</th>
                                                        <th>WebhookAuth</th>
                                                        <th>Notes</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.data.map((data, index) => {
                                                        return (
                                                            <tr key={"data" + index}>
                                                                <td>
                                                                    <div>
                                                                        <i id={"assoc_migrate_" + data.AssociationId}
                                                                            name="Migrate"
                                                                            className={data.MigrateEnabled ? (data.Migrate ? "fa fa-check-square-o" : "fa fa-square-o") : ""}
                                                                            onClick={that.handleSelect}
                                                                            data-value={JSON.stringify(data)} data-type="Migrate"
                                                                            aria-hidden="true"><span className="hidden">{data.MigrateEnabled ? (data.Migrate ? 1 : 0) : ""}</span></i>
                                                                    </div>
                                                                </td>
                                                                <td>{data.AssociationNumber}</td>
                                                                <td>{data.WebhookAuthType}</td>
                                                                <td><ul>{data.Notes.map((item, i) => { return (<li key={"assoc_notes_" + data.AssociationId + "_" + i} style={{ listStyleType: 'circle' }}>{item}</li>) })}</ul></td>
                                                                <td><span>{data.MigrationStatus === SUCCESS ? that.status.getIcon(data.MigrationStatus) : data.MigrationStatus}</span></td>
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
