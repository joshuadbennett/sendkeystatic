let schema = {
    "title": "IVR Transfer",
    "type": "object",
    "required": [
        "title"
    ],
    "properties": {
        "Number": {
            "type": "string",
            "title": "Number",
            "description": "The number to call."
        },
        "Extension": {
            "type": "string",
            "title": "Extension",
            "description": "If provided, the digits to dial after the call has connected."
        },
        "CallbackUrl": {
            "type": "string",
            "title": "CallbackUrl",
            "description": "If provided, call flow is directed here after the call is finished."
        },
        "Timeout": {
            "type": "int",
            "title": "Timeout",
            "description": "The number of seconds to wait before the attempt to connect is stopped. Must be > 0."
        }
    }
};

let uiSchema = {

};

let formData = {

};

const IVRTransfer = {
    Schema: schema,
    UISchema: uiSchema,
    FormData: formData
};

export default IVRTransfer;