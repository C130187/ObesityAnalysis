//Width and height of map
var width = 700;
var height = 350;

// D3 Projection
var projection = d3.geoAlbersUsa()
				   .translate([width/2, height/2])    // translate to center of screen
				   .scale([700]);          // scale things down so see entire US
        
// Define path generator
var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	 .projection(projection);  // tell path generator to use albersUsa projection

	
// Define linear scale for output
var color = d3.scaleLinear()
			  .range(["red","green","blue"]);

var legendText_2 = ["% Obese", "% No Phy Activity", "% No Fruits/Vege"];

var myColor = d3.scaleLinear().domain([1,8])
                .range(["white", "steelblue"])
var legendText_1 = ["20-25%", "25-30%", "30-35%", "35-40%", "NA"];

//Create SVG element and append map to the SVG
var svg_plot1 = d3.select("div#plot1")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

var svg_plot2 = d3.select("div#plot2")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

svg_plot1.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", width)
	.attr("height", height)
	.attr("fill", "#F8E8DA")
	.style("opacity", 0.3);

svg_plot2.append("rect")
	.attr("x", 0)
	.attr("y", 0)
	.attr("width", width)
	.attr("height", height)
	.attr("fill", "#F8E8DA")
	.style("opacity", 0.3);

svg_plot1.append("text")
  .attr("x", width/2)
  .attr("y", height/12)
  .style("font-weight", "bold")
  .style("font-size", "22px")
  .style("text-anchor", "middle")
  .text("Obesity Analysis For US States"); 

svg_plot1.append("text")
	.attr("x", width/2)
  .attr("y", height-3)
	.style("text-anchor", "middle")
  .text("Click on a state to view obesity trends for the past decade."); 

svg_plot2.append("text")
  .attr("id", "plot2Title")
	.attr("x", width/2)
  .attr("y", height/12)
	.style("text-anchor", "middle")
	.style("font-weight", "bold")
  .style("font-size", "20px")
  .text("Trend for years 2011-2019"); 

var padding = 100;

// scale function : y
var yScale = d3.scaleLinear()
		.domain([10, 50])
		.range([height-padding, height/5]);

// axes: y
var yAxis = d3.axisLeft()
		.scale(yScale).ticks(5);

svg_plot2.append("g")
    .attr("class", "yAxis")
		.attr("transform", `translate(${width/6-padding/10}, 0)`)
		.call(yAxis);

svg_plot2.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 2*padding/3)
      .attr("x", -height/2)
      //.attr("dy", ".75em")
      .style("text-anchor", "middle")
      .text("Data Value"); 

// scale function : x
var xScale = d3.scaleLinear()
		.domain([2011, 2019])
		.range([width/6, 0.95*width]);

// axes : x
var xAxis = d3.axisBottom()
		.scale(xScale).ticks(9).tickFormat(d3.format("d"));;

svg_plot2.append("g")
    .attr("class", "xAxis")
		.attr("transform", `translate(0, ${height - padding})`)
		.call(xAxis);

svg_plot2.append("text")             
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height - padding/2) + ")")
    .style("text-anchor", "middle")
    .text("Year");


// Load in my states data!
d3.csv("https://raw.githubusercontent.com/C130187/ObesityAnalysis/main/data/interactive/BRFS_AvgPerClassPerYear.csv")
  .then(function(data) {
    
    color.domain([0,1,2]); // setting the range of the input data


    // Load GeoJSON data and merge with states data
    d3.json("https://raw.githubusercontent.com/C130187/ObesityAnalysis/main/data/interactive/us-states.json")
      .then(function(json) {
        
        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {
        
        	// Grab State Name
        	var dataState = data[i].LocationDesc;
        
        	// Find the corresponding state inside the GeoJSON
        	for (var j = 0; j < json.features.length; j++)  {
        	  // console.log("json");
        		var jsonState = json.features[j].properties.name;
        
        		if (dataState == jsonState) {
        
        		// Copy the data value into the JSON
        		var cat = data[i].Class;
        		var year = data[i].YearStart;
        		var value = data[i].AvgValue;
        		var to_append = [year, value];
        		if (cat == "Obesity / Weight Status"){
        		  if(year=="2019"){
        		      if(value>=20 & value<25){
        		        json.features[j].properties.color = myColor(2);
        		    }
        		      if(value>=25 & value<30){
        		        json.features[j].properties.color = myColor(4);
        		    }
        		      if(value>=30 & value<35){
        		        json.features[j].properties.color = myColor(6);
        		    }
        		      if(value>=35 & value<41){
        		        json.features[j].properties.color = myColor(8);
        		    }
        		  }
        		  
        		  if ("Obesity" in json.features[j].properties){
        		    json.features[j].properties.Obesity.push(to_append);
        		  }
        		  else{
        		    json.features[j].properties.Obesity = [to_append];
        		  }
        		}
        		if (cat == "Physical Activity"){
        		  if ("NoActivity" in json.features[j].properties){
        		    json.features[j].properties.NoActivity.push(to_append);
        		  }
        		  else{
        		    json.features[j].properties.NoActivity = [to_append];
        		  }
        		}
        		if (cat == "Fruits and Vegetables"){
        		  if ("NoNutrition" in json.features[j].properties){
        		    json.features[j].properties.NoNutrition.push(to_append);
        		  }
        		  else{
        		    json.features[j].properties.NoNutrition = [to_append];
        		  }
        		}
        		break;
        		}
        	}
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg_plot1.selectAll("path.states")
        	.data(json.features)
        	.enter()
        	.append("path")
        	.classed("states", true)
        	.attr("d", path)
        	.style("stroke", "#fff")
        	.style("stroke-width", "1")
        	.on("mouseover", function(event, d) {  
        	     var coordinates = d3.pointer(event);
               svg_plot1.append("text")
                 .classed("hover", true)
                 .attr("x", 10+coordinates[0])
                 .attr("y", 10+coordinates[1])
                 .text(d.properties.name); 
        	    
        	}) 
        	.on("mouseout", function(event,d) {       
              d3.selectAll("*.hover").remove();  
          })
        	.on("click", function(event, d) { 
        	  
        	       d3.selectAll("*.timeSeries").remove();
        	       
        	       var stateName = d.properties.name;
        	       console.log(stateName);
        	       
        	       d3.select("text#plot2Title")
        	        .text("Trend for " + stateName + " from 2011-2019")
        	       
                 var coordinates = d3.pointer(event);
                 svg_plot1.append("circle")
                 .classed("timeSeries", true)
                 .attr("cx", coordinates[0])
                 .attr("cy", coordinates[1])
                 .attr("r", 3)
                 .text(stateName); 
                 
                var mylinegen = d3.line() 
                mylinegen.x(d => xScale(d[0]))
                         .y(d => yScale(d[1]));
                
                var min_y = d3.min([Math.min.apply(Math, d.properties.Obesity.map(v => v[1])),
                                    Math.min.apply(Math, d.properties.NoActivity.map(v => v[1])),
                                    Math.min.apply(Math, d.properties.NoNutrition.map(v => v[1]))])
                
                var max_y = d3.max([Math.max.apply(Math, d.properties.Obesity.map(v => v[1])),
                                    Math.max.apply(Math, d.properties.NoActivity.map(v => v[1])),
                                    Math.max.apply(Math, d.properties.NoNutrition.map(v => v[1]))])
                
                yScale.domain([Math.round(min_y)-5, Math.round(max_y)+5]);
                
                svg_plot2.select("g.yAxis")
                		.transition()
                    .duration(1000)
                    .call(yAxis);
                
                var mypath_1 = mylinegen(d.properties.Obesity);
                svg_plot2.append("path")
                   .attr("class", "timeSeries")
                   .attr("d", mypath_1)
                   .attr("fill", "none")
                   .attr("stroke", "red")
                   .attr("stroke-width", "2")
                   .on("mouseover", function(event, d) {  
                	     var coordinates = d3.pointer(event);
                       svg_plot2.append("text")
                         .classed("hover", true)
                         .attr("x", 5+coordinates[0])
                         .attr("y", 5+coordinates[1])
                         .text(d.properties.name); 
                	    
                	  }) 
                	.on("mouseout", function(event,d) {       
                      d3.selectAll("*.hover").remove();  
                    }); 
                   
                var mypath_2 = mylinegen(d.properties.NoActivity);
                svg_plot2.append("path")
                   .attr("class", "timeSeries")
                   .attr("d", mypath_2)
                   .attr("fill", "none")
                   .attr("stroke", "green")
                   .attr("stroke-width", "2"); 
                   
                var mypath_3 = mylinegen(d.properties.NoNutrition);
                svg_plot2.append("path")
                   .attr("class", "timeSeries")
                   .attr("d", mypath_3)
                   .attr("fill", "none")
                   .attr("stroke", "blue")
                   .attr("stroke-width", "2"); 
                 
               })
        	.style("fill", function(d) {
        
          	// Get data value
          	var value = d.properties.color;
          
          	if (value) {
          	//If value exists…
          	return value;
          	} 
          	else {
          	//If value is undefined…
          	return "black"; //"rgb(213,222,217)";
          	}
        	  
        	});
        
        // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
        var legend_1 = svg_plot1.append("g")
              			.attr("class", "legend1")
             			  .attr("width", 140)
            			  .attr("height", 200)
           				  .selectAll("g.legend1")
           				  .data([2,4,6,8,"NA"])
           				  .enter()
           				  .append("g")
           				  .attr("class", "legend1")
             			  .attr("transform", function(d, i) { 
             			    var w = 4*width/5;
             			    var h = 2*height/3 + i*20;
             			    return `translate(${w}, ${h})`; });
        
      	legend_1.append("rect")
       		  .attr("width", 18)
       		  .attr("height", 18)
       		  .style("fill", myColor);
       	
       	svg_plot1.select("g.legend1")
       	      .append("text")
          	  .attr("x", 4*width/5-15)
          	  .attr("y", 2*height/3-15)
          	  .attr("dy", ".35em")
          	  .style("font-size", "14px")
          	  .text("Obesity Percent in 2019");
          	  
      	legend_1.append("text")
      		  .data(legendText_1)
          	  .attr("x", 24)
          	  .attr("y", 9)
          	  .attr("dy", ".35em")
          	  .text(function(d) { return d; });
          	  
        var legend_2 = svg_plot2.append("g")
              			.attr("class", "legend2")
             			  .attr("width", 140)
            			  .attr("height", 200)
           				  .selectAll("g.legend2")
           				  .data(color.domain().slice())
           				  .enter()
           				  .append("g")
           				  .attr("class", "legend2")
             			  .attr("transform", function(d, i) { 
             			    var w = 2*width/3;
             			    var h = height/10 + i*20;
             			    return `translate(${w}, ${h})`; });
        
      	legend_2.append("rect")
       		  .attr("width", 18)
       		  .attr("height", 18)
       		  .style("fill", color);
    
      	legend_2.append("text")
      		  .data(legendText_2)
          	  .attr("x", 24)
          	  .attr("y", 9)
          	  .attr("dy", ".35em")
          	  .text(function(d) { return d; });
        });

});
