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
isSIunits = true;

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

$(document).ready(function() {
  $( "#accordion" ).accordion({
    collapsible: true,
    heightStyle: "content"
  });
  $( "#len" ).spinner({
    step: 0.1,
    min: 4.5,
    max: 100,
    numberFormat: "n"
  });
  $( "#wid" ).spinner({
    step: 0.1,
    min: 4.5,
    max: 100,
    numberFormat: "n"
  });
  $( "#hei" ).spinner({
    step: 0.1,
    min: 2.7,
    max: 4.5,
    numberFormat: "n"
  });

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

      $( "#cellSize" ).val( ui.values[ 0 ] + " - "  + ui.values[ 1 ]);
      lims.cellSize.max = ui.values[ 1 ];
      lims.cellSize.min = ui.values[ 0 ];
    }
  });

  $( "#cellSize" ).val( $( "#slider-cellSize" ).slider( "values", 0 ) +
  " - " + $( "#slider-cellSize" ).slider( "values", 1 ));

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
      { title: "Name" },
      { title: "D (m)" },
      { title: "Q (m³/s)" },
      { title: "UL507" }
    ]
  } );

  // select/deselect rows when clicked
  $('#fans tbody').on( 'click', 'tr', function () {
    $(this).toggleClass('selected');
  } );

  // update fans object and calculate solutions when a fan is selected/deseleccted
  $('#fans tbody').on( 'click', function () {
    candidateFans =[]
    tblFans.rows('.selected').data().each( function(row,index) {
      candidateFans.push(new Fan(...row))
    });
    updateSolutions();
  } );

  // add a fan using a jQuery modal form to input new fan on button click
  $('#addFan').on( 'click', function () {
    // replace with jQuery modal form to input new fan
    tblFans.row.add( [
      "Ex",
      2,
      9.9,
      true,
    ] ).draw( false );

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
      { title: "Unifomity" }
    ]
  } );

  $('#solutions tbody').on( 'click', 'tr', function () {
    if ( $(this).hasClass('selected') ) {
      $(this).removeClass('selected');
    }
    else {
      tblSln.$('tr.selected').removeClass('selected');
      $(this).addClass('selected');
      drawFans(this.rowIndex-1);
    }
  } );

  // TODO: change to update based on any slider input changes
  $('#slider-dimless').mouseup(function () {
    updateSolutions();
  });

  $('.ui-spinner-button').click(function() { $(this).siblings('input').change(); });

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
    for (i of solutions){
      tblData.push([
        i.fan.type,
        i.layout.numFans(),
        (isSIunits) ? i.airspeeds()[0] : i.airspeeds()[0] * 196.85,
        (isSIunits) ? i.airspeeds()[1] : i.airspeeds()[1] * 196.85,
        (isSIunits) ? i.airspeeds()[2] : i.airspeeds()[2] * 196.85,
        i.airspeeds()[3]
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

  function changeUnits () {
    isSIunits  = $("[name='units']")[0].checked
    // update table column names

    if (isSIunits) {
      $(tblFans.column(1).header()).text('D (m)');
      $(tblFans.column(2).header()).text('Q (m3/s)');
      $(tblSln.column(2).header()).text('Min airspeed (m/s)');
      $(tblSln.column(3).header()).text('Avg airspeed (m/s)');
      $(tblSln.column(4).header()).text('Max airspeed (m/s)');
      // update the data in each column
      tblFans.rows().every( function ( rowIdx, tableLoop, rowLoop ) {
        var data = this.data();
        data[1] /= 3.2808;
        data[2] /= 2118.88;
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
        data[1] *= 3.2808;
        data[2] *= 2118.88;
        this.data(data);
      });
    }
  };

  calcSolutions();
  drawRoom();

} );



function calcSolutions(){
  // unitsSI = document.getElementById("unitsSI").checked
  // console.log(`unitsSI is ${unitsSI}`);
  // lims.numFans.max = parseInt(document.getElementById("maxNumFans").value);
  // lims.dimensionlessDiameter.max = parseInt($( "#slider-dimless" ).slider( "values", 1 ));
  room = new Room(hei.value,len.value,wid.value)
  console.log(room)
  console.log(candidateFans)

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
    // draw the room in plan
    ctx.beginPath();
    ctx.rect(10,10, room.sizeX*5,room.sizeY*5);
    ctx.stroke();
  } else {
    alert("Your browser doesn't support HTML 5 Canvas");
  }
}


function drawFans(slnID) {
  //TODO: review pros/cons of doing this with SVG instead of canvas
  var canvas = document.getElementById('canv');
  // Execute only if canvas is supported
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d')
    //clear plan after each solution selection
    drawRoom();
    sln = solutions[slnID];
    //draw 'fans'
    i = 0;
    j = 0;
    for (i = 0; i < sln.layout.numFansX; i++){
      for (j = 0; j < sln.layout.numFansY; j++){
        ctx.beginPath();
        ctx.arc(
          10 + 5*(i + 0.5)*sln.layout.cellSizeX,
          10 + 5*(j + 0.5)*sln.layout.cellSizeY,
          sln.fan.diameter*5/2, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    } else {
      alert("Your browser doesn't support HTML 5 Canvas");
    }

  }
