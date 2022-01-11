import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import echarts from 'echarts';
import axios from 'axios'
import Configuration from '../Utils/config';
import SetAuthorizationToken from '../Utils/setAuthorizationToken';

export default class DynamicDashboardChart extends Component {
    constructor(props) {
        super(props);
        this.Series0Name = "    Transactions";
        this.Series1Name = "Users";
        this.state = this.getInitialState();
        this.registerTheme();
        // eslint-disable-next-line
        this.state.receivedData = false;
    }

    timeTicket = null;
    count = 6;
    getInitialState = () => ({
        Series0: [], Series1: [], option: this.getOption()
    });

    fetchNewDate = () => {
        this.GetDashboardData();
        let axisData = (new Date()).toLocaleTimeString().replace(/^\D*/, '');
        let option = this.state.option;
        let data0 = option.series[0].data || [];
        let data1 = option.series[1].data || [];
        var i;
        if (data0.length === 0) {
            for (i = 0; i < this.state.Series0.length; i++) {
                data0.push(this.state.Series0[i]);
            }
        }
        else {
            data0.shift();
            data0.push(this.state.Series0[this.state.Series0.length - 1]);
        }
        if (data1.length === 0) {
            for (i = 0; i < this.state.Series1.length; i++) {
                data1.push(this.state.Series1[i]);
            }
        }
        else {
            data1.shift();
            data1.push(this.state.Series1[this.state.Series1.length - 1]);
        }
      
        option.xAxis[0].data.shift();
        option.xAxis[0].data.push(axisData);
        option.xAxis[1].data.shift();
        option.xAxis[1].data.push(this.count++);
        this.setState({ option: option });
    };

    componentDidMount() {
        //this.GetDashboardData();
        this.fetchNewDate();
        if (this.timeTicket) {
            clearInterval(this.timeTicket);
        }

        this.timeTicket = setInterval(this.fetchNewDate, 300000);
    };

    componentWillUnmount() {
        if (this.timeTicket) {
            clearInterval(this.timeTicket);
        }
    };

    GetDashboardData() {
        var apiBaseUrl = Configuration().apiUrl;
        axios.get(apiBaseUrl + 'api/Dashboard/History')
            .then(response => {
                SetAuthorizationToken(response.headers.token);
                var data = JSON.parse(response.data);
                this.setState({
                    Series0: data.HistoricalTransactions,
                    Series0Default: data.Transactions,
                    Series1: data.HistoricalConnectedUsers,
                    Series1Default: data.ConnectedUsers
                });

                if (!this.state.receivedData) {
                    //console.log(this.state);

                    let option = this.state.option;
                    let data0 = option.series[0].data || [];
                    let data1 = option.series[1].data || [];
                    var i;
                    if (data0.length === 0) {
                        for (i = 0; i < this.state.Series0.length; i++) {
                            data0.push(this.state.Series0[i]);
                        }
                    }
                    if (data1.length === 0) {
                        for (i = 0; i < this.state.Series1.length; i++) {
                            data1.push(this.state.Series1[i]);
                        }
                    }
                    this.setState({ option: option });
                }
              
                this.setState({
                    receivedData: true
                });
            })
            .catch((error) => {
                if (error != null && error.response != null && error.response.status === 504) {
                    localStorage.removeItem('token');
                    this.props.history.push("/Login");
                }
                this.setState({
                    receivedData: true
                });
                console.log("error", error)
            });
    }

