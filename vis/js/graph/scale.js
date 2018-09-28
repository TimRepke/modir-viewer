


function computeSize() {
    let main = $('#main');
    let bar = $('#top-bar');
    let navbar = $('#top-navbar');
    return [main.width(), main.height() - bar.height() - navbar.height()];
}

function computeGridResolution(size) { // todo compute smart scale which adjusts so the grid fits with error < epsilon or offset the heatmap??
    let scale = 60;
    let res = Math.max(Math.floor(size[0] / scale), Math.floor(size[1] / scale));
    return [res, res];
}

function pos_x(d) {
    return d['pos'][0];
}
function pos_y(d) {
    return d['pos'][1];
}