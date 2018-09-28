class Landscape {
    constructor(data) {
        this.canvasSize = Landscape.computeSize();
        this.size = data['size'];

        this.svgContainer = Landscape.initSVGContainer();
        this.svgGroup = this.svgContainer.append('g');
        this.nodesGroup = this.svgGroup.append('g');
        this.heatmapGroup = this.svgGroup.append('g');
        this.edgeGroup = this.svgGroup.append('g');
        this.wordGridGroup = this.svgGroup.append('g');
        this.documentGroup = this.svgGroup.append('g');

        this.nodes = Nodes(data, this.nodesGroup, 'personSearch', 'persons');
        this.edges = Edges();
        this.wordGrid = WordGrid();
        this.documents = Documents();
        this.heatmap = Heatmap();
        this.categories = Categories(data, 'categorySearch', 'categories', 'category_a');

        this.initZoom();
    }

    update() {
        this.heatmap.update();
        this.documents.update();
        this.edges.update();
        this.nodes.update();
        this.categories.update();
    }

    static initSVGContainer() {
        return d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg");
    }

    static computeSize() {
        let main = $('#main');
        let navbar = $('#top-navbar');
        return [main.width(), main.height() - bar.height() - navbar.height()];
    }

    initZoom() {
        let that = this;
        this.svgContainer.call(d3.zoom()
            .scaleExtent([1 / 4, 10])
            .on("zoom", function () {
                that.svgGroup.attr("transform", d3.event.transform);
                let currentZoomLevel = d3.event.transform.k;
                adjustZoomLevel(currentZoomLevel);
            }));
        this.adjustZoomLevel(1.0);
    }

    adjustZoomLevel(currentZoomLevel) {
        this.nodes.adjustZoomLevel(currentZoomLevel);
        this.wordGrid.adjustZoomLevel(currentZoomLevel);
        this.documents.adjustZoomLevel(currentZoomLevel);
    }
}