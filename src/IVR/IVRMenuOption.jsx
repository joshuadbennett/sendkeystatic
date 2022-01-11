import IVROutput from '../IVR/IVROutput.jsx';
import IVRAction from '../IVR/IVRAction.jsx';

let schema = {
    "title": "IVR Menu Option",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "PressOption": {
            "type": "string",
            "title": "PressOption",
            "description": "Enter a DTMF (keypad) press option"
        },
        "SpeechOption": {
            "type": "string",
            "title": "SpeechOption",
            "description": "Enter a word or phrase speech option"
        },
        "OptionOutput": {
            "type": "object",
            "title": "OptionOutput",
            "description": "Configure output",
            "properties": IVROutput.Schema.properties
        }/*,
        "OptionText": {
            "type": "string",
            "title": "OptionText",
            "description": "Enter the text"
        }*/,
        "Action": {
            "type": "object",
            "title": "Action",
            "description": "Configure action",
            "properties": IVRAction.Schema.properties
        }
    }
};

let uiSchema = {

};

let formData = {

};

const IVRMenuOption = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRMenuOption;