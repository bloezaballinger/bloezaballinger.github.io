//scene one - line graph showing worst to best city mpg
var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom - 100;

var sceneOne = d3.select('#sceneOne')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

var mpgTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity",0)
    .style("background-color","black")
    .style("padding","3px")
    .style("font-size","20px")
    .style("pointer-events","none")
    .style("position", "absolute");

var engineCylindersTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity",0)
    .style("background-color","black")
    .style("padding","3px")
    .style("font-size","20px")
    .style("pointer-events","none")
    .style("position", "absolute");

var areaChartTooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity",0)
    .style("background-color","black")
    .style("padding","3px")
    .style("font-size","20px")
    .style("pointer-events","none")
    .style("position", "absolute");

var x, y, cityMPGLine, highwayMPGLine, sortedData1, cityPath, highwayPath, cityPath2, highwayPath2;

async function loadSceneOne() {
    d3.csv("https://flunky.github.io/cars2017.csv").then(function (data) {
        //Convert city and highway mpg values to numeric values
        data.forEach(d => {
            d.AverageCityMPG = +d.AverageCityMPG;
            d.AverageHighwayMPG = +d.AverageHighwayMPG;
        });

        //Aggregate data by car make
        var aggregatedData = d3.rollup(
            data,
            v => ({
                AverageCityMPG: d3.mean(v, d => d.AverageCityMPG),
                AverageHighwayMPG: d3.mean(v, d => d.AverageHighwayMPG)
            }),
            d => d.Make
        );

        //Convert aggregated data to an array of objects
        var aggregatedArray = Array.from(aggregatedData, ([Make, values]) => ({Make, ...values}));

        //Sort from worst to best by city MPG
        sortedData1 = aggregatedArray.slice().sort((x, y) => x.AverageCityMPG - y.AverageCityMPG);

        //Make axes
        //X axis
        x = d3.scalePoint()
            .domain(sortedData1.map(d => d.Make))
            .range([0, width]);

        sceneOne.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        // X axis label
        sceneOne.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height + margin.bottom - 10)
            .text("Car Make")
            .style("font-size", "18px")
            .style("fill", "white");

        //Y axis
        y = d3.scaleLinear()
            .domain([d3.min(sortedData1, d => Math.min(d.AverageCityMPG, d.AverageHighwayMPG)) - 5, d3.max(sortedData1, d => Math.max(d.AverageCityMPG, d.AverageHighwayMPG)) + 5])
            .range([height, 0]);

        sceneOne.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "12px");

        // Y axis label
        sceneOne.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - 400)
            .attr("y", -margin.left + 40)
            .text("MPG")
            .style("font-size", "18px")
            .style("fill", "white");

        //Line for City MPG
        cityMPGLine = d3.line()
            .x(d => x(d.Make))
            .y(d => y(d.AverageCityMPG));

        cityPath = sceneOne.append("path")
            .datum(sortedData1)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("d", cityMPGLine);

        //append path to scene two for annotation
        cityPath2 = sceneTwo.append("path")
            .datum(sortedData1)
            .attr("fill", "none")
            .attr("stroke", "#614051")
            .attr("stroke-width", 4)
            .attr("d", cityMPGLine)
            .style("opacity", 0.3)
            .on("mouseover", function(event, d) {
                mpgTooltip.transition()
                    .duration(250)
                    .style("opacity", .8)
                    .style("pointer-events","auto");
                    mpgTooltip.html("City MPG")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                mpgTooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .style("pointer-events","none");
            });

        //Data points for City MPG
        sceneOne.selectAll("circle.city")
            .data(sortedData1)
            .enter()
            .append("circle")
            .attr("class", "city")
            .attr("cx", d => x(d.Make))
            .attr("cy", d => y(d.AverageCityMPG))
            .attr("r", 8)
            .attr("fill", "#614051")
            .on("mouseover", function(event, d) {
                mpgTooltip.transition()
                    .duration(250)
                    .style("opacity", .8);
                mpgTooltip.html("Make: " + d.Make + "<br/>City MPG: " + d.AverageCityMPG)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                mpgTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Sort by highway MPG
        sortedData1.sort((x, y) => x.AverageHighwayMPG - y.AverageHighwayMPG);
        // Update x domain
        x.domain(sortedData1.map(d => d.Make));

        //Line for Highway MPG
        highwayMPGLine = d3.line()
            .x(d => x(d.Make))
            .y(d => y(d.AverageHighwayMPG));

        highwayPath = sceneOne.append("path")
            .datum(sortedData1)
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("d", highwayMPGLine)
            .style("opacity", 0);

        //append to scene two for annotation
        highwayPath2 = sceneTwo.append("path")
            .datum(sortedData1)
            .attr("fill", "none")
            .attr("stroke", "#00A36C")
            .attr("stroke-width", 4)
            .attr("d", highwayMPGLine)
            .style("opacity", 0.3)
            .on("mouseover", function(event, d) {
                mpgTooltip.transition()
                    .duration(250)
                    .style("opacity", .8)
                    .style("pointer-events","auto");
                    mpgTooltip.html("Highway MPG")
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                mpgTooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .style("pointer-events","none");
            });

        //Data points for Highway MPG
        sceneOne.selectAll("circle.highway")
            .data(sortedData1)
            .enter()
            .append("circle")
            .attr("class", "highway")
            .attr("cx", d => x(d.Make))
            .attr("cy", d => y(d.AverageHighwayMPG))
            .attr("r", 8)
            .attr("fill", "#00A36C")
            .style("opacity", 0)
            .style("pointer-events","none")
            .on("mouseover", function(event, d) {
                mpgTooltip.transition()
                    .duration(250)
                    .style("opacity", .8)
                    .style("pointer-events","auto");
                    mpgTooltip.html("Make: " + d.Make + "<br/>Highway MPG: " + d.AverageHighwayMPG)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                mpgTooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .style("pointer-events","none");
            });
    })
}

