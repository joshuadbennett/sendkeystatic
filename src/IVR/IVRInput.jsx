import IVROutput from '../IVR/IVROutput.jsx';
//import IVRAction from '../IVR/IVRAction.jsx';

//console.log("IVROutput = ", IVROutput);
//console.log("IVRAction = ", IVRAction);

let schema = {
    "title": "IVR Input",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "Output": {
            "type": "object",
            "title": "Output",
            "description": "Configure output",
            "properties": IVROutput.Schema.properties
        },
        "Type": {
            "type": "string",
            "title": "Type",
            "description": "The type of input accepted. Options are 'dtmf', 'speech', or 'dtmf speech'"
        },
        "Timeout": {
            "type": "int",
            "title": "Timeout",
            "description": "The number of seconds before input is no longer accepted. Must be > 0."
        },
        "MaxLength": {
            "type": "int",
            "title": "MaxLength",
            "description": "The maximum number of characters before input is no longer accepted."
        },
        "FinishOn": {
            "type": "string",
            "title": "FinishOn",
            "description": "Input is no longer accepted when this character is input. Must be 0-9, *, #, or an empty string. This character is not included in the input value."
        },
        "Hints": {
            "type": "string",
            "title": "Hints",
            "description": "A comma-delimited string of keywords and/or phrases that speech recognition will be looking for."
        },
        "ValueName": {
            "type": "string",
            "title": "ValueName",
            "description": "If provided, the input will not be stored in the VoiceInfo digits or speech field, instead it's stored in the session dictionary under the provided name."
        },
        "CallbackUrl": {
            "type": "string",
            "title": "CallbackUrl",
            "description": "If provided, call flow is directed here after input is finished."
        },
        "CallbackAction": {
            "type": "object",
            "title": "CallbackAction",
            "description": "If provided, this action is executed after input is finished.",
            "properties": []//IVRAction.Schema.properties
        }
    }
};

let uiSchema = {

};

let formData = {

};

let IVRInput = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};
//console.log("IVRInput = ", IVRInput);

export default IVRInput;