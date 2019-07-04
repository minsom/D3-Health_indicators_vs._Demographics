// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {

// if the SVG area isn't empty when the browser loads, remove it and replace it with a resized version of the chart
var svgArea = d3.select("body").select("svg");

// clear svg is not empty
if (!svgArea.empty()) {
  svgArea.remove();
}
// SVG wrapper dimensions are determined by the current width and height of the browser window.
var svgWidth = window.innerWidth*0.8;
var svgHeight = window.innerHeight*0.6;

// margins
var margin = {
  top: 50,
  right: 100,
  bottom: 100,
  left: 100
};

// chart area minus margins
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// create svg container
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// shift everything over by the margins
var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);


// Initial XY Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(acsData, chosenXAxis) {
  // create x scales
  let xLinearScale = d3.scaleLinear()
      .domain([ d3.min(acsData, d => d[chosenXAxis])*0.8,
                d3.max(acsData, d => d[chosenXAxis])*1.2 ])
      .range([0, chartWidth]);
  return xLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}


// function used for updating y-scale var upon click on axis label
function yScale(acsData, chosenYAxis) {
  // create y scales
  var yLinearScale = d3.scaleLinear()
      .domain([ d3.min(acsData, d => d[chosenYAxis])*0.8,
                d3.max(acsData, d => d[chosenYAxis])*1.2 ])
      .range([chartHeight,0]);
  return yLinearScale;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles texts group with a transition
function renderTexts(circlesTextsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesTextsGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis])+5)

  return circlesTextsGroup;
}


/////////////////////////////////////////////////////////////////
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  if (chosenXAxis === "poverty") {
      var xLabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
      var xLabel = "Age (Median)";
  }
  else {
      var xLabel = "Household Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
      var yLabel = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "smokes") {
      var yLabel = "Smokes (%)";
  }
  else {
      var yLabel = "Obese (%)";
  }

  let toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`<strong>${d.state}</strong>
          <br>${xLabel} : ${d[chosenXAxis]}
          <br>${yLabel} : ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
                toolTip.show(data, this);
              })
              // onmouseout event
              .on("mouseout", function(data, index) {
                toolTip.hide(data, this);
              });

  return circlesGroup;
}





d3.csv("./assets/data/data.csv").then(function(acsData) {
  // if (error) return console.warn(error);
  // console.log(acsData);

  // log a list of names
  var states = acsData.map(data => data.state);
  // console.log("states", states);
  var abbrs = acsData.map(data => data.abbr);
  // console.log("abbrs", abbrs);

  // parse data
  acsData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;

  });

  // x & y LinearScale functions above csv import
  var xLinearScale = xScale(acsData, chosenXAxis);
  var yLinearScale = yScale(acsData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    // .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    // .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(acsData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .classed("stateCircle", true)
    .attr("opacity", ".5");
  
  // append initial circle texts
  var circlesTextsGroup = chartGroup.selectAll(".stateText")
    .data(acsData)
    .enter()
    .append("text")
    .text(d=>d.abbr)
    .attr("x", d=> xLinearScale(d[chosenXAxis]))
    .attr("y", d=> yLinearScale(d[chosenYAxis])+5)
    .classed("stateText",true);

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


  // Create group for 3 x-axis labels XXXXXXXXXXXXX
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 10)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for 3 y-axis labels YYYYYYYYYYYY
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 0 - 30)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 0 - 50)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");
        
  var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - 70)
    .attr("x", 0 - (chartHeight / 2))
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  
  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;
        console.log(chosenXAxis)

        // functions here found above csv import updates x scale for new data
        xLinearScale = xScale(acsData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates texts with new x values
        circlesTextsGroup = renderTexts(circlesTextsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }

    });// end xlabelsGroup onClick

  // y axis labels event listener
  ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = value;
        console.log(chosenYAxis)

        // functions here found above csv import updates y scale for new data
        yLinearScale = yScale(acsData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates texts with new x values
        circlesTextsGroup = renderTexts(circlesTextsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }

    });// end ylabelsGroup onClick

  });// end d3.csv

} // makeResponsive()
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);