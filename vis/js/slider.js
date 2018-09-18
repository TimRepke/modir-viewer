var total = 100;
$( function() {
    var handle = $( "#custom-handle" );

    $( "#slider" ).slider({
        create: function() {
            handle.text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            handle.text( ui.value );
            slide(ui.value/total);
        },
        step: 5,
        value: 5,
        orientation: "horizontal",
        range: "min",
        animate: true
    });
} );

function slide(percentage) {
    updateHeatmap(percentage, true);

}