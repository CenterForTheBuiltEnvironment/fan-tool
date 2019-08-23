/// once all content has loaded, perform first solutions calc
$(document).ready(function() {
  // load parameters from url query string if represent
  // otherwise use default parameters
  url_components = document.URL.split("?")
  if (url_components.length > 1) {
    stored = atob(url_components[1]);
    loadStateFromJSON(stored);
  } else {
    // var p = p_default;
    // initial guess at unit system based on user browser language
    if (navigator.language == "en-US") {
      $("#units2").trigger("click");
    };
  }
  updateSliderDisplays();
  updateSolutions();
});

// save parameter state on button click
$( "#save" ).button().on( "click", function() {
  // store fan data in parameters
  p.fanTableData = tblFans.data().toArray();
  localStorage.setItem('parameters', JSON.stringify(p));
  alert("State saved in local browser session.")
});

// load parameter state from local session storage
$( "#load" ).button().on( "click", function() {
  loadStateFromJSON(localStorage.getItem('parameters'));
});

$( "#share" ).button().on( "click", function() {
  var b64p = btoa(JSON.stringify(p));
  url_components = document.URL.split("?")
  new_url = url_components[0] + "?" + b64p
  copyToClipboard(new_url)
});


// prompt user to copy from prompt to clipboard
function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C (or Cmd+C on Apple/Mac)", text);
}

function loadStateFromJSON(storedJSON){
  //saved_p = JSON.parse(stored);
  //handle case where saved unit system don't match current displayed unit system
  if (JSON.parse(storedJSON).isSIunits){
    $("#units1").trigger("click");
  } else{
    $("#units2").trigger("click");
  }
  if (JSON.parse(storedJSON).isSeated){
    $("#posture1").trigger("click");
  } else{
    $("#posture2").trigger("click");
  }

  // set sliders to parameter values, update sliders, and calc solutions
  // set single value sliders
  $("#slider-wid-min").slider('value',JSON.parse(storedJSON).width)
  $("#slider-len-min").slider('value',JSON.parse(storedJSON).length)
  $("#slider-hei-min").slider('value',JSON.parse(storedJSON).height)
  $("#slider-aspectRatio-min").slider('value',JSON.parse(storedJSON).aspectRatio)
  $("#slider-fan-speed-min").slider('value',JSON.parse(storedJSON).fanSpeed)
  $("#slider-mount-distance-max").slider('value',JSON.parse(storedJSON).mountDistance)
  // set doal value sliders
  $("#slider-dimless").slider('values', 0, JSON.parse(storedJSON).dimensionlessDiameter[0])
  $("#slider-dimless").slider('values', 1, JSON.parse(storedJSON).dimensionlessDiameter[1])
  $("#slider-cellSize").slider('values', 0, JSON.parse(storedJSON).cellSize[0])
  $("#slider-cellSize").slider('values', 1, JSON.parse(storedJSON).cellSize[1])
  $("#slider-num-fans").slider('values', 0, JSON.parse(storedJSON).numFans[0])
  $("#slider-num-fans").slider('values', 1, JSON.parse(storedJSON).numFans[1])
  $("#slider-uniformity").slider('values', 0, JSON.parse(storedJSON).uniformity[0])
  $("#slider-uniformity").slider('values', 1, JSON.parse(storedJSON).uniformity[1])
  $("#slider-min-air-speed").slider('values', 0, JSON.parse(storedJSON).minAirSpeed[0])
  $("#slider-min-air-speed").slider('values', 1, JSON.parse(storedJSON).minAirSpeed[1])
  $("#slider-avg-air-speed").slider('values', 0, JSON.parse(storedJSON).avgAirSpeed[0])
  $("#slider-avg-air-speed").slider('values', 1, JSON.parse(storedJSON).avgAirSpeed[1])
  $("#slider-max-air-speed").slider('values', 0, JSON.parse(storedJSON).maxAirSpeed[0])
  $("#slider-max-air-speed").slider('values', 1, JSON.parse(storedJSON).maxAirSpeed[1])
  $("#slider-blade-height").slider('values', 0, JSON.parse(storedJSON).bladeHeight[0])
  $("#slider-blade-height").slider('values', 1, JSON.parse(storedJSON).bladeHeight[1])

  // reload fan data into table
  tblFans.clear();
  tblFans.rows.add(JSON.parse(storedJSON).fanTableData).draw();
  if (JSON.parse(storedJSON).selectedCandidateFanIDs.length >0 ) {
    for (i in JSON.parse(storedJSON).selectedCandidateFanIDs) {
      $('#fans tbody tr:eq(' + JSON.parse(storedJSON).selectedCandidateFanIDs[i] + ')').click();
    }
  }
  updateSliderDisplays();
  updateSolutions();
  // reselect chosen solution
  if (JSON.parse(storedJSON).selectedSolutionID >0 ) {
    $('#solutions tbody tr:eq(' + JSON.parse(storedJSON).selectedSolutionID + ')').click();
  }

  p = JSON.parse(storedJSON);

}



// define default parameter state
const p_default = {
  'cellSize': [4.572, 15.24],
  'minAirSpeed': [0.5, 4.0],
  'avgAirSpeed': [0.5, 4.0],
  'maxAirSpeed': [0.5, 4.0],
  'uniformity': [0.3, 1.0],
  'numFans':[1,10],
  'diameter':[1.2192, 4.2672],
  'bladeHeight' : [2.1336, 3.048],
  'ceilingHeight' : [2.7432, 4.572],
  'dimensionlessDiameter':[0.2, 0.5],
  "length" : 15,
  "width" : 18,
  "height" : 3.7,
  "aspectRatio" : 1.25,
  "mountDistance" : 0.2,
  "fanSpeed" : 100,
  "isSIunits" : true,
  "isSeated" : true,
  "fanTableData" : [
    ['TypeA', 1.2192,   2.611757, true],
    ['TypeB', 1.319784, 2.258268, true],
    ['TypeC', 1.524,    3.765196, true],
    ['TypeD', 1.524,    3.826077, true],
    ['TypeE', 2.1336,   7.734745, true],
    ['TypeF', 2.4384,   13.80304, false],
    ['TypeG', 2.4384,   16.57101, false],
    ['TypeH', 3.048,    20.91151, false],
    ['TypeI', 4.2672,   25.30817, false]
  ],
  "selectedSolutionID" : [],
  "selectedCandidateFanIDs" :[],
}
var p = p_default;

// initialize empty objects to hold objects generated from the above parameter
// selection
var room = [];
var candidateFans = [];
var solutions = [];
var scale = 0;

// create common imperial unit defintions
math.createUnit('cfm', '1 ft*ft*ft/min');
math.createUnit('fpm', '1 ft/min');
math.createUnit( {
  degC: {
    prefixes: 'long'
  },
  degF: '1.8 * degC'
},
{
  override: true
})
// create function that returns an input SI unit as a string with units
// in the selected unit system
function unitToString (valueSI, measurement, displayUnit=true){
  if (displayUnit){
    if (measurement === "distance"){
      return math.format(math.unit(valueSI,"m").to(p.isSIunits ? "m" : "ft"),3);
    };
    if (measurement === "flowrate"){
      return math.format(math.unit(valueSI,"m^3/s").to(p.isSIunits ? "m^3/s" : "cfm"),3);
    };
    if (measurement === "speed"){
      return math.format(math.unit(valueSI,"m/s").to(p.isSIunits ? "m/s" : "fpm"),3);
    };
    if (measurement === "deltaT"){
      return p.isSIunits ? valueSI.toFixed(1) + " °C" : (valueSI * 1.8).toFixed(1) + " °F" ;
    };
  } else {
    if (measurement === "distance"){
      return math.unit(valueSI,"m").to(p.isSIunits ? "m" : "ft").toNumber().toFixed(1);
    };
    if (measurement === "flowrate"){
      return math.unit(valueSI,"m^3/s").to(p.isSIunits ? "m^3/s" : "cfm").toNumber().toFixed(1);
    };
    if (measurement === "speed"){
      return math.unit(valueSI,"m/s").to(p.isSIunits ? "m/s" : "fpm").toNumber().toFixed(p.isSIunits ? 2 : 0);
    };
    if (measurement === "deltaT"){
      return p.isSIunits ? valueSI.toFixed(1) : (valueSI * 1.8).toFixed(1);
    };
  }
};

// defines left pane accordion setup
$( "#accordion" ).accordion({
  collapsible: true,
  heightStyle: "content"
});


// add tooltips (based on 'title')
$( function() {
  $( document ).tooltip();
} );


