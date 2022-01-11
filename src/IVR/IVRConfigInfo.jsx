import IVRLanguageMenuOption from '../IVR/IVRLanguageMenuOption.jsx';

let schema = {
    "title": "IVR Config",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "ErrorText": {
            "type": "string",
            "title": "ErrorText"
        },
        "ErrorUrl": {
            "type": "string",
            "title": "ErrorUrl"
        },
        "OperatorNumber": {
            "type": "string",
            "title": "OperatorNumber"
        },
        "ExtensionNumber": {
            "type": "string",
            "title": "ExtensionNumber"
        },
        "LanguageActionUrl": {
            "type": "string",
            "title": "LanguageActionUrl"
        },
        "IsActive": {
            "type": "boolean",
            "title": "IsActive"
        },
        "LanguageOptions": {
            "type": "array",
            "title": "LanguageOptions",
            "items": {
                "type": "object",
                "required": [
                    "title"
                ],
                "properties": IVRLanguageMenuOption.Schema.properties
            }
        }
    }
};

let uiSchema = {

};

let formData = {
    "title": "My IVR config",
    "ErrorText": "We're unable to connect you at this time, please try again later.",
    "IsActive": true
};

const IVRConfigInfo = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRConfigInfo;