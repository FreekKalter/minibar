var margin = {top: 20, right: 30, bottom: 40, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var chart = d3.select(".chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = function () {
    var data = [];
    if (httpRequest.readyState == 4 ) {
           if(httpRequest.status == 200){
               data = JSON.parse(httpRequest.responseText);
           }
    }

    //y.domain([0, d3.max(data, function(d) { return d.Value; })]);
     x.domain(data.map(function(d) { return d.Name; }));
     y.domain([0, d3.max(data, function(d) { return d.Value; })]);
    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".50em")
        .attr("dx", "-2em")
        .attr("transform", "rotate(-50)")
        .style("text-anchor", "end");

    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis)
     .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Aantal codes ingevoerd");


    chart.selectAll(".bar")
      .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.Name); })
      .attr("y", function(d) { return y(d.Value); })
      .attr("height", function(d) { return height - y(d.Value); })
      .attr("width", x.rangeBand());

}
httpRequest.open('GET', "data")
httpRequest.send()

function type(d) {
  d.Value = +d.Value; // coerce to number
  return d;
}