// add all sliders (double values - ranges)
$( "#slider-dimless" ).slider({
  range: true,
  min: 0.15,
  max: 0.60,
  values: p.dimensionlessDiameter,
  step: 0.01,
  slide: function( event, ui ) {
    p.dimensionlessDiameter = ui.values;
    $( "#dimless" ).val( ui.values[ 0 ] + " - "  + ui.values[ 1 ]);
  }
});
$( "#dimless" ).val( $( "#slider-dimless" ).slider( "values", 0 ) +
" - " + $( "#slider-dimless" ).slider( "values", 1 ));

$( "#slider-num-fans" ).slider({
  range: true,
  min: 1,
  max: 10,
  values: p.numFans,
  step: 1,
  slide: function( event, ui ) {
    p.numFans = ui.values;
    $( "#num-fans" ).val( ui.values[ 0 ] + " - "  + ui.values[ 1 ]);
  }
});
$( "#num-fans" ).val( $( "#slider-num-fans" ).slider( "values", 0 ) +
" - " + $( "#slider-num-fans" ).slider( "values", 1 ));

$( "#slider-uniformity" ).slider({
  range: true,
  min: 0.0,
  max: 1.0,
  values: p.uniformity,
  step: 0.05,
  slide: function( event, ui ) {
    p.uniformity = ui.values;
    $( "#uniformity" ).val( ui.values[ 0 ] + " - "  + ui.values[ 1 ]);
  }
});
$( "#uniformity" ).val( $( "#slider-uniformity" ).slider( "values", 0 ) +
" - " + $( "#slider-uniformity" ).slider( "values", 1 ));

$( "#slider-blade-height" ).slider({
  range: true,
  min: 2.15,
  max: 4.5,
  values: p.bladeHeight,
  step: 0.05,
  slide: function( event, ui ) {
    p.bladeHeight = ui.values;
    updateSliderDisplays();
  }
});


$( "#slider-cellSize" ).slider({
  range: true,
  min: 4.5,
  max: 15.24,
  values: p.cellSize,
  step: 0.1,
  slide: function( event, ui ) {
    p.cellSize = ui.values;
    updateSliderDisplays();
  }
});

$( "#slider-min-air-speed" ).slider({
  range: true,
  min: 0.2,
  max: 4.0,
  values: p.minAirSpeed,
  step: 0.05,
  slide: function( event, ui ) {
    p.minAirSpeed = ui.values;
    updateSliderDisplays();
  }
});

$( "#slider-avg-air-speed" ).slider({
  range: true,
  min: 0.2,
  max: 4.0,
  values: p.avgAirSpeed,
  step: 0.05,
  slide: function( event, ui ) {
    p.avgAirSpeed = ui.values;
    updateSliderDisplays();
  }
});

$( "#slider-max-air-speed" ).slider({
  range: true,
  min: 0.2,
  max: 4.0,
  values: p.maxAirSpeed,
  step: 0.05,
  slide: function( event, ui ) {
    p.maxAirSpeed = ui.values;
    updateSliderDisplays();
  }
});

// add all sliders (single values)
$( "#slider-aspectRatio-min" ).slider({
  range: "min",
  value: p.aspectRatio,
  min: 1,
  max: 1.5,
  step: 0.01,
  slide: function( event, ui ) {
    p.aspectRatio = ui.value;
    $( "#aspectRatio" ).val( ui.value );
  }
});
$( "#aspectRatio" ).val( $( "#slider-aspectRatio-min" ).slider( "value" ) );

$( "#slider-mount-distance-max" ).slider({
  range: "max",
  value: p.mountDistance,
  min: 0,
  max: 1,
  step: 0.01,
  slide: function( event, ui ) {
    p.mountDistance = ui.value;
    $( "#mount-distance" ).val( ui.value );
  }
});
$( "#mount-distance" ).val( $( "#slider-mount-distance-max" ).slider( "value" ) );


$( "#slider-fan-speed-min" ).slider({
  range: "min",
  value: p.fanSpeed,
  min: 10,
  max: 100,
  step: 1,
  slide: function( event, ui ) {
    p.fanSpeed = ui.value;
    $( "#fan-speed-min" ).val( ui.value + "%" );
  }
});
$( "#fan-speed-min" ).val( $( "#slider-fan-speed-min" ).slider( "value" ) + "%" );


