import IVROutput from '../IVR/IVROutput.jsx';

let schema = {
    "title": "IVR Language Menu Option",
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
        "Voice": {
            "type": "string",
            "title": "OptionText",
            "description": "Enter the text"
        },
        "LanguageCode": {
            "type": "string",
            "title": "LanguageCode",
            "description": "Select the language"
        }
    }
};

let uiSchema = {

};

let formData = {
    "title": "My IVR language option",
    "PressOption": "0-9, *, or #",
    "Voice": "man, woman, alice, or an Amazon Polly named voice (e.g. 'Polly.Salli')",
    "LanguageCode": "a supported language in SCP-47 format (e.g. 'en-US')"
};

const IVRLanguageMenuOption = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRLanguageMenuOption;