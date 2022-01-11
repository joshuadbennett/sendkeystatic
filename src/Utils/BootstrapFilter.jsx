import React from 'react';
import PropTypes from 'prop-types';

export default class BootstrapFilter extends React.Component {
    static propTypes = {
        setFilter: PropTypes.func,
        style: PropTypes.object,
        className: PropTypes.string
    }

    setFilter = (e) => {
        this.props.setFilter(e.target.value);
    }

    render() {
        return (
            <label>
				<input
                    type="text"
                    name="filter"
                    placeholder="Search"
                    onChange={this.setFilter}
                    style={this.props.style}
                    className={this.props.className}
                />
            </label>
        );
    }
}