d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
        this.parentNode.appendChild(this);
    });
};

function pos_x(d) {
    return d['pos'][0];
}

function pos_y(d) {
    return d['pos'][1];
}

let PARAMS = {
    'nodes_id': 'persons',
    'nodes_checkboxId': 'nodes-checkbox',
    'nodes_searchId': 'personSearch',
    'nodes_filterMinimum': 0,
    'nodes_filterMaximum': 100,
    'nodes_colourDefault': '#2357d6',
    'nodes_colourActive': '#ff0c27',
    'nodes_opacityDefault': 0.8,
    'nodes_opacityActive': 1.0,
    'nodes_radiusDefault': 2.2,
    'nodes_radiusActive': 6.0,
    'edges_checkboxId': 'connections-checkbox',
    // more info: https://github.com/upphiminn/d3.ForceBundle
    'edges_bundlingActive': false,
    'edges_bundlingStepSize': 0.4,
    'edges_bundlingCompatibilityThreshold': 0.6,
    'edges_bundlingStiffness': 0.4,
    'edges_bundlingIterations': 90,
    'edges_bundlingIterationsRate': 0.6666667,
    'edges_bundlingCycles': 6,
    'edges_total': 100,
    'edges_thresholdLow': 0.0,
    'edges_thresholdHigh': 1.0,
    'edges_minWidth': 0.5,
    'edges_maxWidth': 15,
    'edges_minOpacity': 0.1,
    'edges_maxOpacity': 0.5,
    'edges_edgesVisible': true,
    'edges_strokeColour': '#303030',
    'categories_id': 'categories',
    'categories_searchId': 'categorySearch',
    'categories_type': 'category_b',
    'documents_id': 'filteredDocuments',
    'documents_radiusDefault': 1.5,
    'documents_radiusActive': 3.0,
    'documents_colourDefault': '#ffa503', // '#565656';
    'documents_colourActive': '#ff0c27',
    'documents_opacityDefault': 0.5,
    'documents_opacityActive': 1.0,
    'heatmap_checkboxId': 'heatmap-checkbox',
    'get': key => config[key] || PARAMS[key]
};

class Landscape {
    constructor(data) {

        this.data = data;
        this.size = data['size'];
        this.canvasSize = Landscape.computeSize();
        this.scale = [
            this.canvasSize[0] / this.size['width'],
            this.canvasSize[1] / this.size['height']];
        this.scaleData();

        this.svgContainer = this.initSVGContainer();
        this.svgGroup = this.svgContainer.append('g');
        this.heatmapGroup = this.svgGroup.append('g');
        this.edgeGroup = this.svgGroup.append('g');
        this.nodesGroup = this.svgGroup.append('g');
        this.documentGroup = this.svgGroup.append('g');
        this.wordGridGroup = this.svgGroup.append('g');

        this.documentGroup.attr('id', PARAMS.get('documents_id'));

        this.categories = new Categories(data);
        this.edges = new Edges(data, this.edgeGroup);
        this.heatmap = new Heatmap(data, this.heatmapGroup, this.canvasSize);
        this.nodes = new Nodes(data, this.nodesGroup);
        this.documents = new Documents(data, this.documentGroup, this.categories);
        this.wordGrid = new WordGrid(data, this.wordGridGroup, this.scale);

        this.update();
        this.initZoom();
        this.initSidebar();
    }

    update() {
        this.heatmap.update();
        this.documents.update();
        this.edges.update();
        this.nodes.update();
        this.categories.update();
        this.wordGrid.update();
    }

    initSVGContainer() {
        return d3.select("#graph").append("svg")
            .attr("width", this.canvasSize[0])
            .attr("height", this.canvasSize[1])
            .attr("id", "svg");
    }

    initSidebar() {
        let that = this;
        $("#slider-min-size").slider({
            slide: function (event, ui) {
                that.slideSize(ui.value / 10);
            },
            orientation: "horizontal",
            range: "min",
            min: 5,
            max: 30,
            value: 10,
            animate: true
        });
    }

    slideSize(scale) {
        this.nodes.customPointScale = scale;
        this.documents.customPointScale = scale;
        this.update();
    }

    static computeSize() {
        let main = $('#main');
        let navbar = $('#top-navbar');
        return [main.width(), main.height()];// - navbar.height()];
    }

    calculateVectorPosition(vec) {
        let x = (vec[0] + Math.abs(this.size['minx'])) * this.scale[0];
        let y = Math.abs(vec[1] - this.size['maxy']) * this.scale[1];
        return [x, y];
    }

    scaleData() {
        for (let key in this.data['docs']) {
            this.data['docs'][key]['pos'] = this.calculateVectorPosition(this.data['docs'][key]['vec']);
        }
        for (let key in this.data['nodes']) {
            this.data['nodes'][key]['pos'] = this.calculateVectorPosition(this.data['nodes'][key]['vec']);
        }
        for (let key in this.data['edges']) {
            this.data['edges'][key]['source_pos'] = this.calculateVectorPosition(this.data['edges'][key]['source_pos']);
            this.data['edges'][key]['target_pos'] = this.calculateVectorPosition(this.data['edges'][key]['target_pos']);
        }
    }

    initZoom() {
        let that = this;
        this.svgContainer.call(d3.zoom()
            .scaleExtent([1 / 4, 10])
            .on("zoom", function () {
                that.svgGroup.attr("transform", d3.event.transform);
                let currentZoomLevel = d3.event.transform.k;
                that.adjustZoomLevel(currentZoomLevel);
            }));
        this.adjustZoomLevel(1.0);
    }

    adjustZoomLevel(currentZoomLevel) {
        this.nodes.adjustZoomLevel(currentZoomLevel);
        this.wordGrid.adjustZoomLevel(currentZoomLevel);
        this.documents.adjustZoomLevel(currentZoomLevel);
    }
}

let landscapeInstance;

function init(data) {
    landscapeInstance = new Landscape(data);
}

d3.json(PARAMS.get('file'), init);

function reload() {
    let elem = document.getElementById('svg');
    elem.parentNode.removeChild(elem);
    d3.json(PARAMS.get('file'), init);
}

/*
let samplesize = {
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
*/
