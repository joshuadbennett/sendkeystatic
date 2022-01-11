import IVRMenuOption from '../IVR/IVRMenuOption.jsx';

let schema = {
    "title": "IVR Menu",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "LanguageCode": {
            "type": "string",
            "title": "LanguageCode"
        },
        "Voice": {
            "type": "string",
            "title": "Voice"
        },
        "ErrorText": {
            "type": "string",
            "title": "ErrorText"
        },
        "Greeting": {
            "type": "string",
            "title": "Greeting"
        },
        "Prefix": {
            "type": "string",
            "title": "Prefix"
        },
        "SpeechOptionPrefix": {
            "type": "string",
            "title": "SpeechOptionPrefix"
        },
        "MenuUrl": {
            "type": "string",
            "title": "MenuUrl"
        },
        "MenuActionUrl": {
            "type": "string",
            "title": "MenuActionUrl"
        },
        "IsActive": {
            "type": "boolean",
            "title": "IsActive"
        },
        "MenuOptions": {
            "type": "array",
            "title": "MenuOptions",
            "items": {
                "type": "object",
                "required": [
                    "title"
                ],
                "properties": IVRMenuOption.Schema.properties
            }
        }
    }
};

let uiSchema = {

};

let formData = {

};

const IVRMenuInfo = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRMenuInfo;