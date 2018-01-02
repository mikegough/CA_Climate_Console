function create_histogram(id, label, sub_title, data_type, labels, chart_type) {

  if (sub_title){
    margin_top =  100
  }
  else{
    margin_top = null
  }

  if (chart_type ==  "bar"){
    margin_left = 258
    rotation = 0
  }
  else{
    margin_left = 68
    rotation = -45
  }

  $(function () {
    $("#" + id).highcharts({
      chart: {
        type: chart_type,
        marginLeft: margin_left,
        marginTop: margin_top,
        marginRight:20,
        height:350,
        width:310,
      },
      title: {
        text: label,
        x: 10,
        style: {
          color: '#333333',
          fontSize: "14px",
        }
        //x: 25
      },
      subtitle: {
        text: "",
        //x: 25
      },
      legend: {
        enabled: true,
        itemStyle: {
             fontSize:'12px',
             fontWeight:'normal',
             color: '#333333'
         },
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        column:{
            maxPointWidth:28
        },
        series: {
          groupPadding:.1,
          //colors:colors,
          /*
          groupPadding: 0,
          pointPadding: 0.1,
          groupPadding: 0.1,
          borderWidth: 0.5,
          */
          borderColor: 'rgba(255,255,255,0.5)',
        }
      },
      xAxis: [{
        pointPadding:.5,
        "type": "category",
        groupPadding:.5,
        maxPadding:0,
        //tickInterval: 1,
        //allowDecimals: false,
        startOnTick: true,
        endOnTick: true,
        title: {
          //Label below the x axis
          text: ''
        },
        labels: {
            rotation: rotation,
            style:{
              textOverflow: 'none',
            },
            enabled: true,
            formatter: function() {
              if (typeof labels[this.value] != "undefined") {
                return labels[this.value][0];
              }
              else{
                return this.value
              }
            },
        }

      }],
      yAxis: {
        title: {
          text: 'Percent Area'
        },
        maxPadding: 0,
        endOnTick: false,
        tickPixelInterval:45,
        //tickInterval:45,
        labels: {
            formatter:function() {
                //var pcnt = (this.value / cell_count) * 100;
                //rounded_percent = Math.round(Highcharts.numberFormat(pcnt,0,',')/10)*10
                return this.value + '%';
            }
        }
      },
      tooltip: {
        formatter: function () {
          if (data_type == "categorical"){
            return  "<b>Percent Area: </b>" + this.y + "%"
          }
          else {
            return "<b>Range: </b>" + (this.x - this.series.closestPointRange / 2).toFixed(1) + "-" + (this.x + this.series.closestPointRange).toFixed(1) + "<br>" + "<b>Percent Area: </b>" + this.y + "%"
          }
        }
      }

    });

    // Median line
    /*
     chart.xAxis[0].addPlotLine({
     value: mad.median,
     width: 1,
     color: 'rgba(0,0,0,0.5)',
     zIndex: 8
     });
     */

  });


}