$( "#slider-len-min" ).slider({
  range: "min",
  value: p.length,
  min: 4.5,
  max: 50,
  step: 0.1,
  slide: function( event, ui ) {
    p.length = ui.value;
    updateSliderDisplays();
  }
});

$( "#slider-wid-min" ).slider({
  range: "min",
  value: p.width,
  min: 4.5,
  max: 50,
  step: 0.1,
  slide: function( event, ui ) {
    p.width = ui.value;
    updateSliderDisplays();
  }
});

$( "#slider-hei-min" ).slider({
  range: "min",
  value: p.height,
  min: 2.7,
  max: 4.5,
  step: 0.05,
  slide: function( event, ui ) {
    p.height = ui.value;
    updateSliderDisplays();
  }
});

$( ":radio" ).checkboxradio({
  icon: false
});

var tblFans = $('#fans').DataTable( {
  data: p.fanTableData,
  destroy: true,
  scrollY: "200px",
  stateSave: true,
  scrollCollapse: true,
  paging: false,
  searching: false,
  info: false,
  columnDefs: [{
    targets: [1,2],
    render: $.fn.dataTable.render.number(',', '.', 2)
  }],
  columns: [
    { title: "Type" },
    { title: "D (m)" },
    { title: "Q (m³/s)" },
    { title: "UL507" }
  ]
} );

// select/deselect rows when clicked
$('#fans tbody').on( 'click', 'tr', function () {
  $(this).toggleClass('selected');
} );

// whenever a fan is selected/deselected
// update fans object and calculate solutions
$('#fans tbody').on( 'click', function () {
  updateCandidateFans();
} );


// delete all selected fans from the table
$( "#delete-fan" ).button().on( "click", function() {
  for (i in tblFans.rows('.selected')[0]) {
    tblFans.row(".selected").remove().draw();
  }
  updateCandidateFans();
});

// reset all fans in table to defaults
$( "#reset-fan" ).button().on( "click", function() {
  // reload fan data into table
  tblFans.clear();
  tblFans.rows.add(p_default.fanTableData).draw();
  updateCandidateFans();
});


// update the candidate fans (i.e. those selected in the fan table)
// and update the solutions
function updateCandidateFans(){
  p.selectedCandidateFanIDs = tblFans.rows('.selected')[0]
  candidateFans =[];
  tblFans.rows('.selected').data().each( function(row,index) {
    var t = row[0];
    var d = row[1];
    var a = row[2];
    var u = row[3];
    if (!p.isSIunits){
      // convert units to SI before creating fan objects
      d *= math.unit("1 ft").toNumber("m");
      a *= math.unit("1 cfm").toNumber("m3/s");
    }
    candidateFans.push(new Fan(t,d,a,u));
  });
  updateSolutions();
};

// table to display all viable solutions that meet the user input criteria
var tblSln = $('#solutions').DataTable( {
  data: [],
  language: {
    emptyTable: "No solutions. Please ensure you have selected at least one fan type. Relax constraints if needed."
  },
  destroy: true,
  paging: false,
  scrollY: "200px",
  searching: false,
  info: true,
  lengthChange: false,
  pageLength: 10,
  columnDefs: [{
    targets: [2,3,4,5],
    render: $.fn.dataTable.render.number(',', '.', 2)
  }],
  columns: [
    { title: "Fan type" },
    { title: "# fans" },
    { title: "Min airspeed (m/s)" },
    { title: "Avg airspeed (m/s)" },
    { title: "Max airspeed (m/s)" },
    { title: "Uniformity" },
    { title: "Cell aspect ratio" },
  ]
} );

// allow only one solution to be selected at a time
$('#solutions tbody').on( 'click', 'tr', function () {
  if ( $(this).hasClass('selected') ) {
    $(this).removeClass('selected');
  }
  else {
    tblSln.$('tr.selected').removeClass('selected');
    $(this).addClass('selected');
  }
} );

// update selected solution and draw it on the display
$('#solutions tbody').on( 'click', function () {
  drawRoom();
  if (tblSln.rows('.selected').data().length > 0 ){
    p.selectedSolutionID = tblSln.rows('.selected')[0][0]
    drawFans();
  };
} );

// update inputs associated with slider movement and
// update the solutions based on the new inputs
$('.ui-slider').mouseup(function () {
  updateSliderDisplays();
  updateSolutions();
});


