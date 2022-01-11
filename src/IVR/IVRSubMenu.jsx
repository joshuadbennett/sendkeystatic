import IVROutput from '../IVR/IVROutput.jsx';
//import IVRMenuInfo from '../IVR/IVRMenuInfo.jsx';

let schema = {
    "title": "IVR Sub Menu",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "PreviousMenuPressOption": {
            "type": "string",
            "title": "PreviousMenuPressOption",
            "description": "Enter a DTMF (keypad) press option"
        },
        "PreviousMenuSpeechOption": {
            "type": "string",
            "title": "PreviousMenuSpeechOption",
            "description": "Enter a word or phrase speech option"
        },
        "PreviousMenuOptionOutput": {
            "type": "object",
            "title": "PreviousMenuOptionOutput",
            "description": "Configure output",
            "properties": IVROutput.Schema.properties
        }/*,
        "PreviousMenuOptionText": {
            "type": "string",
            "title": "PreviousMenuOptionText",
            "description": "Enter the option text",
            "properties": IVRTransfer.Schema.properties
        }*///,
        //...IVRMenuInfo.Schema.properties
    }
};

let uiSchema = {

};

let formData = {

};

const IVRSubMenu = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRSubMenu;