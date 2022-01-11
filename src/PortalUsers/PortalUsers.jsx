import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import Configuration from '../Utils/config';
import ContentPane from '../Layout/ContentPane.jsx';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import loadScript from '../Utils/load-script';

export default class PortalUsers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            PortalUsers: [],
            receivedData: false,
            alert: null
        }
    }

    componentDidMount() {
        var apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/users')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                this.setState({
                    PortalUsers: JSON.parse(response.data),
                    receivedData: true
                });
                loadScript('/app-assets/js/scripts/tables/datatables/datatable-basic.js', () => { });
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
            })
    }

    componentWillUnmount() {
        localStorage.removeItem("DataTables_columnFilteredTable_/");
    }

    render() {
        return (
            <ContentPane>
                <section>
                    <div className="card">
                        <div className="card-header">
                            <h4 className="card-title">Sendkey Users</h4>
                        </div>
                        <div className="card-body">
                            {this.state.receivedData ?
                                <div className="card-block">
                                    <section>
                                        <div style={{ overflow: 'auto' }}>
                                            <table className="table table-striped table-bordered zero-configuration">
                                                <thead>
                                                    <tr>
                                                        <th>Username</th>
                                                        <th>First Name</th>
                                                        <th>Last Name</th>
                                                        <th>Email</th>
                                                        <th>Active</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {this.state.PortalUsers.map(function (portalUser, index) {
                                                        return (
                                                            <tr key={index}>
                                                                <td>{portalUser.Username}</td>
                                                                <td>{portalUser.FirstName}</td>
                                                                <td>{portalUser.LastName}</td>
                                                                <td>{portalUser.Email}</td>
                                                                <td>
                                                                    <span>
                                                                        {portalUser.IsActive ?
                                                                            <div className="text-xs-left text-success">
                                                                                <i className="fa fa-cloud-upload font-medium-5"><span className="hidden">1</span></i>
                                                                            </div>
                                                                            :
                                                                            <div className="text-xs-left text-danger">
                                                                                <i className="fa fa-cloud-download font-medium-5"><span className="hidden">0</span></i>
                                                                            </div>
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group">
                                                                        <button type="button" className="btn btn-icon btn-info btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i className="fa fa-bars font-small-1" /></button>
                                                                        <div className="dropdown-menu">
                                                                            <Link to={{ pathname: '/Layout/EditPortalUser', state: { userId: portalUser.UserId } }} className="dropdown-item">Edit</Link>
                                                                        </div>
                                                                    </div>
                                                                </td>
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
