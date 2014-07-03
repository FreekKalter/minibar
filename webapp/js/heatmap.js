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


 d3.tsv("grolsch/heatmap",
        function(d) {
          return {
            day: +d.day,
            hour: +d.hour,
            value: +d.value
          };
        },
        function(error, data) {
            console.log(d3.min(data, function(d){return d.value;}));
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
        .enter().append("text")
        .text(function (d) { return d;  })
        .attr("x", 0)
        .attr("y", function (d, i) { return i * gridSize;  })
        .style("text-anchor", "end")
        .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
        .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis");  });

    var timeLabels = svg.selectAll(".timeLabel")
        .data(times)
        .enter().append("text")
        .text(function(d) { return d;  })
        .attr("x", function(d, i) { return i * gridSize;  })
        .attr("y", 0)
        .style("text-anchor", "middle")
        .attr("transform", "translate(" + gridSize / 2 + ", -6)")
        .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis");  });

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

function type(d) {
    d.Value = +d.Value; // coerce to number
    return d;
}
