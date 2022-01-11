import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Validation from '../Components/Validation.jsx';

export default class ValidationSelect extends React.Component {
    render() {
        let label = this.props.label || "";
        let isRequired = this.props.isRequired || false;
        let readOnly = this.props.readOnly || false;
        let style = this.props.style || null;
        let receivedData = this.props.receivedData || true;
        let id = this.props.id || null;
        let name = this.props.name || null;
        let placeholder = this.props.placeholder || "Select an item";
        let valueKey = this.props.valueKey || "value";
        let labelKey = this.props.labelKey || "label";
        let value = this.props.value || "";
        let data = this.props.data || null;
        let errors = this.props.errors || [];
        let validation = this.props.validation || new Validation();
        let handleChange = this.props.handleChange || null;
        //let handleBlur = this.props.handleBlur || null;

        return (
            <fieldset className="form-group">
                {label !== "" ?
                    <label htmlFor={id}>
                        {label}
                        {isRequired ? <span className="danger">*</span> : ""}
                        &nbsp;
                    </label>
                    :
                    ""
                }
                {receivedData ?
                    <Select id={id} name={name} className="select2" style={style} disabled={readOnly}
                        simpleValue
                        placeholder={placeholder}
                        valueKey={valueKey}
                        labelKey={labelKey}
                        options={data}
                        value={value}
                        onChange={handleChange}
                    />
                    :
                    <div className="card-block offset-lg-5 offset-md-5">
                        <i className="fa fa-spinner fa-pulse fa-1x fa-fw"></i>
                        <span className="sr-only">Loading...</span>
                    </div>
                }
                <div className="invalid-block">
                    {validation.getClass(errors) === " invalid" ?
                        <ul className="invalid" role="alert">
                            {errors.map(function (error, index) {
                                return <li key={index}>{error}</li>;
                            })}
                        </ul>
                        :
                        ""
                    }
                </div>
            </fieldset>
        )
    }
}