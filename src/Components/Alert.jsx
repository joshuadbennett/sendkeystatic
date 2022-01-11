import React from 'react';

export default class Alert extends React.Component {
    render() {
        
        let alertComponent = null;

        if (this.props.AlertType === 'success') {
            alertComponent = <div className="alert bg-success alert-icon-left alert-dismissible fade in mb-2" role="alert">
                <strong>{this.props.AlertMessage}</strong>
            </div> ;
        } 

        if (this.props.AlertType === 'warning') {
            alertComponent = <div className="alert bg-warning alert-icon-left alert-dismissible fade in mb-2" role="alert">
                <strong>{this.props.AlertMessage}</strong>
            </div>;
        } 

        if (this.props.AlertType === 'info') {
            alertComponent = <div className="alert bg-info alert-icon-left alert-dismissible fade in mb-2" role="alert">
                <strong>{this.props.AlertMessage}</strong>
            </div>;
        } 

        if (this.props.AlertType === 'primary') {
            alertComponent = <div className="alert bg-primary alert-icon-left alert-dismissible fade in mb-2" role="alert">
                <strong>{this.props.AlertMessage}</strong>
            </div>;
        } 

        if (this.props.AlertType === 'danger') {
            alertComponent = <div className="alert bg-danger alert-icon-left alert-dismissible fade in mb-2" role="alert">
                <strong>{this.props.AlertMessage}</strong>
            </div>;
        } 

        return (
            <section>
                {this.props.AlertMessage !== '' ?
                    alertComponent
                : null}
               </section>
        )
    }
}
