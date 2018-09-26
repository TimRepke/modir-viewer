var total = 100;
$( function() {

    $( "#slider-connections" ).slider({
        range: true,
        min: 0,
        max: 100,
        slide: function( event, ui ) {
            slideConnections(ui.values[0]/total, ui.values[1]/total);
        },
        step: 5,
        values: [0, 100],
        orientation: "horizontal",
        animate: true
    });
} );

function slideConnections(percentageLow, percentageHigh) {
    connectionThresholdLow = percentageLow;
    connectionThresholdHigh = percentageHigh;
    updateConnections();
}