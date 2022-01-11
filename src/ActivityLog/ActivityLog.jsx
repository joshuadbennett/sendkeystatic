import React from 'react';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import loadScript from '../Utils/load-script';

export default class ActivityLog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            receivedData: false,
            alert: null
        }
    }

    componentDidMount() {
        this.refreshData();
    }

    componentWillUnmount() {
        localStorage.removeItem("DataTables_columnFilteredTable_/");
    }

    refreshData = () => {
        this.setState({
            alert: null,
            receivedData: false
        });
        let apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/ActivityLogs/Table')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("activity data = ", data);
                this.setState({
                    data: data,
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

    render() {
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Activity Log</h2>
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
                                        {this.state.data != null && this.state.data.length > 0 ?
                                            <div>
                                                <p>{"The " + this.state.data.length + " most recent log" + (this.state.data.length > 1 ? "s" : "") + " are listed below."}</p>
                                            </div>
                                            :
                                            ""
                                        }
                                        <div style={{ overflow: 'auto' }}>
                                            <table className="table table-striped table-bordered activity-log" id="columnFilteredTable">
                                                <thead>
                                                    <tr>
                                                        <th>Log Date</th>
                                                        <th>Activity</th>
                                                        <th>Level</th>
                                                        <th>Type</th>
                                                        <th>Severity</th>
                                                        <th>User</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.data.map(function (log, index) {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{log.LogDateString}</td>
                                                                <td>{log.LogMessage}</td>
                                                                <td>{log.LogLevel}</td>
                                                                <td>{log.LogType}</td>
                                                                <td>{log.Severity}</td>
                                                                <td>{log.Username}</td>
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
            </ContentPane>
        )
    }
}
