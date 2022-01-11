import React from 'react';
import Validation from '../Components/Validation.jsx';

export default class ValidationInput extends React.Component {
    render() {
        let label = this.props.label || "";
        let isRequired = this.props.isRequired || false;
        let isPassword = this.props.isPassword || false;
        let readOnly = this.props.readOnly || false;
        let style = this.props.style || null;
        let id = this.props.id || null;
        let name = this.props.name || null;
        let value = this.props.value || "";
        let data = this.props.data || null;
        let errors = this.props.errors;
        let validation = this.props.validation || new Validation();
        let handleChange = this.props.handleChange || null;
        let handleBlur = this.props.handleBlur || null;

        return (
            <fieldset className="form-group">
                {label !== "" ?
                    <label htmlFor="basicInput">
                        {label}
                        {isRequired ? <span className="danger">*</span> : ""}
                        &nbsp;
                    </label>
                    :
                    ""
                }
                <input id={id} name={name} value={value}
                    type={isPassword ? "password" : "text"} className={"form-control" + validation.getClass(errors)} style={style}
                    data-value={data == null ? null : JSON.stringify(data)}
                    readOnly={readOnly}
                    onChange={handleChange} onBlur={handleBlur} />
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