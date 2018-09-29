class Documents {
    constructor(data, svgGroup, categories, defaultRadius = 1.5) {
        this.data = data;
        this.svgGroup = svgGroup;
        this.categories = categories;
        this.defaultRadius = defaultRadius;
        this.zoom = 1.0;

        this.highlightColour = '#ff0c27';
        this.baseColour = '#0073ff';
        this.highlighted = [];

        this.initLandscape();
    }

    initLandscape() {
        this.points = this.svgGroup.selectAll("circle")
            .data(Object.values(this.data['docs']))
            .enter()
            .append("circle")
            .classed('emailCircle', true)
            .attr('doc_id', function (d) {
                return d['id'];
            })
            .attr('text', function (d) {
                return d['text'];
            })
            .attr('onclick', this.documentOnClick)
            .attr('data-toggle', 'modal')
            .attr('data-target', '#email-modal')
            .attr('data-tooltip', 'tooltip')
            .attr('data-placement', 'top')
            .attr('data-html', 'true')
            .attr("cx", pos_x)
            .attr("cy", pos_y)
            .attr('r', this.defaultRadius);
    }

    update() {
        let that = this;
        let attributes = this.points
            .style("fill", function (d) {
                if (!that.hasSelection() || !that.isSelected(d))
                    return that.categories.getColour(d) || that.baseColour;
                return that.highlightColour;
            })
            .style("fill-opacity", function (d) {
                if (!that.hasSelection() || that.isSelected(d))
                    return 0.8;
                return 0.1;
            })
            .attr('r', function (d) {
                if (!that.hasSelection() || that.isSelected(d))
                    return that.zoom * 1.3;
                return that.zoom;
            });
    }

    isSelected(doc) {
        return this.highlighted.indexOf(doc['id']) < 0
    }

    hasSelection() {
        return this.highlighted.length > 0;
    }

    documentOnClick(event) {
        let domElement = $(event.target);
        this.highlight = domElement.attr('senderName');
        //this.update();

        //let text = domElement.attr('emailContent');
        //$('.modal-body').html(text);
        //$('.modal-title').html('From: ' + highlight + '<br>To: ' + domElement.attr('receiverName'));

    }

    adjustZoomLevel(currentZoomLevel) {
        let scale = Math.max(Math.min(1.5 / currentZoomLevel, 2.0), 0.6);
        if (Math.abs(scale - this.zoom) > 0.32) {
            this.points.attr('r', scale);
            this.zoom = scale;
        }
    }

    setHighlightedDocs(selection, update = false) {
        this.highlighted = selection;
        if (update) this.update();
    }

}

let example_doc = {
    "08e5cce87b6af2ae0ee09b58b86d81aa229b46d0": {
        "id": "08e5cce87b6af2ae0ee09b58b86d81aa229b46d0",
        "date": "2008-01-01T12:12:00Z",
        "text": "Much real data consists of more than one dimension, such as financial transactions (eg, price \u00d7 volume) and IP network flows (eg, duration \u00d7 numBytes), and capture relationships between the variables. For a single dimension, quantiles are intuitive and robust descriptors. Processing and analyzing such data, particularly in data warehouse or data streaming settings, requires similarly robust and informative statistical descriptors that go beyond one-dimension. Applying quantile methods to summarize a multidimensional distribution along only singleton attributes ignores the rich dependence amongst the variables. In this paper, we present new skyline-based statistical descriptors for capturing the distributions over pairs of dimensions. They generalize the notion of quantiles in the individual dimensions, and also incorporate properties of the joint distribution. We introduce \u03c6-quantours and \u03b1-radials, which are skyline points over subsets of the data, and propose (\u03c6, \u03b1)-quantiles, found from the union of these skylines, as statistical descriptors of two-dimensional distributions. We present efficient online algorithms for tracking (\u03c6, \u03b1)-quantiles on two-dimensional streams using guaranteed small space. We identify the principal properties of the proposed descriptors and perform extensive experiments with synthetic and real IP traffic data to study the efficiency of our proposed algorithms.",
        "category_a": "SSDBM",
        "category_b": "Others",
        "keywords": ["Algorithm", "Experiment", "Information", "Online algorithm", "Stock and flow", "Synthetic data"],
        "vec": [0.9218220711, 0.0457869098],
        "nodes": ["1709589", "2096611", "1711192", "1704011"]
    }
};