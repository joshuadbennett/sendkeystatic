import React from 'react';

export default class DatePickerInput extends React.Component {
    render() {
        return (
            <div className="input-group date" name={this.props.name || "dateFilter"}>
                <input type="text" className="form-control" value={this.props.value} onClick={this.props.onClick} onChange={this.props.onChange} />
                <span className="input-group-addon">
                    <span className="fa fa-calendar"></span>
                </span>
            </div>
        )
    }
}