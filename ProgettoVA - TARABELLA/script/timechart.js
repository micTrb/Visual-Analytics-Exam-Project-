
/******+*******************************************************************************************************/
/************************************    SETTING THE STAGE      ***********************************************/
/**************************************************************************************************************/


//Setting the dimensions
var margin = {top: 50, right: 20, bottom: 50, left: 200},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var color = d3.scale.ordinal()
              .domain(d3.range(7))
              .range(["#EC6C6C", "#00D197","#ECC46C", "#00845F", "#005B1C", "#ECA86C", "#438990"]); 
              

//AXIS
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#timechart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//TOOLTIP
var tooltip = d3.select('body').append('div')
.style('position', 'absolute')
.style('padding', '0 10px')
.style('opacity', 0)
.style('color', 'white')
.style('background', '#023442');



/******+*******************************************************************************************************/
/************************************        DATA               ***********************************************/
/**************************************************************************************************************/


//change data format
function changeDateFormat(dataP)
{
  str = dataP;
	var dmy = str.split("/");
	var date = new Date(dmy[2], dmy[1], dmy[0]);
	return date;
}

//pushing data
d3.csv("dati/InfortuniData1.csv", function(error, data) 
{
  console.log(data);
  
  if (error) throw error;

  data.forEach(function(d) 
  {
    d.Eta = +d.Eta,
    d.DataAccadimento = changeDateFormat(d.DataAccadimento)
  });

  console.log(data);
  
  x.domain(d3.extent(data, function(d) { return d.DataAccadimento; })).nice();
  y.domain(d3.extent(data, function(d) { return d.Eta; })).nice();

/******+*******************************************************************************************************/
/************************************          RENDERING        ***********************************************/
/**************************************************************************************************************/


//RENDERING SVG

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
  	.append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Età")
      .style("font-family", "geneva");

//APPENDING DOTS
  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 5)
//SETTING OPACITY OF EACH DOT
      .style('opacity', 0.3)
//X AND Y OF EACH DOT DEPENDING FROM AGE AND DATE
      .attr("cx", function(d) { return x(d.DataAccadimento); })
      .attr("cy", function(d) { return y(d.Eta); })
      .style("fill", function(d) { return color(d.DataAccadimento.getUTCDate()); })
//TOOLTIP EVENT MOUSOVER
      .on('mouseover', function(d)
      {
        tooltip.transition()
          .style('opacity', 0.9)
        tooltip.html("Età: " + d.Eta + "</br>" + "Data: " +
        	(d.DataAccadimento.getUTCDate()) + "-" + 
        	parseInt(d.DataAccadimento.getMonth()) + "-" +
        	d.DataAccadimento.getUTCFullYear() + ") ")
          .style('left',(d3.event.pageX - 35) + 'px')
          .style('top', (d3.event.pageY - 60 ) + 'px')
          .style('font-family', 'geneva');
      });

      
});