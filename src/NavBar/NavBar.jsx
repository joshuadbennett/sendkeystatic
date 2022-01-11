import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';

class NavBar extends Component {
    render() {
        var dashboardOpen = false, ratesOpen = false, accountsOpen = false, associationsOpen = false, transactionsOpen = false, billingOpen = false, activityLogOpen = false, testingOpen = false/*, ivrGeneratorOpen = false*/;
        switch (this.props.location.pathname) {
            case "/Layout/Dashboard":
                dashboardOpen = true;
                break;
            case "/Layout/Rates":
            case "/Layout/AddUpdateRate":
                ratesOpen = true;
                break;
            case "/Layout/Accounts":
            case "/Layout/AccountDetails":
            case "/Layout/AddUpdateAccount":
                accountsOpen = true;
                break;
            case "/Layout/Associations":
            case "/Layout/AssociationDetails":
                associationsOpen = true;
                break;
            case "/Layout/Transactions":
            case "/Layout/TransactionDetails":
                transactionsOpen = true;
                break;
            case "/Layout/TransactionsReport":
                billingOpen = true;
                break;
            case "/Layout/ActivityLog":
                activityLogOpen = true;
                break;
            case "/Layout/Testing":
                testingOpen = true;
                break;
            /*
            case "/Layout/IVRGenerator":
                ivrGeneratorOpen = true;
                break;
            */
            default:
                break;
        };

        return (
            <div data-scroll-to-active="false" className="main-menu menu-fixed menu-light menu-accordion">
                <div className="main-menu-content">
                    <ul id="main-menu-navigation" data-menu="menu-navigation" className="navigation navigation-main">
                        <li className={" nav-item " + (dashboardOpen ? "open " : "")}><Link to="/Layout/Dashboard"><i className="ft-home" /><span data-i18n className="menu-title">Dashboard</span></Link>
                        </li>
                        <li className={" nav-item " + (ratesOpen ? "open " : "")}><Link to="/Layout/Rates"><i className="ft-percent" /><span data-i18n className="menu-title">Rates</span></Link>
                        </li>
                        <li className={" nav-item " + (accountsOpen ? "open " : "")}><Link to="/Layout/Accounts"><i className="ft-monitor" /><span data-i18n className="menu-title">Accounts</span></Link>
                        </li>
                        <li className={" nav-item " + (associationsOpen ? "open " : "")}><Link to="/Layout/Associations"><i className="ft-link" /><span data-i18n className="menu-title">Associations</span></Link>
                        </li>
                        <li className={" nav-item " + (transactionsOpen ? "open " : "")}><Link to="/Layout/Transactions"><i className="ft-edit" /><span data-i18n className="menu-title">Transactions</span></Link>
                        </li>
                        <li className={" nav-item " + (billingOpen ? "open " : "")}><Link to="/Layout/TransactionsReport"><i className="ft-credit-card" /><span data-i18n className="menu-title">Billing</span></Link>
                        </li>
                        <li className={" nav-item " + (activityLogOpen ? "open " : "")}><Link to="/Layout/ActivityLog"><i className="ft-activity" /><span data-i18n className="menu-title">Activity Log</span></Link>
                        </li>
                        <li className={" nav-item " + (testingOpen ? "open " : "")}><Link to="/Layout/Testing"><i className="ft-eye" /><span data-i18n className="menu-title">Testing</span></Link>
                        </li>
                        {/* hide until ready/needed
                        <li className={" nav-item " + (ivrGeneratorOpen ? "open " : "")}><Link to="/Layout/IVRGenerator"><i className="ft-box" /><span data-i18n className="menu-title">IVRGenerator</span></Link>
                        </li>
                        */}
                    </ul>
                </div>
            </div>
        );
    }
}
export default withRouter(NavBar);