function createAreaChart() {


    $(function () {
        $('#area_chart').highcharts({
            chart: {
                type: 'area',
                width: 440,
                marginLeft: 40,
                marginRight: 30
            },
            title: {
                text: ''
            },
            credits: {
                enabled:false
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: _.range(2011,2101,1),
                tickmarkPlacement: 'on',
                title: {
                    enabled: false
                }
            },
            yAxis: {
                title: {
                    text: 'Percent'
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b> ({point.y:,.0f} km<sup>2</sup>)<br/>',
                shared: true
            },
            plotOptions: {
                area: {
                    stacking: 'percent',
                    lineColor: '#ffffff',
                    lineWidth: 1,
                    marker: {
                        lineWidth: 1,
                        lineColor: '#ffffff'
                    }
                }
            },
        });
    });

    areaChart=$('#area_chart').highcharts();


    //veg_classes=['a','b','c','d','e']
    //years=['1750', '1800', '1850', '1900', '1950', '1999', '2050'],
    //years=Array.apply(null, {length: 30}).map(Number.call, Number)

    ecosystem_services_data=JSON.parse(response.ecosystem_services_data)

    /*
    for (var key in ecosystem_services_data) {
        console.log(ecosystem_services_data[key])
        console.log(key)
    }
    */

    for (var key in ecosystem_services_data) {
        var ArrayData = $.map(ecosystem_services_data[key].split(','), function(value){
        return parseInt(value, 10);
            // or return +value; which handles float values as well
        });
        areaChart.addSeries({
            name: key,
            data: ArrayData,
        })
    }

}

