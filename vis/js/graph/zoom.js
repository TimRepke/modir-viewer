



function adjustMailCircleZoomLevel(currentZoomLevel) {
    let scale = Math.max(Math.min(1.5 / currentZoomLevel, 2.0), 0.6);
    if (Math.abs(scale - currentMailCircleZoom) > 0.32) {
        mailCircles.attr('r', scale);
        currentMailCircleZoom = scale;
    }
}

function adjustPeopleCircleZoomLevel(currentZoomLevel) {
    let scale = Math.max(Math.min(1.5 / currentZoomLevel, 2.0), 1.0);
    if (Math.abs(scale - currentPeopleCircleZoom) > 0.07) {
        peopleCircles.attr('r', 3 * scale);
        currentMailCircleZoom = scale;
    }
}

function adjustWordZoomLevel(currentZoomLevel) {
    if(Math.abs(currentZoomLevel - currentWordZoom) > 0.1) {
        currentWordZoom = currentZoomLevel;
        updateTopWords();
    }
}




