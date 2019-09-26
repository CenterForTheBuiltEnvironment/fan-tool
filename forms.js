$( function() {
  var dialog, form,
  newtype = $( "#newtype" ),
  newdiameter = $( "#newdiameter" ),
  newairflow = $( "#newairflow" ),
  allFields = $( [] ).add( newtype ).add( newdiameter ).add( newairflow ),
  tips = $( ".validateTips" );

  function updateTips( t ) {
    tips
    .text( t )
    .addClass( "ui-state-highlight" );
    setTimeout(function() {
      tips.removeClass( "ui-state-highlight", 1500 );
    }, 500 );
  }

  function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
      o.addClass( "ui-state-error" );
      updateTips( "Length must be between " +
      min + " and " + max + "." );
      return false;
    } else {
      return true;
    }
  }

  function checkRegexp( o, regexp, n ) {
    if ( !( regexp.test( o.val() ) ) ) {
      o.addClass( "ui-state-error" );
      updateTips( n );
      return false;
    } else {
      return true;
    }
  }

  function addFan() {
    var valid = true;
    allFields.removeClass( "ui-state-error" );
    valid = valid && checkLength( newtype, "newtype", 1, 8 );
    valid = valid && checkLength( newdiameter, "newdiameter", 1, 6 );
    valid = valid && checkLength( newairflow, "newairflow", 1, 6 );

    valid = valid && checkRegexp( newtype, /^[a-z0-9]+$/i, "Fan type must consist of numbers or case-insensitive letters only." );
    valid = valid && checkRegexp( newdiameter, /^(?:\d*\.\d{1,2}|\d+)$/, "Fan diameter must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( newairflow, /^(?:\d*\.\d{1,2}|\d+)$/, "Fan airflow must be a number (0-9), with or without decimals." );

    // add a fan to the table if the inputs are valid
    if ( valid ) {
      tblFans.row.add( [
        newtype.val(),
        Number(newdiameter.val()),
        Number(newairflow.val()),
        document.getElementById("ul507").checked,
      ] ).draw( false );
    }
    return valid;
  }

  dialog = $( "#dialog-form" ).dialog({
    autoOpen: false,
    height: 450,
    width: 350,
    modal: true,
    buttons: {
      "Add fan": addFan,
      Close: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
      allFields.removeClass( "ui-state-error" );
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addUser();
  });

  $( "#add-fan" ).button().on( "click", function() {
    dialog.dialog( "open" );
    if (p.isSIunits) {
        $("#distance-unit").text("(m)")
        $("#airflow-unit").text("(m³/s)")
    } else {
        $("#distance-unit").text("(ft)")
        $("#airflow-unit").text("(cfm)")
    }
  });
} );



$( function() {
  var dialog, form,
  xSpacing = $( "#xSpacing" ),
  ySpacing = $( "#ySpacing" ),
  xOffset = $( "#xOffset" ),
  yOffset = $("#yOffset"),
  allFields = $( [] ).add( xSpacing ).add( ySpacing ).add( xOffset ).add( yOffset ),
  tips = $( ".validateTips" );

  function updateTips( t ) {
    tips
    .text( t )
    .addClass( "ui-state-highlight" );
    setTimeout(function() {
      tips.removeClass( "ui-state-highlight", 1500 );
    }, 500 );
  }

  function checkLength( o, n, min, max ) {
    if ( o.val().length > max || o.val().length < min ) {
      o.addClass( "ui-state-error" );
      updateTips( "Length must be between " +
      min + " and " + max + "." );
      return false;
    } else {
      return true;
    }
  }

  function checkRegexp( o, regexp, n ) {
    if ( !( regexp.test( o.val() ) ) ) {
      o.addClass( "ui-state-error" );
      updateTips( n );
      return false;
    } else {
      return true;
    }
  }

  function addGrid() {
    var valid = true;
    allFields.removeClass( "ui-state-error" );
    valid = valid && checkLength( xSpacing, "xSpacing", 1, 5 );
    valid = valid && checkLength( xOffset, "xOffset", 1, 5 );
    valid = valid && checkLength( ySpacing, "ySpacing", 1, 5 );
    valid = valid && checkLength( yOffset, "yOffset", 1, 5 );

    valid = valid && checkRegexp( xSpacing, /^(?:\d*\.\d{1,2}|\d+)$/, "X spacing must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( xOffset, /^(?:\d*\.\d{1,2}|\d+)$/, "X offset must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( ySpacing, /^(?:\d*\.\d{1,2}|\d+)$/, "Y spacing must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( yOffset, /^(?:\d*\.\d{1,2}|\d+)$/, "Y offset must be a number (0-9), with or without decimals." );

    // add grid lines
    if ( valid ) {
      if (p.isSI){
        p.grid = {
          'xSpacing': Number(xSpacing.val()),
          'ySpacing': Number(ySpacing.val()),
          'xOffset': Number(xOffset.val()),
          'yOffset': Number(yOffset.val()),
          'display': document.getElementById("display").checked,
        }
      } else {
        p.grid = {
          'xSpacing': Number(xSpacing.val()) * math.unit("1 ft").toNumber("m"),
          'ySpacing': Number(ySpacing.val()) * math.unit("1 ft").toNumber("m"),
          'xOffset': Number(xOffset.val()) * math.unit("1 ft").toNumber("m"),
          'yOffset': Number(yOffset.val()) * math.unit("1 ft").toNumber("m"),
          'display': document.getElementById("display").checked,
        }
      }
      updateView();
    }
    return valid;
  }

  dialog = $( "#dialog-form2" ).dialog({
    autoOpen: false,
    height: 600,
    width: 500,
    modal: true,
    buttons: {
      "Modify grid settings": addGrid,
      Close: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
      allFields.removeClass( "ui-state-error" );
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addUser();
  });

  $( "#grid-settings" ).button().on( "click", function() {
    dialog.dialog( "open" );
    $(".distance-unit").each(function() {
          if (p.isSIunits) {
            $(this).text("(m)");
          } else {
            $(this).text("(ft)");
          }
    });
  });
} );
