import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { VictoryPie, VictoryTheme, VictoryLabel, VictoryLegend, VictoryTooltip, VictoryContainer, VictoryZoomContainer } from 'victory';

var colorScale = ["#ff7588", "#16d39a", "#2bd2d4", "#f3a8b4", "#f7c1a6"];

export default class PieChart extends React.Component {
    constructor(props) {
        super(props);
        //console.log(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
    }

    render() {
        var i = 0, legend = [];
        for (i = 0; i < this.props.data.length; i++) {
            legend.push({ name: this.props.data[i].legend, symbol: { fill: colorScale[i] } });
        }
        if (legend.length > 0) {
            return (
                <VictoryContainer
                    style={{ border: "1px solid #ccc" }}
                    width={450} height={450}
                >
                    <VictoryPie
                        padding={{ top: 100, left: 150 }}
                        //labelComponent={<VictoryTooltip />}
                        colorScale={colorScale}
                        standalone={true}
                        //width={300} height={300}
                        data={this.props.data}
                        //labelRadius={90}
                        style={{
                            data: {
                                stroke: "#404E67", strokeWidth: .25
                            },
                            labels: { fontSize: 16, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }
                        }}
                        containerComponent={
                            <VictoryContainer />
                        }
                        standalone={false}
                    />
                    <VictoryLegend
                        title={this.props.title}
                        //centerTitle
                        //orientation="horizontal"
                        //gutter={20}
                        domainPadding={20}
                        style={{
                            title: { fontSize: 40, fontFamily: " Montserrat, Georgia, Times New Roman, Times, serif" },
                            labels: { fontSize: 16, fontFamily: "Montserrat, Georgia, Times New Roman, Times, serif", fill: "#404E67" }
                        }}
                        data={legend}
                        containerComponent={
                            <VictoryContainer />
                        }
                        standalone={false}
                    />
                </VictoryContainer>
            );
        } else {
            return (<div></div>)
        }
    }
}