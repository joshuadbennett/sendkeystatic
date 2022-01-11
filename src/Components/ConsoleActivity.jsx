import React from 'react';
import axios from 'axios'
import Configuration from '../Utils/config';
//import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import loadScript from '../Utils/load-script';
import moment from 'moment';

export default class ConsoleActivity extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activitylog: [],
            receivedData: false,
            alert: null
        }
    }

    componentDidMount() {
        var apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/ActivityLogs/PriorityActivity')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("console activity data = ", data);
                this.setState({
                    activitylog: data,
                    receivedData: true
                });
                loadScript('/app-assets/js/scripts/tables/datatables/datatable-basic.js', () => { });
                //console.log(this.state.activitylog);
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error)
            })
    }

    render() {
        return (
            <div id="console-activity" className="media-list height-400 position-relative">
                {this.state.receivedData ?
                    <div className="card-block">
                        {this.state.activitylog.map(function (log, index) {
                            return (
                                <a key={"ca_" + index} className="media border-0">
                                    <div className="media-left pr-1">
                                        <div className={`rounded-circle bg-blue-grey text-center ${"bg-lighten-" + (index)}`} style={{ padding: 5 }}>
                                            <i className="ft-user font-large-2 white" />
                                        </div>
                                    </div>
                                    <div className="media-body w-100">
                                        <h5 className="list-group-item-heading">{log.Username}
                                            <span className="font-medium-4 float-right pt-1"><h6 style={{ paddingRight: 10 }}>{moment(log.LogDate).fromNow()}</h6></span>
                                        </h5>
                                        <p className="list-group-item-text mb-0">
                                            <span className="activity">{log.LogMessage}</span>
                                        </p>
                                    </div>
                                </a>
                            )
                        })
                        }
                    </div>
                    :
                    <div className="card-block offset-lg-5 offset-md-5">
                        <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                        <span className="sr-only">Loading...</span>
                    </div>
                }
            </div>
        )
    }
}
