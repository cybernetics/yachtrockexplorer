
//
// Global Vars
//
var margin = {
        top: 5,
        right: 5,
        bottom:5,
        left: 5},
    barwidth  = 250 - margin.left - margin.right,
    barheight = 500 - margin.top - margin.bottom,
    width  = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    radius = 5;

//
// Tooltip div
//

var tdiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity",0);

//
// bar chart
//
/*
var x = d3.scaleLinear().range([0,barwidth]);
var y = d3.scaleBand().range([0,barheight]).padding(0.1);

var barsvg = d3.select("#d3bar").append("svg")
    .attr("width",  barwidth  + margin.left + margin.right)
    .attr("height", barheight + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

barsvg.append("rect")
    .attr("x",0)
    .attr("y",0)
    .attr("width",barwidth)
    .attr("height",barheight)
    .attr("stroke-width", "1")
    .attr("fill", "none")
    .attr("stroke", "black");

d3.json("/get_bar").then(function(data) {
    console.log(data)

    data.forEach(function(d) {
            d.count = +d.count;
    });

    x.domain([0, d3.max(data, function(d) { return d.count; })]);
    y.domain(data.map(function(d) { return d.name; }));

    var bar = barsvg.selectAll("g")
        .data(data)
        .enter()
        .append("g")

    bar.append("rect")
        .attr("class", "bar")
        .attr("width", function(d) {return x(d.count); })
        .attr("height", y.bandwidth())
        .attr("y", function(d) { return y(d.name); });

    bar.append("text")
        .attr("class", "label")
        .attr("y", function(d) {return y(d.name) + 14; })
        .text(function(d) { return d.name })
        .attr("fill", "white");
});

*/

//
// Force simulation
//

var gsvg = d3.select("#d3force").append("svg")
    .attr("width",  width )  //+ margin.left + margin.right)
    .attr("height", height ) //+ margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var container = gsvg.append("g");

gsvg.call(d3.zoom()
    .scaleExtent([.1, 4])
    .on("zoom", function() {
        container.attr("transform", d3.event.transform);
    })
);

/*
gsvg.append("rect")
    .attr("width",width)
    .attr("height",height)
    .attr("stroke-width", "4")
    .attr("fill", "none")
    .attr("stroke", "black");
*/
var sim = d3.forceSimulation()
    //.force("collision", d3.forceCollide())
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-5))
    .force("center", d3.forceCenter(width/2, height/2));

d3.json("/get_mcdonald").then(function(data) {
    console.log(data);

//    var link = gsvg.append("g")
    var link = container.append("g")
        .attr("class","links")
        .selectAll("line")
        .data(data.links)
        .enter().append("line")
        .attr("stroke-width", 1)

//    var node = gsvg.append("g")
    var node = container.append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(data.nodes)
        .enter().append("g");

    var labels =
        node.append("text")
            .text(function(d) { return d.id; })
            .attr("class", "nodelabel")
            .attr('x', 6)
            .attr('y', 3);
//    container.append("g")
//        .attr("class"), "label")
//        .selectAll("text")
//        .data(data.nodes)
//        .enter()
//        .append("text")
//        .text(function(d,i) {


    var circles = node.append("circle")
        .attr("r", circleRadius)
        .attr("fill", circleColor)
        .attr("stroke", "black")
        .attr("stroke-width", "1.5px")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", function(d) {
                tdiv.transition().duration(50)
                .style("opacity", .9)
                tdiv.html("<p>" + d.id + "</p")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tdiv.transition().duration(500)
            .style("opacity", 0);
        });

    node.append("title")
        .text(function(d) { return d.id; });

    sim.nodes(data.nodes).on("tick",ticked);
    sim.force("link").links(data.links);

    function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

});


// Circle styling //

function circleColor(d) {
    if(d.group == 'song') {
        return "red";
    } else {
        return "blue";
    }
}

function circleRadius(d) {
    if(d.group == 'song') {
        return radius * 2;
    } else {
        return radius;
    }
}

// Drag events //

function dragstarted(d) {
    if(!d3.event.active) sim.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
}

function dragended(d) {
    if(!d3.event.active) sim.alphaTarget(0)
    d.fx = null;
    d.fy = null;
}

function zoom_actins() {
    g.attr("transform", d3.event.transform)
}

// Label Toggle //
var labelStatus = 1;
d3.select("#label-toggle")
  .on("click", function() {
    console.log('hi');
    if(labelStatus == 1) {
        newO = 0;
        labelStatus = 0;
    } else {
        newO = 1;
        labelStatus = 1;
    }
    d3.selectAll(".nodelabel").style("opacity",newO);
  });
