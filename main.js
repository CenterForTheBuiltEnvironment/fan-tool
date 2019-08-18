/* define the limits within which this design method applies
given the limitations of the underlying experiment dataset*/
var lims = {
  'cellSize': {
    'min' : 4.572,
    'max' : 15.24,
  },
  'numFans':{
    'min' : 1,
    'max' : 10,
  },
  'diameter':{
    'min' : 1.2192,
    'max' : 4.2672,
  },
  'bladeHeight' : {
    'min' : 2.1336,
    'max' : 4.2672,
  },
  'ceilingHeight' : {
    'min' : 2.7432,
    'max' : 4.572,
  },
  'dimensionlessDiameter':{
    'min' : 0.2,
    'max' : 0.5,
  },
  'aspectRatio' : {
    'min' : 3/4,
    'max' : 4/3,
  },
}

room = [];
candidateFans = []
solutions = [];
selectedSolution = [];

isSIunits = true

// globally store the pixel scaling factor for canvas
scale = 0;

// create common imperial unit defintions
math.createUnit('cfm', '1 ft*ft*ft/min');
math.createUnit('fpm', '1 ft/min');
// create function that returns an input SI unit as a string with units
// in the selected unit system
function toStringWithDisplayUnits (valueSI, measurement){
  if (measurement = "distance"){
    return math.format(math.unit(valueSI,"m").to(isSIunits ? "m" : "ft"),3);
  };
  if (measurement = "flowrate"){
    return math.format(math.unit(valueSI,"m^3/s").to(isSIunits ? "m^3/s" : "cfm"),3);
  };
  if (measurement = "speed"){
    return math.format(math.unit(valueSI,"m/s").to(isSIunits ? "m/s" : "fpm"),3);
  };
};


// // get parameters from the url
// var url = new URL(document.URL);
// var query_string = url.search;
// var search_params = new URLSearchParams(query_string);
// var id = search_params.get('id');
// // output : 100
// console.log(id);
//
// var uri = "file:///D:/Android/Projects/ipack-schedule/www/visit.html?uname=&date=10/01/2016%2013:00:00"
//
// var vars = getVars(uri)
// document.write(JSON.stringify(vars))
//
// function getVars(uri) {
//   var s = uri.split("?")
//   if (s.length == 1) return []
//
//   var parts = s[1].split("&")
//   return parts.map(function(el) {
//     return el.split("=").map(function(el){return decodeURIComponent(el)})
//   })
// }


/// once all content has loaded, perform first solutions calc
$(document).ready(function() {
  /// initial best guess at  unit system based on user browser language
  if (navigator.language == "en-US") {
    $("[name='units']").trigger( 'click');
    changeUnits();
  };
  updateSliderDisplays();
  updateSolutions();
});


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
  values: [ lims.dimensionlessDiameter.min, lims.dimensionlessDiameter.max ],
  step: 0.01,
  slide: function( event, ui ) {
    $( "#dimless" ).val( ui.values[ 0 ] + " - "  + ui.values[ 1 ]);
    lims.dimensionlessDiameter.max = ui.values[ 1 ];
    lims.dimensionlessDiameter.min = ui.values[ 0 ];
  }
});
$( "#dimless" ).val( $( "#slider-dimless" ).slider( "values", 0 ) +
" - " + $( "#slider-dimless" ).slider( "values", 1 ));

$( "#slider-cellSize" ).slider({
  range: true,
  min: 4.5,
  max: 15.24,
  values: [ lims.cellSize.min, lims.cellSize.max ],
  step: 0.1,
  slide: function( event, ui ) {
    //TODO change data structure to [min,max] instead of .min and .max
    lims.cellSize.max = ui.values[ 1 ];
    lims.cellSize.min = ui.values[ 0 ];
    updateSliderDisplays();
  }
});


// add all sliders (single values)
$( "#slider-aspectRatio-min" ).slider({
  range: "min",
  value: 1.25,
  min: 1,
  max: 1.5,
  step: 0.01,
  slide: function( event, ui ) {
    $( "#aspectRatio" ).val( "" + ui.value );
  }
});
$( "#aspectRatio" ).val( "" + $( "#slider-aspectRatio-min" ).slider( "value" ) );

$( "#slider-len-min" ).slider({
  range: "min",
  value: 6.1,
  min: 4.5,
  max: 50,
  step: 0.1,
  slide: function( event, ui ) {
    updateSliderDisplays();
  }
});

$( "#slider-wid-min" ).slider({
  range: "min",
  value: 12.2,
  min: 4.5,
  max: 50,
  step: 0.1,
  slide: function( event, ui ) {
    updateSliderDisplays();
  }
});

$( "#slider-hei-min" ).slider({
  range: "min",
  value: 3,
  min: 2.7,
  max: 4.5,
  step: 0.1,
  slide: function( event, ui ) {
    updateSliderDisplays();
  }
});

$( ":radio" ).checkboxradio({
  icon: false
});

var tblFans = $('#fans').DataTable( {
  data: [
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
  destroy: true,
  scrollY: "200px",
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
  candidateFans =[];
  tblFans.rows('.selected').data().each( function(row,index) {
    var t = row[0];
    var d = row[1];
    var a = row[2];
    var u = row[3];
    if (!isSIunits){
      // convert units to SI before creating fan objects
      d *= math.unit("1 ft").toNumber("m");
      a *= math.unit("1 cfm").toNumber("m3/s");
    }
    candidateFans.push(new Fan(t,d,a,u));
  });
  updateSolutions();
} );

var tblSln = $('#solutions').DataTable( {
  data: [],
  destroy: true,
  paging: true,
  scrollY: true,
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

$('#solutions tbody').on( 'click', 'tr', function () {
  if ( $(this).hasClass('selected') ) {
    $(this).removeClass('selected');
  }
  else {
    tblSln.$('tr.selected').removeClass('selected');
    $(this).addClass('selected');
  }
} );

// update selected solution
$('#solutions tbody').on( 'click', function () {
  drawRoom();
  if (tblSln.rows('.selected').data().length > 0 ){
    f = tblSln.rows('.selected').data()[0][0];
    n = tblSln.rows('.selected').data()[0][1];
    for (sln of solutions){
      // TODO - resolve issue if two matching slns (same type, 7 x 8 vs 8x7 fans)
      if (sln.fan.type == f && sln.layout.numFans() == n) drawFans(sln);
    };
  };
} );

$('.ui-slider').click(function () {
  updateSliderDisplays();
  updateSolutions();
});

// $('.ui-spinner-button').click(function() {
//   $(this).siblings('input').change();
// });

$(':input').change(function () {
  updateSolutions();
});

// recalc the solutions, clear the floor plan, update the solutions table
function updateSolutions() {
  calcSolutions();
  drawRoom();
  updateSlnTable();
};

function updateSlnTable(){
  tblSln.clear();
  tblData = [];
  conv = (isSIunits) ? 1 : math.unit("1 m/s").toNumber("fpm");
  for (i of solutions){
    tblData.push([
      i.fan.type,
      i.layout.numFans(),
      i.airspeeds()[0] * conv,
      i.airspeeds()[1] * conv,
      i.airspeeds()[2] * conv,
      i.airspeeds()[3],
      i.layout.aspectRatio,
    ]);
  }
  tblSln.rows.add(tblData);
  tblSln.draw();
  // select first solution if any solutions exist
  if (solutions.length >0 ) $('#solutions tbody tr:eq(0)').click();
};

// if someone wants to change to units
$("[name='units']").on( 'click', function () {
  changeUnits();
});

function updateSliderDisplays(){
  // TODO: general
  $( "#wid" ).val(toStringWithDisplayUnits($( "#slider-wid-min" ).slider( "value" ),"distance"))
  $( "#len" ).val(toStringWithDisplayUnits($( "#slider-len-min" ).slider( "value" ),"distance"))
  $( "#hei" ).val(toStringWithDisplayUnits($( "#slider-hei-min" ).slider( "value" ),"distance"))
  // if (isSIunits) {
  //   $( "#len" ).val( $( "#slider-len-min" ).slider( "value" ) + " m" );
  // } else {
  //   $( "#len" ).val( ($( "#slider-len-min" ).slider( "value" )*3.2808).toFixed(1) + " ft" );
  // }

  $( "#cellSize" ).val(
     toStringWithDisplayUnits($( "#slider-cellSize" ).slider( "values", 0 ), "distance")
      +  " - " +
     toStringWithDisplayUnits($( "#slider-cellSize" ).slider( "values", 1 ), "distance")
   );
}

function changeUnits () {
  isSIunits  = $("[name='units']")[0].checked
  // update table column names

  if (isSIunits) {
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
};





function calcSolutions(){
  // instantiate a new room object using the selected dimensions
  room = new Room(
    $( "#slider-hei-min" ).slider("value"),
    $( "#slider-len-min" ).slider("value"),
    $( "#slider-wid-min" ).slider("value")
  )

  /* function to ensure that the resulting size of the fan 'cell' in either the
  X  or Y direction is within the limits of the underlying data set.
  Avoids looping through an unecessarily large array of 2d Layout objects
  */
  testLims = function(value, index, testArray, )  {
    return value >= lims.cellSize.min*Math.sqrt(lims.aspectRatio.min) &&
    value <= lims.cellSize.max*Math.sqrt(lims.aspectRatio.max);
  }
  candidateNumFans = Array.from(Array(lims.numFans.max).keys()).map(n => n + 1)
  var validNumFansX = candidateNumFans.map(n => room.sizeX/n).filter(testLims).map(n => room.sizeX / n);
  var validNumFansY = candidateNumFans.map(n => room.sizeY/n).filter(testLims).map(n => room.sizeY / n);
  console.log(`Valid number of fans in X direction:  ${validNumFansX}`)
  console.log("Valid number of fans in Y direction: " + validNumFansY)
  console.log("Total number of cases: " + (validNumFansX.length * validNumFansY.length))


  /* create an array of all candidate layouts that fit within the limitations
  that relate to interactions between room and room objects.
  */
  layouts = [];
  failAspectRatio = [0,0];
  failCellSize = [0,0];
  for (i = 0; i < validNumFansX.length; i++) {
    for (j = 0; j < validNumFansY.length; j++) {
      // instantiate a candidate solution
      candidate = new Layout(validNumFansX[i],validNumFansY[j], room);
      // test to see if it meets validity criteria
      if (candidate.aspectRatio <= lims.aspectRatio.min){
        failAspectRatio[0]++;
        continue;
      };
      if (candidate.aspectRatio >= lims.aspectRatio.max){
        failAspectRatio[1]++;
        continue;
      };
      if (candidate.r <= lims.cellSize.min){
        failCellSize[0]++;
        continue;
      };
      if (candidate.r >= lims.cellSize.max){
        failCellSize[1]++;
        continue;
      };
      layouts.push(candidate);
    };
  };

  console.log(failAspectRatio + " failed on [min, max] aspect ratio ");
  console.log(failCellSize + " failed on [min, max] cell size");
  console.log(layouts);
  console.log("Total number of viable layouts: " + layouts.length);

  var mins = layouts.map(function(elt) { return elt.validDiameters()[0]; });
  var maxes = layouts.map(function(elt) { return elt.validDiameters()[1]; });
  var anyLayout = [Math.min.apply(null, mins), Math.max.apply(null, maxes)];
  console.log("Fan diameter must be within this range to have a valid layout: " + anyLayout);

  /* create an array of all candidate solutions that fit within the limitations
  that relate interactions between layout and fan objects.
  */
  solutions = [];
  failDimensionlessDiameter = [0,0];
  for (i = 0; i < layouts.length; i++) {
    for (j = 0; j < candidateFans.length; j++) {
      // instantiate a candidate solution
      candidate = new Solution(layouts[i],candidateFans[j]);
      // test to see if it meets validity criteria
      if (candidate.dr <= lims.dimensionlessDiameter.min){
        failDimensionlessDiameter[0]++;
        continue;
      };
      if (candidate.dr >= lims.dimensionlessDiameter.max){
        failDimensionlessDiameter[1]++;
        continue;
      };
      //TODO:  add constraints based on airspeed
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


// function getDataTbl(solutions){
//   tblData = [];
//   for (i of solutions){
//     tblData.push([i.layout.numFansX, i.layout.numFansY, i.fan.diameter]);
//   }
//   return tblData;
// }


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
    ctx.rect(10,10, room.sizeX*scale,room.sizeY*scale);
    ctx.stroke();
  } else {
    alert("Your browser doesn't support HTML 5 Canvas");
  }
}


function drawFans(sln) {
  //TODO: review pros/cons of doing this with SVG instead of canvas
  var canvas = document.getElementById('canv');
  // Execute only if canvas is supported
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d')
    //clear plan after each solution selection
    // display basic information about the layout
    ctx.font = '14px serif';
    ctx.fillText(sln.layout.numFans() + " " + sln.fan.type + " fans", 14, 28);

    // add diameter

    ctx.fillText(
      toStringWithDisplayUnits(sln.fan.diameter, "distance"),
      10 + scale*(0.5*(sln.layout.cellSizeX - 0.5 * sln.fan.diameter)),
      10 + scale*(0.5*(sln.layout.cellSizeY))
    );

    //draw 'fans'
    i = 0;
    j = 0;
    for (i = 0; i < sln.layout.numFansX; i++){
      for (j = 0; j < sln.layout.numFansY; j++){
        ctx.beginPath();
        ctx.arc(
          10 + scale*(i + 0.5)*sln.layout.cellSizeX,
          10 + scale*(j + 0.5)*sln.layout.cellSizeY,
          sln.fan.diameter*scale/2, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

    } else {
      alert("Your browser doesn't support HTML 5 Canvas");
    }

  }
