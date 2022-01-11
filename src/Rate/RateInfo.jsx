import React from 'react';
import Formatting from '../Components/Formatting.jsx';

export default class RateInfo extends React.Component {
    render() {
        let options = this.props.options;
        //console.log("options = ", options);
        if (options == null || options.length == null || options.length < 1) return null;
        let index = this.props.index;
        //console.log("index = ", index);
        if (index == null || index.length == null || index.length < 1) return null;
        let indexProp = this.props.indexProp || "RateId";
        //console.log("indexProp = ", indexProp);
        let data = options.find((item) => item[indexProp] === index);
        //console.log("data = ", data);
        if (data == null) return null;
        let orientation = this.props.orientation || "horizontal";
        let formatting = this.props.formatting || new Formatting();
        let currencySymbol = this.props.currencySymbol || "";
        if (orientation.toLowerCase() === "vertical") {
            return (
                <table className="table table-striped table-bordered zero-configuration" id={this.props.id} name={this.props.name}>
                    <thead>
                        <tr>
                            <th colSpan="7">{data.RateName || "Rate"}</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th>Base</th>
                            <th>Alloc.</th>
                            <th>Send</th>
                            <th>Recv</th>
                            <th colSpan="2">Min. Chrg.</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>SMS</th>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseSMSCharge, 6)}</td>
                            <td>{data.BaseSMSAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendSMSRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveSMSRatePerUnit, 6)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>MMS</th>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseMMSCharge, 6)}</td>
                            <td>{data.BaseMMSAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendMMSRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveMMSRatePerUnit, 6)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>Voice</th>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseVoiceCharge, 6)}</td>
                            <td>{data.BaseVoiceAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendVoiceRatePerMinute, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveVoiceRatePerMinute, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendVoiceMinimumCharge, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveVoiceMinimumCharge, 6)}</td>
                        </tr>
                        <tr>
                            <th>Fax</th>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseFaxCharge, 6)}</td>
                            <td>{data.BaseFaxAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendFaxRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveFaxRatePerUnit, 6)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseEmailCharge, 6)}</td>
                            <td>{data.BaseEmailAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendEmailRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveEmailRatePerUnit, 6)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>Video</th>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseVideoChatCharge, 6)}</td>
                            <td>{data.BaseVideoChatAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendVideoChatRatePerMinute, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveVideoChatRatePerMinute, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendVideoChatMinimumCharge, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveVideoChatMinimumCharge, 6)}</td>
                        </tr>
                    </tbody>
                </table>
            )
        } else {
            return (
                <table className="table table-striped table-bordered zero-configuration">
                    <thead>
                        <tr>
                            <th>{data.RateName || "Rate"}</th>
                        </tr>
                        <tr>
                            <th colSpan="4">SMS</th>
                            <th colSpan="4">MMS</th>
                            <th colSpan="6">Voice</th>
                            <th colSpan="4">Fax</th>
                            <th colSpan="4">Email</th>
                        </tr>
                        <tr>
                            <th colSpan="2">Base</th>
                            <th colSpan="2">Rate</th>
                            <th colSpan="2">Base</th>
                            <th colSpan="2">Rate</th>
                            <th colSpan="2">Base</th>
                            <th colSpan="2">Rate</th>
                            <th colSpan="2">Min. Chrg.</th>
                            <th colSpan="2">Base</th>
                            <th colSpan="2">Rate</th>
                            <th colSpan="2">Base</th>
                            <th colSpan="2">Rate</th>
                        </tr>
                        <tr>
                            <th>Chrg</th>
                            <th>Alloc</th>
                            <th>Send</th>
                            <th>Recv</th>
                            <th>Chrg</th>
                            <th>Alloc</th>
                            <th>Send</th>
                            <th>Recv</th>
                            <th>Chrg</th>
                            <th>Alloc</th>
                            <th>Send</th>
                            <th>Recv</th>
                            <th>Send</th>
                            <th>Recv</th>
                            <th>Chrg</th>
                            <th>Alloc</th>
                            <th>Send</th>
                            <th>Recv</th>
                            <th>Chrg</th>
                            <th>Alloc</th>
                            <th>Send</th>
                            <th>Recv</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseSMSCharge, 6)}</td>
                            <td>{data.BaseSMSAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendSMSRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveSMSRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseMMSCharge, 6)}</td>
                            <td>{data.BaseMMSAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendMMSRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveMMSRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseVoiceCharge, 6)}</td>
                            <td>{data.BaseVoiceAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendVoiceRatePerMinute, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveVoiceRatePerMinute, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendVoiceMinimumCharge, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveVoiceMinimumCharge, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseFaxCharge, 6)}</td>
                            <td>{data.BaseFaxAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendFaxRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveFaxRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.BaseEmailCharge, 6)}</td>
                            <td>{data.BaseEmailAllocation}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.SendEmailRatePerUnit, 6)}</td>
                            <td>{currencySymbol + formatting.formatDecimal(data.ReceiveEmailRatePerUnit, 6)}</td>
                        </tr>
                    </tbody>
                </table>
            )
        }
    }
}