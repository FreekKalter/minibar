//  -----------  Bar chart variables --------------------------------------
var bars_margin = {top: 20, right: 20, bottom: 30, left: 40},
    bars_width = 960 - bars_margin.left - bars_margin.right,
    bars_height = 500 - bars_margin.top - bars_margin.bottom;

// axe scale
var bars_x0 = d3.scale.ordinal()
    .rangeRoundBands([0, bars_width], .1);

var bars_x1 = d3.scale.ordinal();

var bars_y = d3.scale.linear()
    .range([bars_height, 0]);

var bars_color = d3.scale.ordinal()
    //.range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"].reverse());
    .range(["#EEFE57", "#E8FE19", "#8DCF8A", "#5AAC56", "#328A2E", "#166711", "#034500", ].reverse());

var bars_xAxis = d3.svg.axis()
    .scale(bars_x0)
    .orient("bottom");

var bars_yAxis = d3.svg.axis()
    .scale(bars_y)
    .orient("left")
    .tickFormat(d3.format(".2s"));

var bars_svg = d3.select("#bar")
    .attr("width", bars_width + bars_margin.left + bars_margin.right)
    .attr("height", bars_height + bars_margin.top + bars_margin.bottom)
  .append("g")
    .attr("transform", "translate(" + bars_margin.left + "," + bars_margin.top + ")");


// -----------------  Heatmap variables -------------------------------
var heatmap_margin = { top: 50, right: 0, bottom: 100, left: 30  },
    width = 960 - heatmap_margin.left - heatmap_margin.right,
    height = 430 - heatmap_margin.top - heatmap_margin.bottom,
    gridSize = Math.floor(width / 24),
    legendElementWidth = gridSize*2,
    buckets = 7,
    //colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    colors =  ["#EEFE57", "#E8FE19", "#8DCF8A", "#5AAC56", "#328A2E", "#166711", "#034500", ],
    days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
    times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

function plotBars(day){
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        var data = [];
        if (httpRequest.readyState == 4 ) {
               if(httpRequest.status == 200){
                   data = JSON.parse(httpRequest.responseText);
               }
        }

      ageNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      data.forEach(function(d) {
        d.ages = ageNames.map(function(name) { return {name: name, value: +d[name]}; });
      });

      bars_x0.domain(data.map(function(d) { return d.Uur; }));
      bars_x1.domain(ageNames).rangeRoundBands([0, bars_x0.rangeBand()]);
      bars_y.domain([0, d3.max(data, function(d) { return d3.max(d.ages, function(d) { return d.value; }); })]);

      bars_svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + bars_height + ")")
          .call(bars_xAxis);

      bars_svg.append("g")
          .attr("class", "y axis")
          .call(bars_yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Aantal codes ingevoerd");

      var state = bars_svg.selectAll(".state")
          .data(data)
        .enter().append("g")
          .attr("class", "g")
          .attr("transform", function(d) { return "translate(" + bars_x0(d.Uur) + ",0)"; });

      state.selectAll("rect")
          .data(function(d) { return d.ages; })
        .enter().append("rect")
          .attr("width", bars_x1.rangeBand())
          .attr("x", function(d) { return bars_x1(d.name); }) //position in group
          .attr("y", function(d) { return bars_y(d.value); })
          .attr("height", function(d) { return bars_height - bars_y(d.value); })
          .style("fill", function(d) { return bars_color(d.name); });

      var legend = bars_svg.selectAll(".legend")
          .data(ageNames.slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(0," + (120 - (i * 20)) + ")"; });

      legend.append("rect")
          .attr("x", bars_width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", bars_color);

      legend.append("text")
          .attr("x", bars_width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

    }
    httpRequest.open('GET', "grolsch/bars")
    httpRequest.send()
}

$(function() {
 d3.tsv("grolsch/heatmap",
        function(d) {
          return {
            day: +d.day,
            hour: +d.hour,
            value: +d.value
          };
        },
        function(error, data) {
    var colorScale = d3.scale.quantile()
        .domain(data.map(function(k){ return k.value}))
        .range(colors);

    var svg = d3.select("#heatmap")
        .attr("width", width + heatmap_margin.left + heatmap_margin.right)
        .attr("height", height + heatmap_margin.top + heatmap_margin.bottom)
        .append("g")
        .attr("transform", "translate(" + heatmap_margin.left + "," + heatmap_margin.top + ")");

    var dayLabels = svg.selectAll(".dayLabel")
        .data(days)
        .enter().append("a")
        .attr("xlink:href", "#").append("text")
        .on("click", function(d){plotBars(d);})
        .text(function (d) { return d;  })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize;  })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", "dayLabel mono axis axis-workweek");

    var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function(d) { return d;  })
        .attr("x", function(d, i) { return i * gridSize;  })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", "timeLabel mono axis axis-worktime");

    var heatMap = svg.selectAll(".hour")
        .data(data)
        .enter().append("rect")
        .attr("x", function(d) { return (d.hour - 1) * gridSize;  })
        .attr("y", function(d) { return (d.day - 1) * gridSize;  })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0]);

    heatMap.transition().duration(1000)
        .style("fill", function(d) { return colorScale(d.value);  });

    heatMap.append("title").text(function(d) { return d.value;  });

    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d;  })
        .enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i;  })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i];  });

    legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d);  })
        .attr("x", function(d, i) { return legendElementWidth * i;  })
        .attr("y", height + gridSize);
});

});
function type(d) {
    d.Value = +d.Value; // coerce to number
    return d;
}
