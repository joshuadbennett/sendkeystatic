import React, { Component } from 'react';

export default class ContentPane extends Component {
    render() {
        return (
            <div className="app-content content container-fluid">
                <div className="content-wrapper">
                    <div className="content-body">
                        <div className="row">
                            <div className="col-md-12">
                                {this.props.children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

