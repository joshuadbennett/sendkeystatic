import IVRSubMenu from '../IVR/IVRSubMenu.jsx';
import IVRRedirect from '../IVR/IVRRedirect.jsx';
import IVRExtension from '../IVR/IVRExtension.jsx';
import IVRTransfer from '../IVR/IVRTransfer.jsx';
import IVROutput from '../IVR/IVROutput.jsx';
import IVRInput from '../IVR/IVRInput.jsx';

let schema = {
    "title": "IVR Action",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "Menu": {
            "type": "object",
            "title": "Menu",
            "description": "Configure sub menu",
            "properties": IVRSubMenu.Schema.properties
        },
        "Redirect": {
            "type": "object",
            "title": "Redirect",
            "description": "Configure redirect",
            "properties": IVRRedirect.Schema.properties
        },
        "Extension": {
            "type": "object",
            "title": "Extension",
            "description": "Configure extension",
            "properties": IVRExtension.Schema.properties
        },
        "Transfer": {
            "type": "object",
            "title": "Transfer",
            "description": "Configure transfer",
            "properties": IVRTransfer.Schema.properties
        },
        "Output": {
            "type": "object",
            "title": "Output",
            "description": "Configure output",
            "properties": IVROutput.Schema.properties
        },
        "Input": {
            "type": "object",
            "title": "Input",
            "description": "Configure input",
            "properties": IVRInput.Schema.properties
        },
        "CallbackUrl": {
            "type": "string",
            "title": "CallbackUrl",
            "description": "Enter a url to override the default of returning to the current menu"
        }
    }
};

let uiSchema = {

};

let formData = {

};

let IVRAction = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};
//console.log("IVRAction = ", IVRAction);

export default IVRAction;