// Function to switch between City MPG and Highway MPG
function changeMPG(type) {
    if (type === 'city') {
        // Sort by city MPG
        sortedData1.sort((x, y) => x.AverageCityMPG - y.AverageCityMPG);
        
        // Update x domain
        x.domain(sortedData1.map(d => d.Make));
        
        // Transition lines and circles
        cityPath.transition()
            .duration(1000)
            .attr("d", cityMPGLine)
            .style("opacity", 1);

        highwayPath.transition()
            .duration(1000)
            .style("opacity", 0);

        sceneOne.selectAll("circle.city")
            .data(sortedData1)
            .transition()
            .duration(1000)
            .attr("cx", d => x(d.Make))
            .attr("cy", d => y(d.AverageCityMPG))
            .style("opacity", 1)
            .attr("fill", "#614051")
            .style("pointer-events","auto");

        sceneOne.selectAll("circle.highway")
            .data(sortedData1)
            .transition()
            .duration(1000)
            .attr("cx", d => x(d.Make))
            .attr("cy", d => y(d.AverageHighwayMPG))
            .style("opacity", 0)
            .style("pointer-events","none");

    } else if (type === 'highway') {
        // Sort by highway MPG
        sortedData1.sort((x, y) => x.AverageHighwayMPG - y.AverageHighwayMPG);
        
        // Update x domain
        x.domain(sortedData1.map(d => d.Make));
        
        // Transition lines and circles
        cityPath.transition()
            .duration(1000)
            .style("opacity", 0);

        highwayPath.transition()
            .duration(1000)
            .attr("d", highwayMPGLine)
            .style("opacity", 1);

        sceneOne.selectAll("circle.city")
            .data(sortedData1)
            .transition()
            .duration(1000)
            .attr("cx", d => x(d.Make))
            .attr("cy", d => y(d.AverageCityMPG))
            .style("opacity", 0)
            .style("pointer-events","none");

        sceneOne.selectAll("circle.highway")
            .data(sortedData1)
            .transition()
            .duration(1000)
            .attr("cx", d => x(d.Make))
            .attr("cy", d => y(d.AverageHighwayMPG))
            .style("opacity", 1)
            .attr("fill", "#00A36C")
            .style("pointer-events","auto");
    }
}

//Scene Two - bar chart showing numnber of engine cylinders for brands
var sceneTwo = d3.select('#sceneTwo')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

