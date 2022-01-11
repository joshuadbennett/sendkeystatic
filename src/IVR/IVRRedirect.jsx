import IVROutput from '../IVR/IVROutput.jsx';

let schema = {
    "title": "IVR Redirect",
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
        "Url": {
            "type": "string",
            "title": "Url",
            "description": "Enter the url of the next set of instructions."
        }
    }
};

let uiSchema = {

};

let formData = {

};

const IVRRedirect = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRRedirect;