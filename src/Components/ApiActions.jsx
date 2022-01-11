import axios from 'axios';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';
//import SweetAlert from 'react-bootstrap-sweetalert';

export default class ApiActions {
    performPost(apiBaseUrl, route, action, payload, subject, verb, callback) {
        let result = {};
        axios.post(apiBaseUrl + route + action, payload)
            .then((response) => {
                if (response.status === 401) {
                    //this.handleError("", response.statusText);
                    result = { type: "unauthorized", response: response, subject: subject, verb: verb };
                }
                else if (response.status === 204 || response.status === 200) {
                    console.log(subject + " " + verb + " Successful!");
                    SetAuthorizationToken(response.headers.token);
                    //this.handleSuccess(subject, verb);
                    result = { type: "success", response: response, subject: subject, verb: verb };
                }
                else {
                    console.log("Failed to " + verb.toLocaleLowerCase() + " " + subject.toLocaleLowerCase());
                    let responseMessage = this.getResponseMessage(response);
                    //this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", responseMessage);
                    result = { type: "failure", response: response, subject: subject, verb: verb, responseMessage: responseMessage };
                }
                if (callback != null) {
                    callback(result);
                }
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                let errorMessage = this.getErrorMessage(error);
                //this.handleError(subject + " " + verb + " failed", errorMessage);
                console.log("error", error);
                result = { type: "error", response: error, subject: subject, verb: verb, errorMessage: errorMessage };
                if (callback != null) {
                    callback(result);
                }
            });
    }

    performGet(apiBaseUrl, route, action, payload, subject, verb, callback) {
        let result = {};
        axios.get(apiBaseUrl + route + action, payload)
            .then((response) => {
                if (response.status === 401) {
                    //this.handleError("", response.statusText);
                    result = { type: "unauthorized", response: response, subject: subject, verb: verb };
                }
                else if (response.status === 204 || response.status === 200) {
                    console.log(subject + " " + verb + " Successful!");
                    SetAuthorizationToken(response.headers.token);
                    //this.handleSuccess(subject, verb);
                    result = { type: "success", response: response, subject: subject, verb: verb };
                }
                else {
                    console.log("Failed to " + verb.toLocaleLowerCase() + " " + subject.toLocaleLowerCase());
                    let responseMessage = this.getResponseMessage(response);
                    //this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", responseMessage);
                    result = { type: "failure", response: response, subject: subject, verb: verb, responseMessage: responseMessage };
                }
                if (callback != null) {
                    callback(result);
                }
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                let errorMessage = this.getErrorMessage(error);
                //this.handleError(subject + " " + verb + " failed", errorMessage);
                console.log("error", error);
                result = { type: "error", response: error, subject: subject, verb: verb, errorMessage: errorMessage };
                if (callback != null) {
                    callback(result);
                }
            });
    }
    /*
    handleThen = (response) => {
                if (response.status === 401) {
                    //this.handleError("", response.statusText);
                    let result = { type: "unauthorized", response: response, subject: subject, verb: verb };
                    return result;
                }
                else if (response.status === 204 || response.status === 200) {
                    console.log(subject + " " + verb + " Successful!");
                    SetAuthorizationToken(response.headers.token);
                    //this.handleSuccess(subject, verb);
                    if (callback != null) {
                        callback(response);
                    }
                    let result = { type: "success", response: response, subject: subject, verb: verb };
                    return result;
                }
                else {
                    console.log("Failed to " + verb.toLocaleLowerCase() + " " + subject.toLocaleLowerCase());
                    let responseMessage = this.getResponseMessage(response);
                    //this.handleError(subject + " " + verb.toLocaleLowerCase() + " failed", responseMessage);
                    let result = { type: "failure", response: response, subject: subject, verb: verb, responseMessage: responseMessage };
                    return result;
                }
    }

    handleCatch = (error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                let errorMessage = this.getErrorMessage(error);
                //this.handleError(subject + " " + verb + " failed", errorMessage);
                console.log("error", error);
                let result = { type: "error", response: error, subject: subject, verb: verb, errorMessage: errorMessage };
                return result;
    }
    */
    getResponseMessage(response) {
        var responseMessage = "No response";
        //console.log("default: ", responseMessage);
        if (response != null) {
            responseMessage = "Response received";
            //console.log("response: ", responseMessage);
            if (response.statusText != null) {
                responseMessage = response.statusText;
                //console.log("response.statusText: ", responseMessage);
            }
            if (response.data != null) {
                responseMessage = response.data;
                //console.log("response.data: ", responseMessage);
            }
            else if (response.status != null) {
                let category = ((response.status + 99) / 100) * 100;
                //console.log(category);
                switch (category) {
                    case 200:
                        responseMessage = "Success";
                        break;
                    case 300:
                        responseMessage = "Client error";
                        break;
                    case 400:
                        responseMessage = "Server error";
                        break;
                    default:
                        break;
                }
            }
        }
        //console.log(responseMessage);
        return responseMessage;
    }

    getErrorMessage(error) {
        var errorMessage = "Request Error";
        //console.log("default: ", errorMessage);
        if (error != null) {
            errorMessage = error.toString();
            //console.log("error: ", errorMessage);
            if (error.message != null) {
                errorMessage = error.message;
                //console.log("error.message: ", errorMessage);
            }
            if (error.response != null) {
                errorMessage = error.response;
                //console.log("error.response: ", errorMessage);
                if (error.response.statusText != null) {
                    errorMessage = error.response.statusText;
                    //console.log("error.response.statusText: ", errorMessage);
                }
                if (error.response.data != null) {
                    errorMessage = error.response.data;
                    //console.log("error.response.data: ", errorMessage);
                }
                //console.log(error.response.status);
                switch (error.response.status) {
                    case 401:
                        // 401 specific message
                        break;
                    case 504:
                        localStorage.removeItem('token');
                        //this.props.history.push("/Login");
                        break;
                    default:
                        break;
                }
            }
        }
        //console.log(errorMessage);
        return errorMessage;
    }
}