// update the solutions on any change of input
// $(':input').change(function () {
//   // updateSolutions();
// });

// change units and store state on click
$("#units1, #units2").change(function () {
  p.isSIunits = $("#units1")[0].checked;
  changeUnits();
});

// change posture and store state on click
$("#posture1, #posture2").change(function () {
  p.isSeated = $("#posture1")[0].checked;
  updateSolutions();
});


// recalculate the solutions, clear the floor plan, update the solutions table
function updateSolutions() {
  calcSolutions();
  drawRoom();
  updateSlnTable();
};

// update the solutions table to match the currently calculated set of
// solutions
function updateSlnTable(){
  tblSln.clear();
  tblData = [];
  conv = (p.isSIunits) ? 1 : math.unit("1 m/s").toNumber("fpm");
  for (i of solutions){
    tblData.push([
      i.fan.type,
      i.layout.numFans(),
      i.airspeeds[0] * conv,
      i.airspeeds[1] * conv,
      i.airspeeds[2] * conv,
      i.uniformity,
      i.layout.aspectRatio.toFixed(2),
    ]);
  }
  tblSln.rows.add(tblData).draw();
  // select first solution if any solutions exist
  if (solutions.length >0 ) $('#solutions tbody tr:eq(0)').click();
};


// update the input display associated with each slider,
// accounting for different unit systems and measurements
function updateSliderDisplays(){
  $( "#wid" ).val(unitToString($( "#slider-wid-min" ).slider( "value" ),"distance"))
  $( "#len" ).val(unitToString($( "#slider-len-min" ).slider( "value" ),"distance"))
  $( "#hei" ).val(unitToString($( "#slider-hei-min" ).slider( "value" ),"distance"))

  $( "#cellSize" ).val(
    unitToString($( "#slider-cellSize" ).slider( "values", 0 ), "distance",false)
    +  " - " +
    unitToString($( "#slider-cellSize" ).slider( "values", 1 ), "distance")
  );
  $( "#blade-height" ).val(
    unitToString($( "#slider-blade-height" ).slider( "values", 0 ), "distance",false)
    +  " - " +
    unitToString($( "#slider-blade-height" ).slider( "values", 1 ), "distance")
  );
  $( "#min-air-speed" ).val(
    unitToString($( "#slider-min-air-speed" ).slider( "values", 0 ), "speed",false)
    +  " - " +
    unitToString($( "#slider-min-air-speed" ).slider( "values", 1 ), "speed")
  );
  $( "#avg-air-speed" ).val(
    unitToString($( "#slider-avg-air-speed" ).slider( "values", 0 ), "speed",false)
    +  " - " +
    unitToString($( "#slider-avg-air-speed" ).slider( "values", 1 ), "speed")
  );
  $( "#max-air-speed" ).val(
    unitToString($( "#slider-max-air-speed" ).slider( "values", 0 ), "speed",false)
    +  " - " +
    unitToString($( "#slider-max-air-speed" ).slider( "values", 1 ), "speed")
  );
}


// update unit system displayed everywhere in the web tool
// and save the state
function changeUnits () {
  p.isSIunits  = $("[name='units']")[0].checked
  // update table column names

  if (p.isSIunits) {
    $(tblFans.column(1).header()).text('D (m)');
    $(tblFans.column(2).header()).text('Q (m³/s)');
    $(tblSln.column(2).header()).text('Min airspeed (m/s)');
    $(tblSln.column(3).header()).text('Avg airspeed (m/s)');
    $(tblSln.column(4).header()).text('Max airspeed (m/s)');
    // update the data in each column
    tblFans.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
      var data = this.data();
      data[1] *= math.unit("1 ft").toNumber("m");
      data[2] *= math.unit("1 cfm").toNumber("m^3/s");
      this.data(data);
    });
  } else {
    $(tblFans.column(1).header()).text('D (ft)');
    $(tblFans.column(2).header()).text('Q (cfm)');
    $(tblSln.column(2).header()).text('Min airspeed (fpm)');
    $(tblSln.column(3).header()).text('Avg airspeed (fpm)');
    $(tblSln.column(4).header()).text('Max airspeed (fpm)');
    // update the data in each column
    tblFans.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
      var data = this.data();
      data[1] *= math.unit("1 m").toNumber("ft");
      data[2] *= math.unit("1 m3/s").toNumber("cfm");
      this.data(data);
    });
  }
  updateSliderDisplays();
  updateSlnTable();
};


