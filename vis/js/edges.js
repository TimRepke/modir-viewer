class Edges {
    constructor(data, svgGroup) {
        this.svgGroup = svgGroup;
        this.data = data;

        this.total  = PARAMS.get('edges_total');
        this.thresholdLow  = PARAMS.get('edges_thresholdLow');
        this.thresholdHigh  = PARAMS.get('edges_thresholdHigh');
        this.minWidth  = PARAMS.get('edges_minWidth');
        this.maxWidth  = PARAMS.get('edges_maxWidth');
        this.minOpacity  = PARAMS.get('edges_minOpacity');
        this.maxOpacity  = PARAMS.get('edges_maxOpacity');
        this.checkboxId = PARAMS.get('edges_checkboxId');
        this.edgesVisible  = PARAMS.get('edges_edgesVisible');
        this.bundleEdges = PARAMS.get('edges_bundlingActive');
        this.strokeColour = PARAMS.get('edges_strokeColour');
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
            .attr("stroke", this.strokeColour)
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
            .step_size(PARAMS.get('edges_bundlingStepSize'))
            .compatibility_threshold(PARAMS.get('edges_bundlingCompatibilityThreshold'))
            .bundling_stiffness(PARAMS.get('edges_bundlingStiffness'))
            .iterations(PARAMS.get('edges_bundlingIterations'))
            .iterations_rate(PARAMS.get('edges_bundlingIterationsRate'))
            .cycles(PARAMS.get('edges_bundlingCycles'))
            .nodes(node_data)
            .edges(edge_data);
        console.log('initialised bundler');
        let bundledEdges = forceBundler();
        console.log('done forcebundling');
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
            .attr("stroke", this.strokeColour)
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