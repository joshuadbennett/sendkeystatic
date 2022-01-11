/*=========================================================================================
    File Name: tornado.js
    Description: echarts tornado chart
    ----------------------------------------------------------------------------------------
    Item Name: Stack - Responsive Admin Theme
    Version: 1.1
    Author: PIXINVENT
    Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

// Tornado chart
// ------------------------------

$(document).ready(function () {
    // Set paths
    // ------------------------------
    require.config({
        paths: {
            echarts: 'app-assets/vendors/js/charts/echarts'
        }
    });


    // Configuration
    // ------------------------------

    require(
        [
            'echarts/echarts-en.min'
        ],


        // Charts setup
        function (ec) {
            // Initialize chart
            // ------------------------------
            var myChart = ec.init(document.getElementById('dynamic-data'));

            // Chart Options
            // ------------------------------
            chartOptions = {

                // Add Tooltip
                tooltip : {
                    trigger: 'item'
                },

                // Add Legend
                legend: {
                    data:['Messages', 'Servers Online']
                },

                // Add custom colors
                color: ['#2186CF', '#273A83'],

                // Add Toolbox
                toolbox: {
                    show : true,
                    feature : {
                        saveAsImage : {show: true}
                    }
                },

                // Horizontal  Axis
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : true,
                        data : (function (){
                            var now = new Date();
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.unshift(now.toLocaleTimeString().replace(/^\D*/,''));
                                now = new Date(now - 5000);
                            }
                            return res;
                        })()
                    },
                    {
                        type : 'category',
                        boundaryGap : true,
                        data : (function (){
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.push(len + 1);
                            }
                            return res;
                        })()
                    }
                ],

                // Vertical Axis
                yAxis : [
                    {
                        min  : 0,
                        type : 'value',
                        scale: false,
                        name : 'Servers',
                        boundaryGap: [0.2, 0.2]
                    },
                    {
                        min  : 0,
                        type : 'value',
                        scale: false,
                        name : 'Messages',
                        boundaryGap: [0.2, 0.2]
                    }
                ],

                // Add series
                series : [
                    {
                        name:'Messages',
                        type:'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: (function () {
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.push(Math.round(Math.random() * (1000 - 600) + 600));
                            }
                            return res;
                        })()
                    },
                    {
                        name:'Servers Online',
                        type:'line',
                        data:(function (){
                            var res = [];
                            var len = 10;
                            while (len--) {
                                res.push(Math.floor(Math.random() * (6 - 4) + 4 ));
                            }
                            return res;
                        })()
                    }
                ]
            };

            // Apply options
            // ------------------------------

            myChart.setOption(chartOptions);


            // Resize chart
            // ------------------------------

            $(function () {
                // Resize chart on menu width change and window resize
                $(window).on('resize', resize);
                $(".menu-toggle").on('click', resize);

                // Resize function
                function resize() {
                    setTimeout(function() {

                        // Resize chart
                        myChart.resize();
                    }, 200);
                }
                
                var lastData = 11;
                var axisData;
                clearInterval(timeTicket);
                var timeTicket = setInterval(function () {
                    lastData = Math.floor(Math.random() * (6 - 4) + 4);
                    axisData = (new Date()).toLocaleTimeString().replace(/^\D*/,'');
                    tmp1 = myChart.getOption().series[0].data;
                    tmp2 = myChart.getOption().series[1].data;
                    tmp1.shift();
                    tmp1.push(Math.random() * (1000 - 600) + 600);
                    tmp2.shift();
                    tmp2.push(lastData);
                    myChart.setOption({
                        xAxis: [
                            {
                                type: 'category',
                                boundaryGap: true,
                                data: (function () {
                                    var now = new Date();
                                    var res = [];
                                    var len = 10;
                                    while (len--) {
                                        res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
                                        now = new Date(now - 5000);
                                    }
                                    return res;
                                })()
                            },
                            {
                                type: 'category',
                                boundaryGap: true,
                                data: (function () {
                                    var res = [];
                                    var len = 10;
                                    while (len--) {
                                        res.push(len + 1);
                                    }
                                    return res;
                                })()
                            }
                        ],
                        series: [{
                            name: 'Messages',
                            data: tmp1
                        },
                        {
                            name: 'Servers Online',
                            data: tmp2
                        }]
                    });
                }, 5000);
            });
        }
    );
});