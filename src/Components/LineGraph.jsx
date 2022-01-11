import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryBrushContainer, VictoryLabel, VictoryLegend, VictoryTooltip, VictoryContainer, VictoryZoomContainer } from 'victory';

var colorScale = ["#ff7588", "#16d39a", "#2bd2d4", "#f3a8b4", "#f7c1a6"];

export default class LineGraph extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
    }

    handleZoom(domain) {
        this.setState({ selectedDomain: domain });
    }

    handleBrush(domain) {
        this.setState({ zoomDomain: domain });
    }

    render() {
        if (this.props.data.length > 0) {
            return (
                <div>
                    <VictoryChart
                        width={550} height={200}
                        scale={{ x: "time" }}
                        containerComponent={
                            <VictoryZoomContainer
                                zoomDimension="x"
                                zoomDomain={this.state.zoomDomain}
                                onZoomDomainChange={this.handleZoom.bind(this)}
                            />
                        }
                        style={{ fontSize: 6, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }}
                    >
                        <VictoryLegend
                            title={this.props.title}
                            //centerTitle
                            //orientation="horizontal"
                            //gutter={20}
                            domainPadding={20}
                            style={{
                                title: { fontSize: 20, fontFamily: " Montserrat, Georgia, Times New Roman, Times, serif" },
                                labels: { fontSize: 0, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }
                            }}
//                            data={legend}
                            standalone={false}
                        />
                        <VictoryAxis
                            orientation="bottom"
                            tickLabelComponent={
                                <VictoryLabel
                                    dy={10}
                                    angle={-45}
                                    style={{ fontSize: 10, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }}
                                />
                            }
                            //tickFormat={(x) => new Date(x).toLocaleString('en-us', { month: "short" })}
                            tickFormat={(x) => {
                                var y = new Date(x).toISOString().substr(0, 10);
                                return y;
                            }
                            }
                        />
                        <VictoryAxis dependentAxis
                            orientation="left"
                            tickLabelComponent={
                                <VictoryLabel
                                    dx={5}
                                    //angle={-45}
                                    style={{ fontSize: 10, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }}
                                />
                            }
                        />
                        <VictoryLine
                            style={{
                                data: { stroke: colorScale[0] }
                            }}
                            data={this.props.data}
                            x="a"
                            y="b"
                        />

                    </VictoryChart>
                    <VictoryChart
                        padding={{ top: 0, left: 50, right: 50, bottom: 30 }}
                        width={550} height={50}
                        scale={{ x: "time" }}
                        containerComponent={
                            <VictoryBrushContainer
                                brushDimension="x"
                                brushDomain={this.state.selectedDomain}
                                onBrushDomainChange={this.handleBrush.bind(this)}
                            />
                        }
                    >
                        <VictoryAxis
                            fixLabelOverlap={true}
                            tickLabelComponent={
                                <VictoryLabel
                                    dy={2}
                                    angle={-45}
                                    style={{ fontSize:6, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }}
                                />
                            }
                            //tickFormat={(x) => new Date(x).toLocaleString('en-us', { month: "short" })}
                            tickFormat={(x) =>
                                {
                                var y = new Date(x).toISOString().substr(0, 10);
                                return y;
                                }
                            }
                            
                        />
                        <VictoryLine
                            style={{
                                data: { stroke: colorScale[0] }
                            }}
                            data={this.props.data}
                            x="a"
                            y="b"
                        />
                    </VictoryChart>
                </div>
            );
        } else {
            return (<div></div>)
        }
    }
}
