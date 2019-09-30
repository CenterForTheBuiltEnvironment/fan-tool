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

  function checkDiam( o, regexp,) {
    if (p.isSIunits) {
      if ( o.val() < 1.2 | o.val() > 4.3  ) {
        o.addClass( "ui-state-error" );
        updateTips( "Diameter must be between 1.22 and 4.3 m" );
        return false;
      } else {
        return true;
      }
    } else {
      if ( o.val() < 4 | o.val() > 14 ) {
        o.addClass( "ui-state-error" );
        updateTips( "Diameter must be between 4 and 14 ft" );
        return false;
      } else {
        return true;
      }
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

    valid = valid && checkDiam( newdiameter, "newdiameter");
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
        allFields.removeClass( "ui-state-error" );
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
      allFields.removeClass( "ui-state-error" );
      updateTips("");
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addFan();
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
  blades = $( "#blades" ),
  xSpacing = $( "#xSpacing" ),
  ySpacing = $( "#ySpacing" ),
  xOffset = $( "#xOffset" ),
  yOffset = $("#yOffset"),
  allFields = $( [] ).add( blades ).add( xSpacing ).add( ySpacing ).add( xOffset ).add( yOffset ),
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

  function modifyDisplay() {
    var valid = true;
    allFields.removeClass( "ui-state-error" );
    valid = valid && checkLength( blades, "blades", 1, 1 );
    valid = valid && checkLength( xSpacing, "xSpacing", 1, 5 );
    valid = valid && checkLength( xOffset, "xOffset", 1, 5 );
    valid = valid && checkLength( ySpacing, "ySpacing", 1, 5 );
    valid = valid && checkLength( yOffset, "yOffset", 1, 5 );

    valid = valid && checkRegexp( blades, /^(?:\d*\.\d{1,1}|\d+)$/, "Number of blades must be a number (2-8), without decimals." );
    valid = valid && checkRegexp( xSpacing, /^(?:\d*\.\d{1,5}|\d+)$/, "X spacing must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( xOffset, /^(?:\d*\.\d{1,5}|\d+)$/, "X offset must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( ySpacing, /^(?:\d*\.\d{1,5}|\d+)$/, "Y spacing must be a number (0-9), with or without decimals." );
    valid = valid && checkRegexp( yOffset, /^(?:\d*\.\d{1,5}|\d+)$/, "Y offset must be a number (0-9), with or without decimals." );

    // add grid lines
    if ( valid ) {
      if (p.isSI){
        p.display = {
          'blades' : Number(blades.val()),
          'xSpacing': Number(xSpacing.val()),
          'ySpacing': Number(ySpacing.val()),
          'xOffset': Number(xOffset.val()),
          'yOffset': Number(yOffset.val()),
        }
      } else {
        p.display = {
          'blades' : Number(blades.val()),
          'xSpacing': Number(xSpacing.val()) * math.unit("1 ft").toNumber("m"),
          'ySpacing': Number(ySpacing.val()) * math.unit("1 ft").toNumber("m"),
          'xOffset': Number(xOffset.val()) * math.unit("1 ft").toNumber("m"),
          'yOffset': Number(yOffset.val()) * math.unit("1 ft").toNumber("m"),
        }
      }
      dialog.dialog( "close" );
      updateView();
    }
    return valid;
  }

  dialog = $( "#dialog-form2" ).dialog({
    autoOpen: false,
    height: 800,
    width: 500,
    modal: true,
    buttons: {
      "Modify display settings": modifyDisplay,
      Close: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      // form[ 0 ].reset();
      // form[ 1 ].reset();
      allFields.removeClass( "ui-state-error" );
      allFields.removeClass( "ui-state-error" );
      updateTips("");
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    modifyDisplay();
  });

  $( "#display-settings" ).button().on( "click", function() {
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
