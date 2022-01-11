import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route } from 'react-router-dom';
import SetAuthorizationToken from './Utils/setAuthorizationToken';
import Layout from './Layout/Layout.jsx';
import './index.css';
import Login from './Login/Login.jsx';
import Register from './Register/Register.jsx';
import Profile from './User/Profile.jsx';
import Settings from './User/Settings.jsx';
import Dashboard from './Dashboard/Dashboard.jsx';
import ForgotPassword from './ForgotPassword/ForgotPassword.jsx';
import Accounts from './Account/Accounts.jsx';
import AccountDetails from './Account/AccountDetails.jsx';
import AddUpdateAccount from './Account/AddUpdateAccount.jsx';
import Associations from './Account/Associations.jsx';
import AssociationDetails from './Account/AssociationDetails.jsx';
import EmergencyCodes from './EmergencyAlert/EmergencyCodes.jsx';
import AddUpdateEmergencyCode from './EmergencyAlert/AddUpdateEmergencyCode.jsx';
import EmergencyContacts from './EmergencyAlert/EmergencyContacts.jsx';
import AddUpdateEmergencyContact from './EmergencyAlert/AddUpdateEmergencyContact.jsx';
import Rates from './Rate/Rates.jsx';
import AddUpdateRate from './Rate/AddUpdateRate.jsx';
import Transactions from './Transaction/Transactions.jsx';
import TransactionsReport from './Transaction/TransactionsReport.jsx';
import TransactionDetails from './Transaction/TransactionDetails.jsx';
import PortalUsers from './PortalUsers/PortalUsers.jsx';
import EditPortalUser from './PortalUsers/EditPortalUser.jsx';
import ActivityLog from './ActivityLog/ActivityLog.jsx';
import FunctionalTest from './Account/FunctionalTest.jsx';
import MigrateCredentials from './Account/MigrateCredentials.jsx';
import Testing from './Testing/Testing.jsx';
import IVRGenerator from './Testing/IVRGenerator.jsx';
import AddressInputList from './Components/AddressInputList.jsx';

if (localStorage.token) {
    SetAuthorizationToken(localStorage.token);
} 

ReactDOM.render((
    <HashRouter>
        <switch>
            <Route exact path="/" component={Login} />
            <Route path="/Login" component={Login} />
            
            <Route path="/ForgotPassword" component={ForgotPassword} />

            <Route path="/Layout" component={Layout} />
            <Route path="/Layout/Register" component={Register} />
            <Route path="/Layout/Profile" component={Profile} />
            <Route path="/Layout/Settings" component={Settings} />
            <Route path="/Layout/PortalUsers" component={PortalUsers} />
            <Route path="/Layout/EditPortalUser" component={EditPortalUser} />
            <Route path="/Layout/Dashboard" component={Dashboard} />
            <Route path="/Layout/Accounts" component={Accounts} />
            <Route path="/Layout/AccountDetails" component={AccountDetails} />
            <Route path="/Layout/AddUpdateAccount" component={AddUpdateAccount} />
            <Route path="/Layout/Associations" component={Associations} />
            <Route path="/Layout/AssociationDetails" component={AssociationDetails} />
            <Route path="/Layout/EmergencyCodes" component={EmergencyCodes} />
            <Route path="/Layout/AddUpdateEmergencyCode" component={AddUpdateEmergencyCode} />
            <Route path="/Layout/EmergencyContacts" component={EmergencyContacts} />
            <Route path="/Layout/AddUpdateEmergencyContact" component={AddUpdateEmergencyContact} />
            <Route path="/Layout/Rates" component={Rates} />
            <Route path="/Layout/AddUpdateRate" component={AddUpdateRate} />
            <Route path="/Layout/Transactions" component={Transactions} />
            <Route path="/Layout/TransactionsReport" component={TransactionsReport} />
            <Route path="/Layout/TransactionDetails" component={TransactionDetails} />
            <Route path="/Layout/ActivityLog" component={ActivityLog} />
            <Route path="/Layout/FunctionalTest" component={FunctionalTest} />
            <Route path="/Layout/MigrateCredentials" component={MigrateCredentials} />
            <Route path="/Layout/Testing" component={Testing} />
            <Route path="/Layout/IVRGenerator" component={IVRGenerator} />
            <Route path="/Layout/AddressInputList" component={AddressInputList} />
        </switch>
    </HashRouter>
), document.getElementById('root'));