// calculate the new set of solutions given the user inputs
function calcSolutions(){
  // instantiate a new room object using the selected dimensions
  room = new Room($( "#slider-hei-min" ).slider("value"),
  $( "#slider-len-min" ).slider("value"),
  $( "#slider-wid-min" ).slider("value"))

  /* function to ensure that the resulting size of the fan 'cell' in either the
  X  or Y direction is within the limits of the underlying data set.
  Avoids looping through an unecessarily large 2d array Layout objects
  */
  testLims = function(value, index, testArray, )  {
    return value >= p.cellSize[0]*Math.sqrt(1/p.aspectRatio) &&
    value <= p.cellSize[1]*Math.sqrt(p.aspectRatio);
  }

  candidateNumFans = []
  for (n=p.numFans[0]; n<=p.numFans[1]; n++){
    candidateNumFans.push(n);
  }
  var validNumFansX = candidateNumFans.map(n => room.sizeX/n).filter(testLims).map(n => room.sizeX / n);
  var validNumFansY = candidateNumFans.map(n => room.sizeY/n).filter(testLims).map(n => room.sizeY / n);

  /* create an array of all candidate layouts that fit within the limitations
  that relate to interactions between room and room objects.
  This consists of ensuring that the size and shape of an individual fan 'cell'
  are within the constraints provided.
  */
  layouts = [];
  failAspectRatio = 0;
  failCellSize = [0,0];
  for (i = 0; i < validNumFansX.length; i++) {
    for (j = 0; j < validNumFansY.length; j++) {
      // instantiate a candidate solution
      candidate = new Layout(validNumFansX[i],validNumFansY[j], room);
      // test to see if it meets validity criteria
      if (candidate.aspectRatio >= p.aspectRatio){
        failAspectRatio++;
        continue;
      };
      if (candidate.r <= p.cellSize[0]){
        failCellSize[0]++;
        continue;
      };
      if (candidate.r >= p.cellSize[1]){
        failCellSize[1]++;
        continue;
      };
      layouts.push(candidate);
    };
  };
  console.log(`${layouts.length} viable layouts, ${failAspectRatio} failed on aspect ratio, (${failCellSize}) failed on min,max cell size`);
  console.log(layouts);
  /* create an array of all candidate solutions that fit within the limitations
  that relate interactions between layout and fan objects.
  */
  solutions = [];
  failDimensionlessDiameter = [0,0];
  failMinAirspeed = [0,0];
  failAvgAirspeed = [0,0];
  failMaxAirspeed = [0,0];
  failUniformity = [0,0];
  for (i = 0; i < layouts.length; i++) {
    for (j = 0; j < candidateFans.length; j++) {
      // instantiate a candidate solution
      candidate = new Solution(layouts[i],candidateFans[j],p.fanSpeed,p.bladeHeight,p.mountDistance);
      // test to see if it meets validity criteria
      if (candidate.dr <= p.dimensionlessDiameter[0]){
        failDimensionlessDiameter[0]++;
        continue;
      };
      if (candidate.dr >= p.dimensionlessDiameter[1]){
        failDimensionlessDiameter[1]++;
        continue;
      };
      if (candidate.airspeeds[0] <= p.minAirSpeed[0]){
        failMinAirspeed[0]++;
        continue;
      };
      if (candidate.airspeeds[0] >= p.minAirSpeed[1]){
        failMinAirspeed[1]++;
        continue;
      };
      if (candidate.airspeeds[1] <= p.avgAirSpeed[0]){
        failAvgAirspeed[0]++;
        continue;
      };
      if (candidate.airspeeds[1] >= p.avgAirSpeed[1]){
        failAvgAirspeed[1]++;
        continue;
      };
      if (candidate.uniformity <= p.uniformity[0]){
        failUniformity[0]++;
        continue;
      };
      if (candidate.uniformity >= p.uniformity[1]){
        failUniformity[1]++;
        continue;
      };
      if (!candidate.validBladeHeightRange['pass']) {
        continue;
      };
      solutions.push(candidate);
    };
  };
  console.log(failDimensionlessDiameter + " failed on [min, max] dimensionless diameter");
  console.log(solutions);
  console.log("Total number of viable solutions: " + solutions.length);

  var numsFans = solutions.map(function(elt) {return elt.layout.numFans();});

  /* TODO Develop methods to select for various design cases given
  a set of constraints:
  most/least # numFans - potentially also cost based?
  Smallest/Largest diameter numFans
  Highest/lowest numFans
  most/least uniformity ranked based on squareness, larger D/R ratio, larger D
  */
}


