function createAreaChart() {


    $(function () {
        $('#area_chart').highcharts({
            chart: {
                type: 'area',
                width: 440,
                marginLeft: 40,
                marginRight: 30,
                marginTop:0,
            },
            title: {
                text: ''
            },
            credits: {
                enabled:false
            },
            legend: {
                width: 460,
                itemWidth: 230,
                x:40
                /*
                align:'right',
                verticalAlign:'top',
                layout: 'vertical',
                */
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                categories: _.range(2011,2101,10),
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
                },
                 series: {
                    marker: {
                        enabled: false
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

    function lookup(key) {
        switch (key) {
            case 'value_0':
                var veg_type = 'undefined';
                color='gray';
                break;
            case 'value_1':
                var veg_type = 'Taiga/Tundra'
                color='#CCCCFF';
                break;
            case 'value_2':
                var veg_type = 'Conifer Forest'
                color='#006633';
                break;
            case 'value_3':
                var veg_type = 'Mixed Forest'
                color='#7FBF7B';
                break;
            case 'value_4':
                var veg_type = 'Broadleaf Forest'
                color='#48F748';
                break;
            case 'value_5':
                var veg_type = 'Shrubland/Woodland/Savanna'
                color='#996633';
                break;
            case 'value_6':
                var veg_type = 'Grassland'
                color='#FFFF00';
                break;
            case 'value_7':
                var veg_type = 'Arid Land'
                color='#FF0000';
                break;
            case 'value_8':
                var veg_type = 'Annual Agriculture'
                color='#FFBF71';
                break;
            case 'value_9':
                var veg_type = 'Perennial Agriculture'
                color='#FF8C00';
                break;
            case 'value_10':
                var veg_type = 'Developed/Mined'
                color='#363636';
                break;
            default :
                var veg_type = 'other'
        }
        return [veg_type,color]
    }

    for (var key in ecosystem_services_data) {
        var veg_name=lookup(key)[0]
        var veg_color=lookup(key)[1]
        var ArrayData = $.map(ecosystem_services_data[key].split(','), function(value){
        return parseInt(value, 10);
            // or return +value; which handles float values as well
        });
        areaChart.addSeries({
            name: veg_name,
            color: veg_color,
            data: ArrayData,
        })
    }

}

