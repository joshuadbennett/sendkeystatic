import React from 'react';
//import { Link } from 'react-router-dom';
//import axios from 'axios';
//import Configuration from '../Utils/config';
//import ContentPane from '../Layout/ContentPane.jsx';
//import SetAuthorizationToken from '../Utils/setAuthorizationToken';
//import ApiActions from '../Components/ApiActions.jsx';
//import SweetAlert from 'react-bootstrap-sweetalert';
//import Select from 'react-select';
//import 'react-select/dist/react-select.css';
//import Validation from '../Components/Validation.jsx';
//import ValidationInput from '../Components/ValidationInput.jsx';
//import ValidationSelect from '../Components/ValidationSelect.jsx';
//import loadScript from '../Utils/load-script';
//import Captcha from '../Utils/Captcha';
//import uuidv4 from 'uuid/v4';
//import Formatting from '../Components/Formatting.jsx';
import $ from 'jquery';
import DataTable from 'datatables.net';

export default class Table extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dom: props.dom || '<"data-table-wrapper"t>',
            columns: props.columns || [],
            data: props.data || [],
            ordering: props.ordering || false
        }
        this.reloadTableData = this.reloadTableData.bind(this);
        this.updateTable = this.updateTable.bind(this);
    }

    componentDidMount() {
        //console.log(this.state);
        $(this.refs.main).DataTable({
            dom: this.state.dom,
            data: this.state.data,
            columns : this.state.columns,
            ordering: this.state.ordering
        });
    }

    componentWillUnmount() {
        $('.data-table-wrapper')
            .find('table')
            .DataTable()
            .destroy(true);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.data.length !== this.props.data.length) {
            this.reloadTableData(nextProps.data);
        } else {
            this.updateTable(nextProps.data);
        }
        return false;
    }

    reloadTableData(data) {
        const table = $('.data-table-wrapper')
            .find('table')
            .DataTable();
        table.clear();
        table.rows.add(data);
        table.draw();
    }

    updateTable(data) {
        const table = $('.data-table-wrapper')
            .find('table')
            .DataTable();
        let dataChanged = false;
        table.rows().every(function () {
            const oldData = this.data();
            const newData = data.find((item) => {
                return item.AssociationId === oldData.AssociationId; // generalize
            });
            // generalize
            if (oldData.AuthKey !== newData.AuthKey) {
                dataChanged = true;
            }
            if (oldData.AssociationNumber !== newData.AssociationNumber) {
                dataChanged = true;
            }
            if (oldData.AssociationBillingId !== newData.AssociationBillingId) {
                dataChanged = true;
            }
            if (oldData.AllowSMS !== newData.AllowSMS) {
                dataChanged = true;
            }
            if (oldData.AllowMMS !== newData.AllowMMS) {
                dataChanged = true;
            }
            if (oldData.AllowVoice !== newData.AllowVoice) {
                dataChanged = true;
            }
            if (oldData.AllowFax !== newData.AllowFax) {
                dataChanged = true;
            }
            if (dataChanged) {
                this.data(newData);
            }
            return true; // RCA esLint configuration wants us to 
            // return something
        });

        if (dataChanged) {
            table.draw();
        }
    }

    render() {
        return (
            <div>
                <table ref="main" />
            </div>);
    }
}

