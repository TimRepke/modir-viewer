d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

let size = {
    "minx": -0.8807507753,
    "maxx": 1.0,
    "miny": -0.7126128674,
    "maxy": 0.9409167171,
    "width": 1.8807507753,
    "height": 1.6535295844,
    "node_weights": {"min": 1, "max": 162, "range": 161},
    "edge_weights": {"min": 1, "max": 68, "range": 67},
    "word_grid": {"cols": 5, "rows": 5, "cell_width": 0.3761501551, "cell_height": 0.3307059169}
};

function pos(vec) {
    return [(vec[0] + offset[0]) * scale[0], (vec[1] + offset[1]) * scale[1]];
}

function pos_x(d) {
    return d['pos'][0];
}

function pos_y(d) {
    return d['pos'][1];
}


function adjustZoomLevel(currentZoomLevel) {
    adjustMailCircleZoomLevel(currentZoomLevel);
    adjustPeopleCircleZoomLevel(currentZoomLevel);
    adjustWordZoomLevel(currentZoomLevel);
}


function init(data) {

    size = data['size'];

    // todo get from data
    let height = size[1] + 50; // +50 for text overhang
    let width = size[0] + 80; // +80 for text overhang
    offset = [Math.abs(data['range']['xmin']), Math.abs(data['range']['ymin'])];
    scale = (function (size, span) {
        return [size[0] / span[0], size[1] / span[1]];
    }(size, [data['hspan'], data['vspan']]));


    updateTopWords();
    update();
}

d3.json("../data/export.json", init);

function reload() {
    size = computeSize();
    gridResolution = computeGridResolution(size);
    let elem = document.getElementById('svg');
    elem.parentNode.removeChild(elem);
    buildGraph(); // == init()
}