function create_histogram(id, label, sub_title, data_type, labels, chart_type) {

  if (sub_title){
    margin_top =  100
  }
  else{
    margin_top = 90;
  }

  if (chart_type ==  "bar"){
    margin_left = 258;
    rotation = 0
  }
  else{
    margin_left = 68;
    rotation = -45
  }

  $(function () {
    $("#" + id).highcharts({
      chart: {
        type: chart_type,
        marginLeft: margin_left,
        marginTop: margin_top,
        marginRight:20,
        marginBottom:140,
        height:360,
        width:330,
      },
      title: {
        text: label,
        useHTML: true,
        x: 0,
        style: {
          color: '#333333',
          fontSize: "14px",
          whiteSpace: "nowrap",
        }
        //x: 25
      },
      subtitle: {
        text: "",
        useHTML: true,
        align: 'left',
        style: {
        },
        x:0
        //margin: 5,
        //x: 25
      },
      legend: {
        enabled: true,
        itemStyle: {
             fontSize:'12px',
             fontWeight:'normal',
             color: '#333333',
         },
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
      plotOptions: {
        areaspline: {
          states: {
            hover: {
              lineWidth: 5,
              animation: {
                duration: 50,
              }
            }
          }
        },
        column:{
            maxPointWidth:28
        },
        series: {
          findNearestPointBy: 'xy',
          trackByArea: true,
          stickyTracking: true,
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
       //fix for subtitle label on top. See also distribution_chart_tooltip_class.
       useHTML:true,
       borderWidth: 0,
       backgroundColor: "rgba(255,255,255,0)",
       shadow: false,
       margin:0,
       style: {
            padding: 0,
        },
       hideDelay:500,
       formatter: function () {
           $(".distribution_chart_tooltip").css("border-color", this.color);
           var min = (Math.min.apply(null, this.series.xData)).toFixed(1);
           var max = (Math.max.apply(null, this.series.xData)).toFixed(1);
           var mean = (this.series.userOptions.mean).toFixed(1);
           var model = (this.series.userOptions.model);
           //return "<div class='distribution_chart_tooltip'><span style='font-size:1.6em; color:" + this.color + "'>\u25CF</span>&nbspMean: " + mean  + "<div style='margin-left:17px;'> &nbspRange: " + min + " - " + max + "</div><div style='margin-left:18px; font-style:italic'>(Click to Map)</div></div>";
           return "<div class='distribution_chart_tooltip'>" +
               "<span style='font-size:1.6em; color:" + this.color + "'>\u25CF</span>&nbsp" + model +
               "<div style='margin-left:18px;'> Mean: " + mean  + "<br>Range: " + min + " - " + max + "<div style='margin-left:0px; font-style:italic'>(Click to Map)</div></div>";
          /*
          if (data_type == "categorical"){
            return  "<b>Percent Area: </b>" + this.y + "%"
          }
          else {
            return "<b>Range: </b>" + (this.x - this.series.closestPointRange / 2).toFixed(1) + "-" + (this.x + this.series.closestPointRange).toFixed(1) + "<br>" + "<b>Percent Area: </b>" + this.y + "%"
          }
          */
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
