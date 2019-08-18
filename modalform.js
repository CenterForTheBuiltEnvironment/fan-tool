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
    if (isSIunits) {
        $("#distance-unit").text("(m)")
        $("#airflow-unit").text("(m³/s)")
    } else {
        $("#distance-unit").text("(ft)")
        $("#airflow-unit").text("(cfm)")
    }
  });
} );