    // see https://ecomfe.github.io/echarts-doc/public/en/option.html
    getOption = () => ({
        title: {
            //text: 'Hello Echarts-for-react.',
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params, ticket, callback) {
                let messages = params[1];
                let stores = params[0];
                let bullet = '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:{{color}};"></span>';
                let line1 = bullet.replace("{{color}}", messages.color) + ' ' + messages.seriesName + ': ' + messages.value;
                let line2 = stores.name + '<br />' + bullet.replace("{{color}}", stores.color) + ' ' + stores.seriesName + ': ' + stores.value;
                return line1 + '<br /><br />' + line2;
            }
        },
        legend: {
            data: [this.Series0Name, this.Series1Name]
        },
        toolbox: {
            show: false,
            feature: {
                dataView: { readOnly: false },
                restore: {},
                saveAsImage: {}
            }
        },
        grid: {
            top: 60,
            left: 30,
            right: 60,
            bottom: 30
        },
        dataZoom: {
            show: false,
            start: 0,
            end: 100
        },
        visualMap: {
            show: false,
            min: 0,
            max: 1000
        },
        xAxis: [
            {
                type: 'category',
                boundaryGap: true,
                data: (function () {
                    let now = new Date();
                    let res = [];
                    let len = 6;
                    //console.log(res);
                    while (len--) {
                        res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
                        now = new Date(now - 300000);
                    }
                    //console.log(res);
                    return res;
                })()
            },
            {
                type: 'category',
                show: false,
                boundaryGap: true,
                data: (function () {
                    let res = [];
                    let len = 6;
                    while (len--) {
                        res.push(6 - len);
                    }
                    return res;
                })()
            }
        ],
        yAxis: [
            {
                type: 'value',
                scale: true,
                name: this.Series0Name,
                //max: 1200,
                min: 0,
                boundaryGap: [1, 1]
            },
            {
                type: 'value',
                scale: true,
                name: this.Series1Name,
                //max: 25,
                min: 0,
                boundaryGap: [4, 4]
            }
        ],
        series: [
            {
                name: this.Series0Name,
                type: 'bar',
                xAxisIndex: 0,
                yAxisIndex: 0,
                itemStyle: {
                    normal: {
                        barBorderRadius: 4,
                    }
                },
                animationEasing: 'elasticOut',
                animationDelay: function (idx) {
                    return idx * 10;
                },
                animationDelayUpdate: function (idx) {
                    return idx * 10;
                },
                data: []
            },
            {
                name: this.Series1Name,
                type: 'line',
                xAxisIndex: 0,
                yAxisIndex: 1,
                data: []
            }
        ]
    });

    registerTheme = () => {
        echarts.registerTheme('walden', {
            "color": [
                "#3fb1e3",
                "#6be6c1",
                "#626c91",
                "#a0a7e6",
                "#c4ebad",
                "#96dee8"
            ],
            "backgroundColor": "rgba(252,252,252,0)",
            "textStyle": {},
            "title": {
                "textStyle": {
                    "color": "#666666"
                },
                "subtextStyle": {
                    "color": "#999999"
                }
            },
            "line": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": "2"
                    }
                },
                "lineStyle": {
                    "normal": {
                        "width": "3"
                    }
                },
                "symbolSize": "8",
                "symbol": "emptyCircle",
                "smooth": false
            },
            "radar": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": "2"
                    }
                },
                "lineStyle": {
                    "normal": {
                        "width": "3"
                    }
                },
                "symbolSize": "8",
                "symbol": "emptyCircle",
                "smooth": false
            },
            "bar": {
                "itemStyle": {
                    "normal": {
                        "barBorderWidth": 0,
                        "barBorderColor": "#ccc"
                    },
                    "emphasis": {
                        "barBorderWidth": 0,
                        "barBorderColor": "#ccc"
                    }
                }
            },
            "pie": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "scatter": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "boxplot": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "parallel": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "sankey": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "funnel": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "gauge": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    },
                    "emphasis": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                }
            },
            "candlestick": {
                "itemStyle": {
                    "normal": {
                        "color": "#e6a0d2",
                        "color0": "transparent",
                        "borderColor": "#e6a0d2",
                        "borderColor0": "#3fb1e3",
                        "borderWidth": "2"
                    }
                }
            },
            "graph": {
                "itemStyle": {
                    "normal": {
                        "borderWidth": 0,
                        "borderColor": "#ccc"
                    }
                },
                "lineStyle": {
                    "normal": {
                        "width": "1",
                        "color": "#cccccc"
                    }
                },
                "symbolSize": "8",
                "symbol": "emptyCircle",
                "smooth": false,
                "color": [
                    "#3fb1e3",
                    "#6be6c1",
                    "#626c91",
                    "#a0a7e6",
                    "#c4ebad",
                    "#96dee8"
                ],
                "label": {
                    "normal": {
                        "textStyle": {
                            "color": "#ffffff"
                        }
                    }
                }
            },
            "map": {
                "itemStyle": {
                    "normal": {
                        "areaColor": "#eeeeee",
                        "borderColor": "#aaaaaa",
                        "borderWidth": 0.5
                    },
                    "emphasis": {
                        "areaColor": "rgba(63,177,227,0.25)",
                        "borderColor": "#3fb1e3",
                        "borderWidth": 1
                    }
                },
                "label": {
                    "normal": {
                        "textStyle": {
                            "color": "#ffffff"
                        }
                    },
                    "emphasis": {
                        "textStyle": {
                            "color": "rgb(63,177,227)"
                        }
                    }
                }
            },
            "geo": {
                "itemStyle": {
                    "normal": {
                        "areaColor": "#eeeeee",
                        "borderColor": "#aaaaaa",
                        "borderWidth": 0.5
                    },
                    "emphasis": {
                        "areaColor": "rgba(63,177,227,0.25)",
                        "borderColor": "#3fb1e3",
                        "borderWidth": 1
                    }
                },
                "label": {
                    "normal": {
                        "textStyle": {
                            "color": "#ffffff"
                        }
                    },
                    "emphasis": {
                        "textStyle": {
                            "color": "rgb(63,177,227)"
                        }
                    }
                }
            },
            "categoryAxis": {
                "axisLine": {
                    "show": true,
                    "lineStyle": {
                        "color": "#cccccc"
                    }
                },
                "axisTick": {
                    "show": false,
                    "lineStyle": {
                        "color": "#333"
                    }
                },
                "axisLabel": {
                    "show": true,
                    "textStyle": {
                        "color": "#999999"
                    }
                },
                "splitLine": {
                    "show": true,
                    "lineStyle": {
                        "color": [
                            "#eeeeee"
                        ]
                    }
                },
                "splitArea": {
                    "show": false,
                    "areaStyle": {
                        "color": [
                            "rgba(250,250,250,0.05)",
                            "rgba(200,200,200,0.02)"
                        ]
                    }
                }
            },
            "valueAxis": {
                "axisLine": {
                    "show": true,
                    "lineStyle": {
                        "color": "#cccccc"
                    }
                },
                "axisTick": {
                    "show": false,
                    "lineStyle": {
                        "color": "#333"
                    }
                },
                "axisLabel": {
                    "show": true,
                    "textStyle": {
                        "color": "#999999"
                    }
                },
                "splitLine": {
                    "show": true,
                    "lineStyle": {
                        "color": [
                            "#eeeeee"
                        ]
                    }
                },
                "splitArea": {
                    "show": false,
                    "areaStyle": {
                        "color": [
                            "rgba(250,250,250,0.05)",
                            "rgba(200,200,200,0.02)"
                        ]
                    }
                }
            },
            "logAxis": {
                "axisLine": {
                    "show": true,
                    "lineStyle": {
                        "color": "#cccccc"
                    }
                },
                "axisTick": {
                    "show": false,
                    "lineStyle": {
                        "color": "#333"
                    }
                },
                "axisLabel": {
                    "show": true,
                    "textStyle": {
                        "color": "#999999"
                    }
                },
                "splitLine": {
                    "show": true,
                    "lineStyle": {
                        "color": [
                            "#eeeeee"
                        ]
                    }
                },
                "splitArea": {
                    "show": false,
                    "areaStyle": {
                        "color": [
                            "rgba(250,250,250,0.05)",
                            "rgba(200,200,200,0.02)"
                        ]
                    }
                }
            },
            "timeAxis": {
                "axisLine": {
                    "show": true,
                    "lineStyle": {
                        "color": "#cccccc"
                    }
                },
                "axisTick": {
                    "show": false,
                    "lineStyle": {
                        "color": "#333"
                    }
                },
                "axisLabel": {
                    "show": true,
                    "textStyle": {
                        "color": "#999999"
                    }
                },
                "splitLine": {
                    "show": true,
                    "lineStyle": {
                        "color": [
                            "#eeeeee"
                        ]
                    }
                },
                "splitArea": {
                    "show": false,
                    "areaStyle": {
                        "color": [
                            "rgba(250,250,250,0.05)",
                            "rgba(200,200,200,0.02)"
                        ]
                    }
                }
            },
            "toolbox": {
                "iconStyle": {
                    "normal": {
                        "borderColor": "#999999"
                    },
                    "emphasis": {
                        "borderColor": "#666666"
                    }
                }
            },
            "legend": {
                "textStyle": {
                    "color": "#999999"
                }
            },
            "tooltip": {
                "axisPointer": {
                    "lineStyle": {
                        "color": "#cccccc",
                        "width": 1
                    },
                    "crossStyle": {
                        "color": "#cccccc",
                        "width": 1
                    }
                }
            },
            "timeline": {
                "lineStyle": {
                    "color": "#626c91",
                    "width": 1
                },
                "itemStyle": {
                    "normal": {
                        "color": "#626c91",
                        "borderWidth": 1
                    },
                    "emphasis": {
                        "color": "#626c91"
                    }
                },
                "controlStyle": {
                    "normal": {
                        "color": "#626c91",
                        "borderColor": "#626c91",
                        "borderWidth": 0.5
                    },
                    "emphasis": {
                        "color": "#626c91",
                        "borderColor": "#626c91",
                        "borderWidth": 0.5
                    }
                },
                "checkpointStyle": {
                    "color": "#3fb1e3",
                    "borderColor": "rgba(63,177,227,0.15)"
                },
                "label": {
                    "normal": {
                        "textStyle": {
                            "color": "#626c91"
                        }
                    },
                    "emphasis": {
                        "textStyle": {
                            "color": "#626c91"
                        }
                    }
                }
            },
            "visualMap": {
                "color": [
                    "#2a99c9",
                    "#afe8ff"
                ]
            },
            "dataZoom": {
                "backgroundColor": "rgba(255,255,255,0)",
                "dataBackgroundColor": "rgba(222,222,222,1)",
                "fillerColor": "rgba(114,230,212,0.25)",
                "handleColor": "#cccccc",
                "handleSize": "100%",
                "textStyle": {
                    "color": "#999999"
                }
            },
            "markPoint": {
                "label": {
                    "normal": {
                        "textStyle": {
                            "color": "#ffffff"
                        }
                    },
                    "emphasis": {
                        "textStyle": {
                            "color": "#ffffff"
                        }
                    }
                }
            }
        });
    };

    render() {
        return (
            <div className='examples'>
                <div className='parent'>
                    <div id="console-activity" className="media-list height-400 position-relative">
                        {this.state.receivedData ?
                            <div className="card-block">
                                <div>
                                <ReactEcharts ref='echarts_react'
                                        option={this.state.option} theme="walden"
                                        style={{ width: "auto", height: 350 }} />
                                </div>
                            </div>
                            :
                            <div className="card-block offset-lg-5 offset-md-5">
                                <i className="fa fa-spinner fa-pulse fa-5x fa-fw"></i>
                                <span className="sr-only">Loading...</span>
                            </div>
                        }
                    </div>
                </div>
            </div>
        );
    }
}