function loadSceneTwo() {
    d3.csv("https://flunky.github.io/cars2017.csv").then(function (data) {
        //convert number of engine cylinders to numeric values
        data.forEach(d => {
            d.EngineCylinders = +d.EngineCylinders;
        });

        //aggregate data
        var aggregatedData = d3.rollup(
            data, v => ({
                EngineCylinders: d3.mean(v, d => d.EngineCylinders)
            }),
            d => d.Make
        );

        //convert aggregated data to array
        var aggregatedArray = Array.from(aggregatedData, ([Make, values]) => ({Make, ...values}));

        //sort data using same sort as previous graph for consistency
        sortedData2 = sortedData1.map(d => ({
            Make: d.Make,
            EngineCylinders: aggregatedArray.find(a => a.Make === d.Make)?.EngineCylinders
        }));

        //make axes
        //x axis
        x = d3.scalePoint()
            .domain(sortedData2.map(d => d.Make))
            .range([0, width])
            .padding(0.5);

        //append x axis
        sceneTwo.append("g")
            .attr("class","x-axis-bar")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "12px");

        // X axis label
        sceneTwo.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height + margin.bottom - 10)
            .text("Car Make")
            .style("font-size", "18px")
            .style("fill", "white");

        //y axis
        var yBar = d3.scaleLinear()
            .domain([0, d3.max(sortedData2, d => d.EngineCylinders)])
            .range([height, 0]);

        //append y axis
        sceneTwo.append("g")
            .attr("class", "y-axis-bar")
            .call(d3.axisLeft(yBar))
            .selectAll("text")
            .style("font-size", "12px");

        // Y axis label
        sceneTwo.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("x", -margin.top - 400)
            .attr("y", -margin.left + 40)
            .text("Number of Engine Cylinders")
            .style("font-size", "18px")
            .style("fill", "white");

        //add bars
        sceneTwo.selectAll(".bar")
            .data(sortedData2)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.Make) - 5)
            .attr("y", d => yBar(d.EngineCylinders))
            .attr("width", 10)
            .attr("height", d => height - yBar(d.EngineCylinders))
            .attr("fill", "#cf7302")
            .on("mouseover", function(event, d) { // Add tooltips
                engineCylindersTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                    engineCylindersTooltip.html("Make: " + d.Make + "<br/>Cylinders: " + d.EngineCylinders)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                engineCylindersTooltip.transition()
                    .duration(500)
                    .style("opacity", 0)
            });
    })
}

//Scene Three - area chart showing mpg for various fuel types
var sceneThree = d3.select('#sceneThree');

var currentMPGType = "Gasoline";
async function loadSceneThree() {
    d3.csv("https://flunky.github.io/cars2017.csv").then(function (data) {
        
        // Convert MPG values to numeric
        data.forEach(d => {
            d.AverageCityMPG = +d.AverageCityMPG;
            d.AverageHighwayMPG = +d.AverageHighwayMPG;
        });

        // Aggregate data
        var aggregatedData = d3.rollups(
            data,
            v => ({
                maxMPG: d3.max(v, d => Math.max(d.AverageCityMPG, d.AverageCityMPG)),
                minMPG: d3.min(v, d => Math.min(d.AverageCityMPG, d.AverageCityMPG))
            }),
            d => d.Fuel
        );

        // Create table and header
        var table = d3.select("#sceneThree").append("table");
        var header = table.append("thead").append("tr");

        // Append headers
        header.append("th").text("Fuel Type").attr("class", "custom-header");
        header.append("th").text("Max MPG").attr("class", "custom-header");
        header.append("th").text("Min MPG").attr("class", "custom-header");

        // Append data rows
        var tbody = table.append("tbody");

        aggregatedData.forEach(d => {
            var row = tbody.append("tr");

            row.append("td").text(d[0]).attr("class", "custom-cell-fuel");
            row.append("td").text(d[1].maxMPG).attr("class", "custom-cell").style("color", "#614051");
            row.append("td").text(d[1].minMPG).attr("class", "custom-cell").style("color", "#614051");
        });
    }).catch(error => {
        console.error("Error loading the CSV file:", error);
    });
}

// Function to update table
function updateTable(newMPGType) {
    d3.csv("https://flunky.github.io/cars2017.csv").then(function (data) {
        
        // Convert MPG values to numeric
        data.forEach(d => {
            d.AverageCityMPG = +d.AverageCityMPG;
            d.AverageHighwayMPG = +d.AverageHighwayMPG;
        });

        // Clear existing table
        d3.select("#sceneThree").select("table").remove();

        // Aggregate data
        var aggregatedData = d3.rollups(
            data,
            v => ({
                maxMPG: d3.max(v, d => d[newMPGType]),
                minMPG: d3.min(v, d => d[newMPGType])
            }),
            d => d.Fuel
        );

        // Create table and header
        var table = d3.select("#sceneThree").append("table");
        var header = table.append("thead").append("tr");

        // Append headers
        header.append("th").text("Fuel Type").attr("class", "custom-header");
        header.append("th").text("Max MPG").attr("class", "custom-header");
        header.append("th").text("Min MPG").attr("class", "custom-header");

        // Append data rows
        var tbody = table.append("tbody");

        var fontColor = "#614051";
        if(newMPGType == "AverageCityMPG"){
            var fontColor = "#614051";
        }
        else{
            var fontColor = "#00A36C";
        }

        aggregatedData.forEach(d => {
            var row = tbody.append("tr");

            row.append("td").text(d[0]).attr("class", "custom-cell");
            row.append("td").text(d[1].maxMPG).attr("class", "custom-cell").style("color", fontColor);
            row.append("td").text(d[1].minMPG).attr("class", "custom-cell").style("color", fontColor);
        });
    });
}

//navbar functionality
window.onscroll = function() {makeSticky()};

var navbar = document.querySelector('.navbar');
var sticky = navbar.offsetTop + 250;

function makeSticky() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}