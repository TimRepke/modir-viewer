var total = 100;
$( function() {

    $( "#slider-heatmap" ).slider({
        range: true,
        min: 0,
        max: 100,
        slide: function( event, ui ) {

            slideHeatmap(ui.values[0]/total, ui.values[1]/total);
        },
        step: 5,
        values: [5, 100],
        orientation: "horizontal",
        animate: true
    });
} );

function slideHeatmap(percentageLow, percentageHigh) {
    setHeatmapThresholdLow(percentageLow);
    setHeatmapThresholdHigh(percentageHigh);
    updateHeatmap();
}