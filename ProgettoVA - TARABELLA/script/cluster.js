/********************************************************************************/
/********************************* GETTING THE DATA *******************************/
/********************************************************************************/


//Returns a filtered array by gender
function getGender(arr, gend)
{
  return arr.filter(function(list)
  {
    return list.Genere === gend;
  })
};

//Returns a filtered array by province
function getProv(arr, prov)
{
  return arr.filter(function(list)
  {
    return list.LuogoAccadimento === prov;
  })
};

/*
Given an already gender sorted array
with the function getGender(arr, gend),
getProvLen returns an array of objects containing for each province
the number of job accidents
*/
function getProvObj(arrG, g)
{
  var arrP = ["Firenze", "Pisa", "Livorno", "Lucca", 
                "Massa-Carrara", "Prato", "Pistoia", 
                "Arezzo", "Siena", "Grosseto"];
  var pl = [];
  for(key in arrP)
  {
    var pLen = getProv(arrG, arrP[key]).length;
    var loc = arrP[key];

    pl.push(
      {
        //Creates a new object containing: 

        Inf: pLen, //n of job accident in (Number)
        Luogo: loc, // the province (String)
        Gend: g // by gender group (String)
      });
  }
  return pl;
};

/*
Returns an array containing the list of the number of accidents 
occurred in each province, given an array of 
province object sorted by gender.
(this is provided by the getProvObj function).
*/

function getProvLen(arrPObj)
{
  var pLen = [];
  for(key in arrPObj)
  {
    pLen.push(arrPObj[key].Inf);
  }
  return pLen;
}


/******+*******************************************************************************************************/
/************************************  CLUSTER PREPARATORY DATA ***********************************************/
/**************************************************************************************************************/


//Setting the dimensions
var width = 1000,
    height = 600,
    padding = 2, // separation between same-color nodes
    clusterPadding = 20, // separation between different-color nodes
    maxRadius = 12;

// number of distinct clusters
var m = 2; 

// color for each cluster
var colorM = "#1790B2"; //blue
var colorF = "#EC6C6C"; //red


// The largest node for each cluster. 
var clusters = new Array(m);


/*
Given an array of province object sorted by gender
the function createCluster returns a cluster of nodes
in which the radius dimension depends on the number 
of job accident occured in each province.
Other attribute of the node refers to:
      cluster: the sub-cluster (male or female)
      radius: the radius of each node 
      tooltip: tooltip for text information
      quantity: number of accident for each province
      gender: male or female
      x, y: random position of the floating nodes
*/

function createCluster(arr)
{
  var nodeArr=[];
  for(key in arr)
  {
    var i = 0;
    var r = Math.floor((Math.sqrt(arr[key].Inf))*0.7);
    var tt = arr[key].Luogo;
    var q = arr[key].Inf;
    var g = arr[key].Gend;
    var d = 
    {
      cluster: i,
      radius: r,
      tooltip: tt,
      quantity: q,
      gender: g,
      x: Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random(),
      y: Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random()
    };
    if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
    nodeArr.push(d);
  }
  return nodeArr;
};

//Push two cluster nodes array in an another array (NOT USED)
function pushCluster(arrCluster1, arrCluster2)
{
  var Clusters = [];
  Clusters.push(arrCluster1);
  Clusters.push(arrCluster2);
  return Clusters;
};


/******+*******************************************************************************************************/
/***************************                  PARSING DATA                   **********************************/ 
/**************************************************************************************************************/

var infortuni = [];

d3.csv('dati/infortuniProv.csv', function callback(data)
{

  for(key in data)
  {
    infortuni.push(data[key]);
  }

  //Getting data instances

  //Male arrays
  var maschi = getGender(infortuni, "M");
  var mProvObj = getProvObj(maschi, "M");
  var mProvLen = getProvLen(mProvObj);

  //Female arrays
  var femmine = getGender(infortuni, "F");
  var fProvObj = getProvObj(femmine, "F");
  var fProvLen = getProvLen(fProvObj);

  //creating clusters for each gender
  var nodesM = createCluster(mProvObj);
  var nodesF = createCluster(fProvObj);

  //concating each cluster in a nodes array
  var nodes = nodesM.concat(nodesF);

  //changing the cluster attribute in the female array
  for(key in nodes)
  {
    if(nodes[key].gender === "F") 
      {
        nodes[key].cluster = nodes[key].cluster + 1;
      }
  }

  //setting the whole cluster array
  clusters = nodes;
  console.log(clusters);


/******+*******************************************************************************************************/
/***************************                FORCE AND TOOLTIP                **********************************/ 
/**************************************************************************************************************/

  var force = d3.layout.force()
      .nodes(nodes)
      .size([width, height])
      .gravity(.02)
      .charge(30)
      .on("tick", tick)
      .start();

  var tooltip = d3.select('body').append('div')
    .style('position', 'absolute')
    .style('padding', '0 10px')
    .style('opacity', 0)
    .style('color', 'white')
    .style('background', '#023442');

  


/******+*******************************************************************************************************/
/***************************               CLUSTER RENDERING                 **********************************/ 
/**************************************************************************************************************/


  var svg = d3.select("#cluster").append("svg")
      .attr("width", width)
      .attr("height", height);

  var node = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .style("fill", function(d) 
      { 
        if(d.gender == "M") return colorM;
        else return colorF; 
      })
      .style("border", "5px solid red")
      .call(force.drag)
      .on('mouseover', function(d)
      {
        tooltip.transition()
          .style('opacity', .9)
        tooltip.html(d.tooltip + " (" + d.quantity + ") " + d.gender)
          .style('left',(d3.event.pageX - 35) + 'px')
          .style('top', (d3.event.pageY - 50 ) + 'px')
          .style('font-family', 'geneva');
      });

  node.transition()
      .duration(2000)
      .delay(function(d, i) { return i * 10; })
      .attrTween("r", function(d) 
      {
        var i = d3.interpolate(0, d.radius);
        return function(t) { return d.radius = i(t); };
      });

  function tick(e) 
  {
    node
        .each(cluster(10 * e.alpha * e.alpha))
        .each(collide(.5))
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  }



/******+*******************************************************************************************************/
/***************************                 CLUSTER FUNCTIONS               **********************************/ 
/**************************************************************************************************************/

// Move d to be adjacent to the cluster node.
  function cluster(alpha) 
  {
    return function(d) 
    {
      var cluster = clusters[d.cluster];
      if (cluster === d) return;
        {
          var x = d.x - cluster.x,
          y = d.y - cluster.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + cluster.radius;
        }

      if (l != r) {
        l = (l - r) / l * alpha;
        d.x -= x *= l;
        d.y -= y *= l;
        cluster.x += x;
        cluster.y += y;
      }
    };
  }



  // Resolves collisions between d and all other circles.
  function collide(alpha) {
    var quadtree = d3.geom.quadtree(nodes);
    return function(d) {
      var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
      quadtree.visit(function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== d)) {
          var x = d.x - quad.point.x,
              y = d.y - quad.point.y,
              l = Math.sqrt(x * x + y * y),
              r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
          if (l < r) {
            l = (l - r) / l * alpha;
            d.x -= x *= l;
            d.y -= y *= l;
            quad.point.x += x;
            quad.point.y += y;
          }
        }
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    };
  };

/*****+** Reading file closing parenthesis ***/
});


function somma(a, b)
{
  var c = a + b;
  return c;
}

console.log(somma(3, 4));











