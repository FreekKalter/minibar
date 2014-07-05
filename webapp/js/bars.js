var bars_margin = {top: 20, right: 30, bottom: 60, left: 40},
    bars_width = 960 - bars_margin.left - bars_margin.right,
    bars_height = 600 - bars_margin.top - bars_margin.bottom;

var bars_x = d3.scale.ordinal()
    .rangeRoundBands([0, bars_width], .1);

var bars_y = d3.scale.linear()
    .range([bars_height, 0]);

var bars_xAxis = d3.svg.axis()
    .scale(bars_x)
    .orient("bottom");

var bars_yAxis = d3.svg.axis()
    .scale(bars_y)
    .orient("left");

var bars_svg = d3.select("#bar")
    .attr("width", bars_width + bars_margin.left + bars_margin.right)
    .attr("height", bars_height + bars_margin.top + bars_margin.bottom)
  .append("g")
    .attr("transform", "translate(" + bars_margin.left + "," + bars_margin.top + ")");

function plotBars(day){
    var bars_httpRequest = new XMLHttpRequest();
    bars_httpRequest.onreadystatechange = function () {
        var data = [];
        if (bars_httpRequest.readyState == 4 ) {
               if(bars_httpRequest.status == 200){
                   data = JSON.parse(bars_httpRequest.responseText);
               }
        }
        bars_svg.selectAll("*").remove();

        //y.domain([0, d3.max(data, function(d) { return d.Value; })]);
         bars_x.domain(data.map(function(d) { return d.Name; }));
         bars_y.domain([0, d3.max(data, function(d) { return d.Value; })]);
        bars_svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + bars_height + ")")
          .call(bars_xAxis)
          .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".50em")
            .attr("dx", "-2em")
            .attr("transform", "rotate(-50)")
            .style("text-anchor", "end");

        bars_svg.append("g")
          .attr("class", "y axis")
          .call(bars_yAxis)
         .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Aantal codes ingevoerd");


        var bars = bars_svg.selectAll(".bar")
          .data(data)
        .enter().append("g");
        var barRects = bars.append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return bars_x(d.Name); })
          .attr("y", function(d) { return bars_y(0); })
          .attr("height", 0)
          .attr("width", bars_x.rangeBand());


        barRects.transition().duration(1000)
          .attr("height", function(d) { return bars_height - bars_y(d.Value); })
          .attr("y", function(d) { return bars_y(d.Value); });
        //.style("fill", function(d) { return colorScale(d.value);  });

        bars.append("text")
            .attr("x", function(d) { return bars_x(d.Name) ; })
            .attr("y", function(d) { return bars_y(d.Value); })
            .attr("dy", "1em")
            .attr("dx", ".2em")
            .text(function(d) { return d.Value; })
            .attr("class", "barLabel");


    }
    bars_httpRequest.open('GET', "grolsch/bars/"+day);
    bars_httpRequest.send();
}
function type(d) {
  d.Value = +d.Value; // coerce to number
  return d;
}