// draw an empty room
function drawRoom() {
  var canvas = document.getElementById('canv');
  // Execute only if canvas is supported
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d')
    //clear plan after each solution selection
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scale = Math.min(
      (canvas.width-20)/room.sizeX,
      (canvas.height-20)/room.sizeY
    );
    // draw the room in plan
    ctx.beginPath();
    ctx.setLineDash([1, 0])
    ctx.rect(10,10, room.sizeX*scale,room.sizeY*scale);
    ctx.stroke();
    ctx.closePath();

  } else {
    alert("Your browser doesn't support HTML 5 Canvas");
  }
}

// draw the fans on the floor plan, along with some information about
// about the selected solution
function drawFans() {
  var canvas = document.getElementById('canv');
  // Execute only if canvas is supported
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d')
    // get selected solution
    sln = solutions[p.selectedSolutionID];

    // scaled sized for fan radius, cellX and cellY
    fan_rad = scale * sln.fan.diameter / 2
    cellX = scale * sln.layout.cellSizeX
    cellY = scale * sln.layout.cellSizeY
    margin = 10
    font = 14
    line_spacing = font + 2

    // display basic information about the layout on top right
    ctx.font = `${font}px sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle='black';
    ctx.fillText(`${sln.layout.numFans()} ${sln.fan.type} fan${sln.layout.numFans() - 1 ? "s" :""}`,
    room.sizeX*scale,
    margin + line_spacing);

    ctx.fillText(`At max fan speed can increase`,
    room.sizeX*scale,
    margin + room.sizeY*scale - 2 * line_spacing);
    ctx.fillText(`temperature by ${unitToString(sln.tempDiffs[0], "deltaT")}`,
    room.sizeX*scale,
    margin + room.sizeY*scale - 1 * line_spacing);

    // ctx.fillText(`Approximate airspeeds in the room:`,
    // 2 * margin + room.sizeX*scale,
    // margin + 3 * line_spacing);
    //
    // ctx.fillText(`Minimum: ${unitToString(sln.airspeeds[0], "speed")}`,
    // 2 * margin + room.sizeX*scale,
    // margin + 4 * line_spacing);
    //
    // ctx.fillText(`Area-weighted average: ${unitToString(sln.airspeeds[1], "speed")}`,
    // 2 * margin + room.sizeX*scale,
    // margin + 5 * line_spacing);
    //
    // ctx.fillText(`Maximum : ${unitToString(sln.airspeeds[2], "speed")}`,
    // 2 * margin + room.sizeX*scale,
    // margin + 6 * line_spacing);
    //
    // ctx.fillText(`Uniformity : ${sln.uniformity`,
    // 2 * margin + room.sizeX*scale,
    // margin + 8 * line_spacing);




    // add diameter and units below-right of first fan
    ctx.textAlign = "center";
    ctx.fillStyle='grey';
    ctx.fillText(
      `Ø ${unitToString(sln.fan.diameter, "distance")}`,
      margin + fan_rad + (0.5 * cellX) + (0.75 * font),
      margin + fan_rad + (0.5 * cellY) + (0.75 * font)
    );

    // add clearanceX to first fan
    ctx.beginPath();
    ctx.moveTo(margin, margin + cellY/2);
    ctx.lineTo(margin + cellX/2 - fan_rad, margin + cellY/2);
    // ctx.closePath();
    ctx.lineWidth=1;
    ctx.strokeStyle='grey';
    ctx.setLineDash([5,5])
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillText(
      `${unitToString(sln.clearanceX(), "distance")}`,
      margin + font/2,
      margin + cellY/2 + 1* font
    );
    ctx.fillText(
      `clear`,
      margin + font/2,
      margin + cellY/2 + 2 * font
    );

    // add clearanceY to first fan
    ctx.beginPath();
    ctx.moveTo(margin + cellX/2, margin);
    ctx.lineTo(margin + cellX/2, margin + cellY/2 - fan_rad);
    // ctx.closePath();
    ctx.lineWidth=1;
    ctx.strokeStyle='grey';
    ctx.setLineDash([5,5])
    ctx.stroke();
    ctx.textAlign = "left";
    ctx.fillText(
      `${unitToString(sln.clearanceY(), "distance")}`,
      margin + cellX/2 + 0.5 * font,
      margin + font
    );
    ctx.fillText(
      `clear`,
      margin + cellX/2 + 0.5 * font,
      margin + 2 * font
    );

    //draw fans and dimensions between fans
    i = 0;
    j = 0;
    inner_rad = fan_rad/30;
    blades = sln.fan.diameter > 2.2 ? 6 : 3;
    rot = Math.PI/2*3;
    step = Math.PI/blades;
    for (i = 0; i < sln.layout.numFansX; i++){
      // at least 2 fans in x direction, show on center spacing
      // between last fan and second last
      if (i > 0 & i == sln.layout.numFansX - 1){
        ctx.beginPath();
        ctx.moveTo(margin + (i - 0.5)*cellX, margin + 0.5*cellY);
        ctx.lineTo(margin + (i + 0.5)*cellX, margin + 0.5*cellY);
        // ctx.closePath();
        ctx.lineWidth=1;
        ctx.strokeStyle='grey';
        ctx.setLineDash([5,5])
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle='grey';
        ctx.fillText(
          `${unitToString(sln.layout.cellSizeX, "distance")}`,
          margin + i*cellX,
          margin + font + 0.5*cellY
        );
        ctx.fillText(
          `on center`,
          margin + i*cellX,
          margin + 2*font + 0.5*cellY
        );
      }

      for (j = 0; j < sln.layout.numFansY; j++){
        // at least 2 fans in y direction, show on center spacing
        // between last fan and second last
        if (i == 0 & j > 0 & j == sln.layout.numFansY - 1){
        ctx.beginPath();
        ctx.moveTo(margin + 0.5*cellX, margin + (j-0.5)*cellY);
        ctx.lineTo(margin + 0.5*cellX, margin + (j+0.5)*cellY);
        // ctx.closePath();
        ctx.lineWidth=1;
        ctx.strokeStyle='grey';
        ctx.setLineDash([5,5])
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.fillStyle='grey';
        ctx.fillText(
          `${unitToString(sln.layout.cellSizeY, "distance")}`,
          margin + 0.5 *font + 0.5*cellX,
          margin - 0.5*font + j*cellY
        );
        ctx.fillText(
          `on center`,
          margin + 0.5 *font +0.5*cellX,
          margin + 0.5*font + j*cellY
        );
        }



        // center of each fan
        cx = margin + (i + 0.5)*cellX;
        cy = margin + (j + 0.5)*cellY;

        // draw blades
        var x = cx;
        var y = cy;
        ctx.beginPath();
        ctx.moveTo(cx, cy - fan_rad)
        for(b = 0; b < blades; b++){
          x=cx + Math.cos(rot) * fan_rad;
          y=cy + Math.sin(rot) * fan_rad;
          ctx.lineTo(x, y)
          rot += step

          x= cx + Math.cos(rot) * inner_rad;
          y= cy + Math.sin(rot) * inner_rad;
          ctx.lineTo(x, y)
          rot += step
        }
        ctx.lineTo(cx, cy - fan_rad);
        ctx.closePath();
        ctx.lineWidth=4;
        ctx.strokeStyle='grey';
        ctx.setLineDash([])
        ctx.stroke();
        ctx.fillStyle='grey';
        ctx.fill();

        // inner circle (fan hub, circle 1/10 fan diameter)
        ctx.beginPath();
        ctx.arc(cx, cy, fan_rad/10, 0, 2 * Math.PI);
        ctx.lineWidth=1;
        ctx.strokeStyle='black';
        ctx.setLineDash([])
        ctx.stroke();
        ctx.fillStyle='lightblue';
        ctx.fill();
        ctx.fillStyle='black';

        // outer circle (blade tip path)
        ctx.beginPath();
        ctx.arc(cx, cy, fan_rad, 0, 2 * Math.PI);
        ctx.setLineDash([1, 3])
        ctx.stroke();+
        ctx.setLineDash([]);

      }
    }
  } else {
    alert("Your browser doesn't support HTML 5 Canvas");
  }
}
