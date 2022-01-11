/*=========================================================================================
    File Name: basic-pie.js
    Description: echarts basic pie chart
    ----------------------------------------------------------------------------------------
    Item Name: Stack - Responsive Admin Theme
    Version: 1.1
    Author: PIXINVENT
    Author URL: http://www.themeforest.net/user/pixinvent
==========================================================================================*/

// Basic pie chart
// ------------------------------

$(document).ready(function () {

    // Set paths
    // ------------------------------

    require.config({
        paths: {
            echarts: '../../../app-assets/vendors/js/charts/echarts'
        }
    });

    // Configuration
    // ------------------------------

    require(
        [
            'echarts',
            'echarts/chart/pie'
        ],

        // Charts setup
        function (ec) {
            // Initialize chart
            // ------------------------------
            var myChart = ec.init(document.getElementById('serverStatusChart'));

            var serverStatusData = JSON.parse($('#serverStatusData').val());

            //console.log(serverStatusData);

            // Chart Options
            // ------------------------------
            chartOptions = {

                // Add title
                title: {
                    text: serverStatusData.title,
                    //subtext: 'Open source information',
                    x: 'center'
                },

                // Add tooltip
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b}: {c} ({d}%)"
                },

                // Add legend
                legend: {
                    orient: 'vertical',
                    x: 'left',
                    data: serverStatusData.data.map(e => e.name)
                },

                // Add custom colors
                color: ['#00A5A8', '#626E82', '#FF7D4D','#FF4558', '#16D39A'],

                // Display toolbox
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    feature: {
                        mark: {
                            show: true,
                            title: {
                                mark: 'Markline switch',
                                markUndo: 'Undo markline',
                                markClear: 'Clear markline'
                            }
                        },
                        dataView: {
                            show: true,
                            readOnly: false,
                            title: 'View data',
                            lang: ['View chart data', 'Close', 'Update']
                        },
                        restore: {
                            show: true,
                            title: 'Restore'
                        },
                        saveAsImage: {
                            show: true,
                            title: 'Save as image',
                            lang: ['Save']
                        }
                    }
                },

                // Enable drag recalculate
                calculable: true,

                // Add series
                series: [{
                    name: 'ServerStatus',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '57.5%'],
                    data: serverStatusData.data.map(e => { return { name: e.name, value: e.value } })
                }]
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
            });
        }
    );
});