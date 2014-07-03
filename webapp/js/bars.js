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
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
        var data = [];
        if (httpRequest.readyState == 4 ) {
               if(httpRequest.status == 200){
                   data = JSON.parse(httpRequest.responseText);
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


        var bar = bars_svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return bars_x(d.Name); })
          .attr("y", function(d) { return bars_y(d.Value); })
          .attr("height", function(d) { return bars_height - bars_y(d.Value); })
          .attr("width", bars_x.rangeBand());

        bar.append("text")
            .attr("x", function(d) { return bars_x(d.Value) ; })
            .attr("y", function(d) { return bars_y(d.Value); })
            //.attr("dy", "5em")
            .text(function(d) { return d.Value; });

    }
    httpRequest.open('GET', "grolsch/bars/"+day);
    httpRequest.send();
}
    function type(d) {
      d.Value = +d.Value; // coerce to number
      return d;
    }
