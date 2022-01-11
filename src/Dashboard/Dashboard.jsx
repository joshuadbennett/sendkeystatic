import React from 'react';
import ContentPane from '../Layout/ContentPane.jsx';
import axios from 'axios'
import Configuration from '../Utils/config';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import Formatting from '../Components/Formatting.jsx';
import ConsoleActivity from '../Components/ConsoleActivity.jsx';
import DynamicDashboardChart from '../Components/DynamicDashboardChart.jsx';

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            StoreDetails: [],
            Logs: [],
            dataServerStatus: {},
            dataErrors: [],
            dataErrorLevels: [],
            dataErrorTypes: [],
            dataErrorsByDate: [],
            loading: true,

            TotalAccountsActive: "",
            TotalAssociatedNumbers: "",
            TotalTransactions: "",
            ErrorRate: "",
            receivedData: false
        }
        this.formatting = new Formatting();
    }

    async componentDidMount() {
        this.GetDashboardData();
        this.timer = setInterval(this.tick.bind(this), 60000);
    }

    componentWillUnmount () {
        clearInterval(this.timer);
    }

    GetDashboardData() {
        var apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Dashboard/')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                let data = JSON.parse(response.data);
                //console.log("dashboard data = ", data);
                this.setState({
                    TotalAccountsActive: data.TotalAccountsActive,
                    TotalAssociatedNumbers: data.TotalAssociatedNumbers,
                    TotalTransactions: data.TotalTransactions,
                    ErrorRate: data.ErrorRate,
                    receivedData: true
                });
            })
            .catch((error) => {
                console.log("error", error);
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                this.setState({
                    receivedData: true
                });
            });
    }

    tick() {
        this.GetDashboardData();
    }

    render() {
        if (this.state.receivedData) {
           return (
                <ContentPane>
                    <section id="icon-section">
                        <div className="row">
                            <div className="col-xl-3 col-lg-6 col-xs-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="media">
                                            <div className="p-2 text-center bg-success bg-darken-4 media-left media-middle">
                                                <i className="ft-server font-large-2 white"></i>
                                            </div>
                                            <div className="p-2 media-body">
                                                <h5>Transactions (Last 45 days)</h5>
                                                <h5 className="text-bold-400"><i className="ft-activity"></i>  {this.state.TotalTransactions}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-6 col-xs-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="media">
                                            <div className="p-2 text-center bg-red bg-darken-2 media-left media-middle">
                                                <i className="ft-user-plus font-large-2 white"></i>
                                            </div>
                                            <div className="p-2 media-body">
                                                <h5>Total Associated Numbers</h5>
                                                <h5 className="text-bold-400"><i className="ft-users"></i>  {this.state.TotalAssociatedNumbers}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-6 col-xs-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="media">
                                            <div className="p-2 text-center bg-primary bg-darken-2 media-left media-middle">
                                                <i className="icon-user font-large-2 white"></i>
                                            </div>
                                            <div className="p-2 media-body">
                                                <h5>Total Active Accounts</h5>
                                                <h5 className="text-bold-400"><i className="ft-users"></i>  {this.state.TotalAccountsActive}</h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-3 col-lg-6 col-xs-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="media">
                                            <div className="p-2 text-center bg-blue bg-darken-4 media-left media-middle">
                                                <i className="ft-target font-large-2 white"></i>
                                            </div>
                                            <div className="p-2 media-body">
                                               <h5>Error Rate (Last 45 days)</h5>
                                               <h5 className="text-bold-400"> {this.formatting.formatDecimal(this.state.ErrorRate * 100, 1)}<i className="ft-percent"></i></h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            </div>
                            <div className="row">
                            <div className="col-xl-7 col-lg-8 col-xs-12">
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title">Transactions</h4>
                                    </div>
                                    <div className="card-content px-1">
                                        <DynamicDashboardChart />
                                    </div>
                                </div>
                            </div>
                           
                            <div className="col-xl-5 col-lg-4">
                                <div className="card">
                                    <div className="card-header">
                                        <h4 className="card-title">Console Activity</h4>
                                    </div>
                                    <div className="card-content px-1">
                                        <ConsoleActivity />
                                    </div>
                                </div>
                            </div>
                       </div>
                    </section>
                </ContentPane>
            )
        } else {
            return (
                <ContentPane>
                    <section>
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Dashboard</h2>
                            </div>
                            <div className="row">
                                <div className="col-xl-12 col-lg-12 col-xs-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="card-block offset-lg-5 offset-md-5">
                                                <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </ContentPane>
            )
        }
    }
}
