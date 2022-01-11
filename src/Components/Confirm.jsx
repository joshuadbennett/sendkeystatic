import React from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';

export default class Confirm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: this.props.show || false,
            editMode: this.props.editMode || false,
            subject: this.props.subject || "",
            verb: this.props.verb || "",
            callback: this.props.callback || null,
            magicWord: this.props.magicWord || this.props.action.toUpperCase(),
            dialog: null
        };
        //console.log(this.state);
        this.showDialog = this.showDialog.bind(this);
        this.receiveInput = this.receiveInput.bind(this);
        this.hideDialog = this.hideDialog.bind(this);
    }

    componentDidMount() {
        //console.log("mounted");
        if (this.state.show) {
            this.showDialog();
        }
    }

    componentWillUnmount() {
        //console.log("unmounting ...");
        this.setState({
            callback: null,
            dialog: null
        });
    }

    showDialog() {
        let editMode = this.state.editMode;
        let subject = this.state.subject;
        let verb = this.state.verb;
        let magicWord = this.state.magicWord;
        let callback = this.state.callback;
        let note = editMode ? "This will update the selected " + subject.toLocaleLowerCase() + ".\n\n" : "";
        let text = note + "To stop, click Cancel. To continue, type '" + magicWord + "' and click OK."
        this.setState({
            dialog: (
                <SweetAlert
                    input
                    showCancel
                    cancelBtnBsStyle="default"
                    confirmBtnBsStyle="danger"
                    title="Are you sure?"
                    placeholder="Confirmation Text"
                    onConfirm={(e) => this.receiveInput(e, magicWord, subject, verb)}
                    onCancel={this.hideDialog}
                >
                    {text}
                </SweetAlert>
            )
        });
    }

    receiveInput(text, magicWord, subject, verb) {
        //console.log(text, magicWord, subject, verb);
        if (text === magicWord) {
            let callback = this.state.callback;
            //console.log("callback = ", callback);
            if (callback != null) {
                //callback();
            }
            this.hideDialog();
        } else {
            this.setState({
                dialog: (
                    <SweetAlert danger title={verb + " cancelled"} onConfirm={this.hideDialog/*.bind(this)*/}>
                        Confirmation text '{text}' doesn't match '{magicWord}'
                    </SweetAlert>
                )
            });
        }
    }

    hideDialog(/*e*/) {
        //console.log("hiding ...")
        this.setState({ dialog: null });
    }

    render() {
        return this.state.dialog;
    }
}