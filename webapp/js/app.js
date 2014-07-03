var bars_margin = {top: 20, right: 20, bottom: 30, left: 40},
    bars_width = 1500 - bars_margin.left - bars_margin.right,
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


//----------------------------------------------------------------------------------------------------
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



function type(d) {
  d.Value = +d.Value; // coerce to number
  return d;
}
