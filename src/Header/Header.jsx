import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios'
import Configuration from '../Utils/config';
import '../App.css';
import decode from 'jwt-decode';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
import $ from 'jquery';
//import 'ms-signalr-client';
import { ToastContainer, ToastMessage, } from 'react-toastr';

const ToastMessageFactory = React.createFactory(ToastMessage.animation);

class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            UserName: '',
            type: '',
            notifications: []
        }
    }

    componentDidMount() {
        if (localStorage.token) {
            let that = this;
            let decoded = decode(localStorage.token);
            this.setState({
                UserName: decoded.username
            });
            let apiBaseUrl = Configuration().apiUrl;
            axios.get(apiBaseUrl + 'api/ActivityLogs/GetUnreadNotifications')
                .then((response) => {
                    this.setState({
                        notifications: JSON.parse(response.data)
                    });
                })
                .catch((error) => {
                    if (error != null && error.response != null && error.response.status === 504) {
                        localStorage.removeItem('token');
                        that.props.history.push("/Login");
                    }
                    console.log("error in GetUnreadNotifications", error)
                });

            SetAuthorizationToken(localStorage.token);
            /*
            this.hubConnection = window["jQuery"].hubConnection(Configuration().apiUrl);
            var connection = this.hubConnection;
            connection.qs = { 'userId': decoded.userid };
            var proxy = connection.createHubProxy('messagingHub');

            // receives broadcast messages from a hub function, called "broadcastMessage"
            proxy.on('broadcastMessage', function (message) {
                console.log(message);
            });

            // receives broadcast messages from a hub function, called "broadcastMessage"
            proxy.on('newMessageReceived', function (message) {
                that.handleNewMessage(JSON.parse(message));
            });

            // atempt connection, and handle errors
            connection.start()
                .done(function () { console.log('Connected to Messaging Hub, connection ID=' + connection.id); })
                .fail(function () { console.log('Could not connect to Messaging Hub'); });
            */
        }
        else {
            this.props.history.push('/Login');
        }
        this._mounted = true;
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    addAlert = (data) => {
        if (this.refs.container != null) {
            switch (data.type) {
                case "success": return (this.refs.container.success(data.message, `Success!`, {
                    closeButton: true
                }))
                case "danger": return (this.refs.container.error(data.message, `Action Needed!`, {
                    closeButton: true
                }))
                case "warning": return (this.refs.container.warning(data.message, `Warning!`, {
                    closeButton: true
                }))
                case "info": return (this.refs.container.info(data.message, `Info`, {
                    closeButton: true
                }))
                case "ERROR": return (this.refs.container.error(data.message, `Action Needed!`, {
                    closeButton: true
                }))
                case "WARN": return (this.refs.container.warning(data.message, `Warning!`, {
                    closeButton: true
                }))
                case "INFO": return (this.refs.container.info(data.message, `Info`, {
                    closeButton: true
                }))
                default: break;
            }
        }
    }

    clearAlert = () => {
        //this.refs.container.clear();
    }

    handleNewMessage = (data) => {
        if (this._mounted) {
            var formattedData = this.handleMessage(data, true);
            this.addAlert(formattedData);
        }
    }

    handleMessage = (data, isNew) => {
        //create a unlike key for each new notifcation item
        let timestamp = (new Date()).getTime();

        let type;
        switch (data.LogLevel) {
            case "ERROR": type = "danger"; break;
            case "WARN": type = "warning"; break;
            case "INFO": type = "info"; break;
            default: break;
        }

        let formattedData = JSON.parse("{ \"type\":\"" + type + "\",\"message\":\"" + data.LogMessage + "\" }");

        // update the state object
        let notifications = this.state.notifications;
        if (isNew) {
            notifications.unshift(data);
        }
        else {
            notifications[timestamp] = data;
        }

        // set the state
        this.setState({
            type: type,
            notifications: notifications
        });

        return formattedData;
    }

    handleMessageAcknowledge = (key) => {
        let payload = this.state.notifications[key];
        //console.log(payload);
        let apiBaseUrl = Configuration().apiUrl;
        //let that = this;
        axios.post(apiBaseUrl + 'api/ActivityLogs/SetIsRead', payload)
            .then((response) => {
                if (response.status === 401) {
                    console.log(response.statusText);
                }
                else if (response.status === 204) {
                    console.log("Activity Log updated successfully.");
                }
                else {
                    console.log("Activity Log does not exist.");
                }
                delete this.state.notifications[key];
                this.setState({ notifications: this.state.notifications });
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error);
            });
        $(".dropdown.dropdown-notification.nav-item").addClass("open");
    }

    acknowledgeAllMessages = () => {
        let payload = this.state.notifications;
        let apiBaseUrl = Configuration().apiUrl;
        //let that = this;
        axios.post(apiBaseUrl + 'api/ActivityLogs/SetAllRead', payload)
            .then((response) => {
                if (response.status === 401) {
                    console.log(response.statusText);
                }
                else if (response.status === 204) {
                    console.log("Activity Log updated successfully.");
                }
                else {
                    console.log("Activity Log does not exist.");
                }
                let notifications = this.state.notifications;
                notifications.length = 0;
                this.setState({ notifications: notifications });
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                console.log("error", error);
            });
    }

    getNotificationAge = (key) => {
        let logDate = new Date();
        if (this.state.notifications[key].LogDate !== "undefined") {
            logDate = new Date(this.state.notifications[key].LogDate);
        }
        else if (this.state.notifications[key].data.LogDate !== "undefined") {
            logDate = new Date(this.state.notifications[key].data.LogDate);
        }
        else {
            console.log(key + ": no LogDate found!");
            return;
        }
        let current = new Date();
        let miliseconds = current - logDate;
        let seconds = Math.round(miliseconds / 1000);
        let minutes = Math.round(seconds / 60);
        let hours = Math.round(minutes / 60);
        let days = Math.round(hours / 24);
        let age = "";

        if (days > 0) {
            age = days.toString() + " Day" + (days === 1 ? "" : "s");
        }
        else if (hours > 0) {
            age = hours.toString() + " Hour" + (hours === 1 ? "" : "s");
        }
        else if (minutes > 0) {
            age = minutes.toString() + " Minute" + (minutes === 1 ? "" : "s");
        }
        else if (seconds > 0) {
            age = seconds.toString() + " Second" + (seconds === 1 ? "" : "s");
        }

        if (age === "") {
            age = "NOW";
        }
        else {
            age += " Ago";
        }

        return age + " on " + logDate.toLocaleString();
    }

    handleLogout = (event) => {
        this.setState({
            UserName: ''
        });
        this.props.history.push("/Login");
        localStorage.removeItem('token');
    }

    handleMenuClick = (event) => {
        $(".dropdown.nav-item.mega-dropdown").removeClass("open");
    }

    render() {
        const logoURL = process.env.PUBLIC_URL + "/app-assets/images/logo/logo.png";
        const logoFullURL = process.env.PUBLIC_URL + "/app-assets/images/logo/SendKeyFull.png";
        let n = 0, notyIconClass = "", notyTitle = "";
        return (
            <div>
                <ToastContainer toastMessageFactory={ToastMessageFactory} preventDuplicates={false} ref="container" className="toast-top-right" />

                <nav className="header-navbar navbar navbar-with-menu navbar-fixed-top navbar-light navbar-border">
                    <div className="navbar-wrapper">
                        <div className="navbar-header">
                            <ul className="nav navbar-nav">
                                <li className="nav-item mobile-menu hidden-md-up float-xs-left"><a href="" className="nav-link nav-menu-main menu-toggle hidden-xs"><i className="ft-menu font-large-1" /></a></li>
                                <li className="nav-item">
                                    <Link to="Dashboard" className="navbar-brand">
                                        <img alt="Sendkey logo" src={logoURL} className="brand-logo" />
                                        <h1 className="brand-text"><img alt="Sendkey logo" src={logoFullURL} className="brand-logo" /></h1>
                                    </Link>
                                </li>
                                <li className="nav-item hidden-md-up float-xs-right"><a data-toggle="collapse" data-target="#navbar-mobile" className="nav-link open-navbar-container"><i className="fa fa-ellipsis-v" /></a></li>
                            </ul>
                        </div>
                        <div className="navbar-container content container-fluid">
                            <div id="navbar-mobile" className="collapse navbar-toggleable-sm">
                                <ul className="nav navbar-nav">
                                    <li className="nav-item hidden-sm-down"><a href="" className="nav-link nav-menu-main menu-toggle hidden-xs"><i className="ft-menu" /></a></li>
                                    <li className="dropdown nav-item mega-dropdown"><a href="" data-toggle="dropdown" className="dropdown-toggle nav-link">Admin</a>
                                        <ul className="mega-dropdown-menu dropdown-menu row">

                                            <li className="col-md-3">
                                                <h6 className="dropdown-menu-header text-uppercase"><i className="fa fa-random" />Manage Sendkey Console</h6>
                                                <ul className="drilldown-menu">
                                                    <li className="menu-list">
                                                        <ul>
                                                            <li><Link to="Register" onClick={this.handleMenuClick.bind(this)} className="dropdown-item"><i className="ft-file" />Add Sendkey User</Link></li>
                                                            <li><Link to="PortalUsers" onClick={this.handleMenuClick.bind(this)} className="dropdown-item"><i className="ft-user-plus" />Sendkey User List</Link></li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                <ul className="nav navbar-nav float-xs-right">
                                    <li className="dropdown dropdown-notification nav-item"><a href="" data-toggle="dropdown" className="nav-link nav-link-label"><i className="ficon ft-bell" /><span className="tag tag-pill tag-default tag-danger tag-default tag-up">{Object.keys(this.state.notifications).length}</span></a>
                                        <ul className="dropdown-menu dropdown-menu-media dropdown-menu-right">
                                            <li className="dropdown-menu-header">
                                                <h6 className="dropdown-header m-0"><span className="grey darken-2">Notifications</span><span className="notification-tag tag tag-default tag-danger float-xs-right m-0">{Object.keys(this.state.notifications).length} New</span></h6>
                                            </li>
                                            <li className="list-group scrollable-container">
                                                {
                                                    Object.keys(this.state.notifications).map(function (key, index) {
                                                        switch (this.state.notifications[key].LogLevel) {
                                                            case "success":
                                                                notyIconClass = "ft-plus-square icon-bg-circle bg-cyan";
                                                                notyTitle = "Success!";
                                                                break;
                                                            case "ERROR":
                                                            case "danger":
                                                                notyIconClass = "ft-download-cloud icon-bg-circle bg-red bg-darken-1";
                                                                notyTitle = "Alert!";
                                                                break;
                                                            case "WARN":
                                                            case "warning":
                                                                notyIconClass = "ft-alert-triangle icon-bg-circle bg-yellow bg-darken-3";
                                                                notyTitle = "Warning ";
                                                                break;
                                                            case "INFO":
                                                            case "info":
                                                                notyIconClass = "ft-check-circle icon-bg-circle bg-cyan";
                                                                notyTitle = "";
                                                                break;
                                                            default:
                                                                break;
                                                        }
                                                        let notyBkgClass = n++ % 2 ? " bg-noty" : "";
                                                        return (
                                                            <a key={key} href="" className={"list-group-item" + notyBkgClass}>
                                                                <div className="media">
                                                                    <div className="media-left valign-middle"><i className={notyIconClass} /></div>
                                                                    <div className="media-body">
                                                                        {notyTitle !== "" ? <div></div> : <h6 className="media-heading">{notyTitle}</h6>}
                                                                        <p className="notification-text font-small-3 text-muted">{this.state.notifications[key].LogMessage}</p><small>
                                                                            <time className="media-meta text-muted">{this.getNotificationAge(key)}</time></small>
                                                                        <button className="dropdown-item" style={{ color: '#008c8f' }}onClick={(event) => this.handleMessageAcknowledge(key)} >Acknowledge</button>
                                                                    </div>
                                                                </div>
                                                            </a>
                                                        )
                                                    }.bind(this))
                                                }
                                            </li>
                                            <li className="dropdown-menu-footer">
                                                <a className="dropdown-item text-muted text-xs-center" onClick={(event) => this.acknowledgeAllMessages()} >Acknowledge All</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li className="dropdown dropdown-user nav-item"><a href="" data-toggle="dropdown" className="dropdown-toggle nav-link">
                                        <span className="user-name">{this.state.UserName}</span></a>
                                        <div className="dropdown-menu dropdown-menu-right">
                                            <Link to="Profile" className="dropdown-item"><i className="ft-user" />Edit Profile</Link>
                                            {/*<Link to="Settings" className="dropdown-item"><i className="ft-sliders" />Settings</Link>*/}
                                            <div className="dropdown-divider" />
                                            <a className="dropdown-item" onClick={(event) => this.handleLogout(event)} ><i className="ft-power" /> Logout</a>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>)
    }
}

export default withRouter(Header);
