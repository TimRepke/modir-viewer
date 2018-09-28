class WordGrid {
    constructor() {
        this.zoom = 1.0;
    }

    computeGridResolution(size) { // todo compute smart scale which adjusts so the grid fits with error < epsilon or offset the heatmap??
        let scale = 60;
        let res = Math.max(Math.floor(size[0] / scale), Math.floor(size[1] / scale));
        return [res, res];
    }

    adjustZoomLevel(currentZoomLevel) {
        if (Math.abs(currentZoomLevel - this.zoom) > 0.1) {
            this.zoom = currentZoomLevel;
            this.update();
        }
    }

    update() {
        let percentage = Math.max(Math.min(Math.pow(currentWordZoom, 2) / 80, 1.0), 0.0);

        let data = [];
        for (let i = 0; i < topWordsData.length; i++) {
            let cell = topWordsData[i];
            let words = cell.slice(0, Math.ceil(percentage * cell.length));
            data = data.concat(words);
        }

        let topWordsText = topWords.selectAll('text')
            .data(data);
        topWordsText
            .attr('x', function (d) {
                return d.x;
            })
            .attr('y', function (d) {
                return d.y;
            })
            .text(function (d) {
                return d.word;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                var size = d.size * 50 * (1 / Math.pow(currentWordZoom, 1));
                if (size < d.size * 20) size = d.size * 20;
                size = Math.min(Math.max(size, 10 * (1 / Math.sqrt(currentWordZoom))), 20);
                size = Math.max(Math.max(size, (10 - currentWordZoom)), 2);
                return size + 'px';
            })
            .attr("fill", function (d) {
                return '#000000'
            })
            .attr("fill-opacity", function (d) {
                return Math.max(Math.min(10 * d.size, 1.0), 0.6);
            })
            .style('pointer-events', 'none');

        topWordsText
            .enter()
            .append('text')
            .attr('x', function (d) {
                return d.x;
            })
            .attr('y', function (d) {
                return d.y;
            })
            .text(function (d) {
                return d.word;
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function (d) {
                var size = d.size * 50 * (1 / Math.pow(currentWordZoom, 2));
                if (size < 3) size = 3;
                if (size > 20) size = 20;
                return size + 'px';
            })
            .attr("fill", function (d) {
                return '#000000'
            })
            .attr("fill-opacity", function (d) {
                return 0.7;
            })
            .style('pointer-events', 'none');

        topWordsText
            .exit()
            .remove();
    }

    initData() {
        topWordsData = data['wordgrid']['words'].reduce(function (acc, curr, i) { // probably in column major order
            var col = Math.floor(i / data['wordgrid']['nCols']);
            var row = Math.floor((i - (col * data['wordgrid']['nRows'])) % data['wordgrid']['nRows']);
            //console.log('col: ' + col + ' | row: ' + row);

            // current cell AABB
            var xmin = Math.ceil((col * data['wordgrid']['hGridSize']) * scale[0]);
            var xmax = Math.ceil(((col + 1) * data['wordgrid']['hGridSize']) * scale[0]);
            var ymin = Math.ceil((row * data['wordgrid']['vGridSize']) * scale[1]);
            var ymax = Math.ceil(((row + 1) * data['wordgrid']['vGridSize']) * scale[1]);

            let cell = [];
            for (var run = 0; run < 80 && run < curr.length; run++) { // todo sort by size so only the most important word are shown
                cell.push({
                    'x': Math.floor(Math.random() * (xmax - xmin + 1)) + xmin,
                    'y': Math.floor(Math.random() * (ymax - ymin + 1)) + ymin,
                    'size': curr[run][1],
                    'word': curr[run][0]
                });
            }
            if (cell.length > 0) {
                acc.push(cell);
            }

            return acc;
        }, []);
    }
}