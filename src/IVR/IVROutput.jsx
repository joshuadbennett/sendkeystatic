let schema = {
    "title": "IVR Output",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "Type": {
            "type": "string",
            "title": "Type",
            "description": "Select the type"
        },
        "Message": {
            "type": "string",
            "title": "OptionText",
            "description": "Enter the message"
        },
        "Voice": {
            "type": "string",
            "title": "OptionText",
            "description": "Select the voice"
        },
        "Language": {
            "type": "string",
            "title": "Language",
            "description": "Select the language"
        },
        "AudioBytes": {
            "type": "string",
            "title": "AudioBytes",
            "description": "Enter the base64 encoded byte string"
        },
        "AudioUrl": {
            "type": "string",
            "title": "AudioUrl",
            "description": "Enter the url"
        },
        "AudioMimeType": {
            "type": "string",
            "title": "AudioMimeType",
            "description": "Enter the MIME type"
        }
    }
};

let uiSchema = {

};

let formData = {

};

const IVROutput = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};
//console.log("IVROutput = ", IVROutput);

export default IVROutput;