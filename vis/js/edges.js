class Edges {
    constructor(data, svgGroup, checkboxId, bundleEdges = false) {
        this.svgGroup = svgGroup;
        this.data = data;

        this.total = 100;
        this.thresholdLow = 0.0;
        this.thresholdHigh = 1.0;
        this.minWidth = 0.5;
        this.maxWidth = 15;
        this.minOpacity = 0.1;
        this.maxOpacity = 0.5;
        this.checkboxId = checkboxId;
        this.edgesVisible = true;
        this.bundleEdges = bundleEdges;

        this.edgesAll = this.data['edges'].sort(function (a, b) {
            return a['weight'] - b['weight'];
        });

        this.initLandscape();
        this.initSidebar();
    }

    initLandscape() {
        //this.update();
        // update is called on init in landscape
    }

    filterEdges() {
        let bottomCutoff = this.edgesAll.length * this.thresholdLow;
        //bottomCutoff = 10000;
        let topCutoff = this.edgesAll.length * this.thresholdHigh;
        //topCutoff = 6000;
        return this.edgesAll.filter(function (d, i) {
            return bottomCutoff <= i && i <= topCutoff;
        });
    }

    updateStraight() {
        let that = this;
        let edgesFiltered = this.filterEdges();
        this.svgGroup.selectAll('line').remove();
        let edges = this.svgGroup.selectAll('line')
            .data(edgesFiltered)
            .enter()
            .append('line')
            //.attr('class', 'line')
            .attr('x1', function (d) {
                return d['source_pos'][0];
            })
            .attr('y1', function (d) {
                return d['source_pos'][1];
            })
            .attr('x2', function (d) {
                return d['target_pos'][0];
            })
            .attr('y2', function (d) {
                return d['target_pos'][1];
            })
            .attr("stroke-width", function (d) {
                return that.minWidth + (that.maxWidth - that.minWidth) *
                    (d['weight'] / that.data['size']['edge_weights']['range']);
            })
            .attr("stroke-opacity", function (d) {
                return (
                    (d['weight'] / that.data['size']['edge_weights']['range']) *
                    (that.maxOpacity - that.minOpacity)) + that.minOpacity;
            })
            .attr("stroke", "#303030")//"black")
            .exit().remove();
    }

    updateBundled() {
        let that = this;
        let edges = this.edgesAll;
        edges = this.filterEdges(false);
        let node_data = {};
        let edge_data = edges.map(function (edge, i) {
            // {"source":"34149749","target":"1970631","source_pos":[-0.3977190412,0.1333034412],
            // "target_pos":[-0.42270732,0.231665935],"weight":4,"docs":[0]}
            if (!(edge["source"] in node_data))
                node_data[edge["source"]] = { "x": edge["source_pos"][0], "y": edge["source_pos"][1] };
            if (!(edge["target"] in node_data))
                node_data[edge["target"]] = { "x": edge["target_pos"][0], "y": edge["target_pos"][1] };
            return { "source": edge["source"], "target": edge["target"] };
        });

        console.log("Number of edges: " + edge_data.length);
        let forceBundler = d3.ForceEdgeBundling()
            .step_size(0.4)
            .compatibility_threshold(0.6)
            .bundling_stiffness(0.4)
            .nodes(node_data)
            .edges(edge_data);
        let bundledEdges = forceBundler();
        edges.forEach(function (edge, i) {
            edge['path'] = bundledEdges[i];
        });
        edges = edges.filter((edge) => !!edge.path);

        this.svgGroup.selectAll('path').remove();

        let d3line = d3.line()
            .x(function (d) {
                return d.x;
            })
            .y(function (d) {
                return d.y;
            });

        let edgePaths = this.svgGroup.selectAll('path')
            .data(edges)
            .enter()
            .append("path")
            .attr("d", function (d) {
                return d3line(d["path"]);
            })
            .attr("stroke-width", function (d) {
                return that.minWidth + (that.maxWidth - that.minWidth) *
                    (d['weight'] / that.data['size']['edge_weights']['range']);
            })
            .attr("stroke-opacity", function (d) {
                return (
                    (d['weight'] / that.data['size']['edge_weights']['range']) *
                    (that.maxOpacity - that.minOpacity)) + that.minOpacity;
            })
            .attr("stroke", "#303030")//"black")
            .attr("fill", "transparent")
            .exit().remove();
    }

    update() {
        if (this.bundleEdges)
            this.updateBundled();
        else
            this.updateStraight();
    }

    initSidebar() {
        let that = this;
        $("#slider-connections").slider({
            range: true,
            min: 0,
            max: 100,
            slide: function (event, ui) {
                that.slideConnections(ui.values[0] / that.total, ui.values[1] / that.total);
            },
            step: 5,
            values: [0, 100],
            orientation: "horizontal",
            animate: true
        });
        $('#' + this.checkboxId).change(function () {
            that.edgesVisible = $(this).prop('checked');
            that.svgGroup.style('visibility', that.edgesVisible ? 'visible' : 'hidden');
        })
    }

    slideConnections(percentageLow, percentageHigh) {
        this.thresholdLow = percentageLow;
        this.thresholdHigh = percentageHigh;
        this.update();
    }
}

/*
var sampleedges = [{
    "source": "1728478",
    "target": "1728478",
    "source_pos": [-0.8078079224, 0.735624373],
    "target_pos": [-0.8078079224, 0.735624373],
    "weight": 1,
    "docs": ["4d8d303fd622cf3bd0899bfe532fbee41202e718"]
}]
*/