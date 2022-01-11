import IVROutput from '../IVR/IVROutput.jsx';

let schema = {
    "title": "IVR Extension",
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
        }
    }
};

let uiSchema = {

};

let formData = {

};

const IVRExtension = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRExtension;