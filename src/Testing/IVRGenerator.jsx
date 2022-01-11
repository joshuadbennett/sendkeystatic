import React from "react";
import Form from "react-jsonschema-form";
//import { Link } from 'react-router-dom';
import axios from 'axios';
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Validation from '../Components/Validation.jsx';
import ValidationSelect from '../Components/ValidationSelect.jsx';
//import moment from 'moment';
//import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
//import loadScript from '../Utils/load-script';
//import Captcha from '../Utils/Captcha';
//import Formatting from '../Components/Formatting.jsx';
import IVRConfig from '../IVR/IVRConfigInfo.jsx';
import IVRMenu from '../IVR/IVRMenuInfo.jsx';

const log = (type) => console.log.bind(console, type);

export default class IVRGenerator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            schemas: [
                { SchemaId: "0", Name: "IVRConfigInfo" },
                { SchemaId: "1", Name: "IVRMenuInfo" }
            ],
            schemaOptions: [
                { value: "0", label: "IVRConfig" },
                { value: "1", label: "IVRMenu" }
            ],
            schemaId: null,
            schemaName: null,
            schemaLabel: null,
            formData: "",
            data: null,
            receivedData: true,
            alert: null
        }
        this.validation = new Validation();
    }

    componentWillUnmount() {
        this.validation = null;
    }

    refreshData = () => {
        this.setState({
            alert: null,
            receivedData: false
        });
        let className = this.state.schemaName || this.state.schemas[0].Name;
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/IVR/Schema/' + className)
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = this.getSchemaData(className);
                data.Schema = JSON.parse(response.data);
                console.log("ivr generator data = ", data);
                this.setState({
                    data: data,
                    receivedData: true
                });
                //loadScript('/app-assets/js/scripts/tables/datatables/datatable-basic.js', () => { });
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

    handleSchemaChange = (value) => {
        let schemaId = "";
        let schemaName = "";
        let schemaLabel = "";
        let data = this.state.data;
        let match = this.state.schemas.find((item) => item.SchemaId === value);
        if (match != null) {
            schemaId = match.SchemaId;
            schemaName = match.Name;
            schemaLabel = match.Name;
            data = this.getSchemaData(match.Name);
        }
        this.setState({
            schemaId: schemaId,
            schemaName: schemaName,
            schemaLabel: schemaLabel,
            data: data
        }/*, this.refreshData*/);
    }

    getSchemaData = (name) => {
        switch (name) {
            case "IVRMenuInfo":
                return IVRMenu;
            case "IVRConfigInfo":
            default:
                return IVRConfig;
        }
    }

    onFormDataChange = ({ formData }) =>
        this.setState({ formData });

    render() {
        //let that = this;
        //alert(JSON.stringify(formData));
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">IVR Generator (Experimental)</h2>
                            <div className="heading-elements">
                                <ul className="list-inline mb-0">
                                    <li><a onClick={this.refreshGrid}><i className="ft-rotate-cw"></i></a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="card-body">
                            <div className="card-block">
                                <section>
                                    <div className="row">
                                        <div className="col-sm-6 col-md-6 col-lg-6 col-xl-6">
                                            <ValidationSelect isRequired={true} receivedData={this.state.receivedData}
                                                label="Schema:"
                                                id="schema" name="schema"
                                                placeholder="Select schema"
                                                valueKey="value" labelKey="label"
                                                value={this.state.schemaId}
                                                data={this.state.schemaOptions}
                                                validation={this.validation} errors={[]}
                                                handleChange={this.handleSchemaChange} handleBlur={this.handleBlur} />
                                        </div>
                                    </div>
                                    {this.state.data != null ?
                                        <Form schema={this.state.data.Schema}
                                            onChange={log("changed")}
                                            onSubmit={log("submitted")}
                                            onError={log("errors")}
                                            formData={this.state.data.FormData}
                                        />
                                        :
                                        ""
                                    }
                                </section>
                            </div>
                        </div>
                    </div>
                </section>
            </ContentPane>
        );
    }
}