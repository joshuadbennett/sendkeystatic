import React from 'react';

//const RUNNING = "Running";
const NA = "N/A";
const UNDETERMINED = "Undetermined";
const SUCCESS = "Active";
const FAILURE = "Error";
const UNKNOWN = "Unknown";

export default class AssociationStatus {
    isError = (assoc) => {
        if (assoc == null) return true;
        return (assoc.WebhookStatus === FAILURE || assoc.WebhookAuthStatus === FAILURE);
    }

    getIcon = (status) => {
        switch (status) {
            case NA:
                return (
                    <span>{NA}</span>
                );
            case UNDETERMINED:
                return (
                    <i className="text-warning fa fa-question-circle font-medium-5"><span className="hidden">{UNDETERMINED}</span></i>
                );
            case SUCCESS:
                return (
                    <i className="text-success fa fa-check-circle font-medium-5"><span className="hidden">{SUCCESS}</span></i>
                );
            case FAILURE:
                return (
                    <i className="text-danger fa fa-exclamation-circle font-medium-5"><span className="hidden">{FAILURE}</span></i>
                );
            default:
                return (
                    <span>{UNKNOWN}</span>
                );
        }
    }

    getIconElement = (status) => {
        switch (status) {
            case NA:
                return (
                    <span>{NA}</span>
                );
            case UNDETERMINED:
                return (
                    <div className="text-xs-left text-warning">
                        <i className="fa fa-question-circle font-medium-5"><span className="hidden">-1</span></i>
                    </div>
                );
            case SUCCESS:
                return (
                    <div className="text-xs-left text-success">
                        <i className="fa fa-check-circle font-medium-5"><span className="hidden">1</span></i>
                    </div>
                );
            case FAILURE:
                return (
                    <div className="text-xs-left text-danger">
                        <i className="fa fa-exclamation-circle font-medium-5"><span className="hidden">0</span></i>
                    </div>
                );
            default:
                return (
                    <span>{UNKNOWN}</span>
                );
        }
    }
}
