class Heatmap {
    constructor() {
        this.thresholdLow = 0.05;
        this.thresholdHigh = 1.0;
        this.total = 100;
    }


    histSizeY() {
        return size[1] / gridResolution[1];
    }

    histSizeX() {
        return size[0] / gridResolution[0];
    }

    density(lst) {
        var grid = [];
        for (var i = 0; i < histSizeY(); i++) {
            grid[i] = [];
            for (var j = 0; j < histSizeX(); j++) {
                grid[i][j] = 0;
            }
        }

        lst.forEach(function (d) {
            var x = (pos_x(d) / size[0]) * grid[0].length;
            var y = (pos_y(d) / size[1]) * grid.length;

            x = Math.max(Math.min(x, grid[0].length - 1), 0);
            y = Math.max(Math.min(y, grid.length - 1), 0);

            x = Math.floor(x);
            y = Math.floor(y);
            grid[y][x]++
        });

        return grid.reduce(function (acc, curr) {
            return acc.concat(curr);
        }, []);

    }

    update() {
        var hist = density(mails.filter(function (d) {
            return d['from'] === highlight || d['to'] === highlight || highlight === 'none';
        }));

        var min = Math.min.apply(Math, hist);
        var max = Math.max.apply(Math, hist);

        //var i0 = d3.interpolateHsvLong(d3.hsv(120, 1, 0.65), d3.hsv(60, 1, 0.90));
        //var i1 = d3.interpolateHsvLong(d3.hsv(60, 1, 0.90), d3.hsv(0, 0, 0.95));
        var i0 = d3.interpolateHsvLong(d3.hsv(95, 0.0, 1.0), d3.hsv(95, 1.0, 1.0)); // first white, second green
        var i1 = d3.interpolateHsvLong(d3.hsv(95, 1.0, 1.0), d3.hsv(95, 1.0, 0.5)); // first green, second dark green
        var interpolateTerrain = function (t) {
            t = Math.min(1.0, Math.max(0.0, t));
            if (t < heatmapThresholdLow)
                return d3.hsv(1, 1, 1, 0); // red, invisible
            if (t > heatmapThresholdHigh)
                return d3.hsv(1, 0, 1, 1); // white, visible

            let s = (t - heatmapThresholdLow) / (heatmapThresholdHigh - heatmapThresholdLow);
            if (s < 0.5) {
                return i0(s * 2);
            }
            else {
                return i1((s - 0.5) * 2);
            }
        };

        var color = d3.scaleSequential(interpolateTerrain).domain([min, max]);
        heatmap.selectAll("path").remove();
        heatmap.selectAll('path')
            .data(d3.contours()
                .smooth(true)
                .size([Math.ceil(histSizeX()), Math.ceil(histSizeY())])
                .thresholds(d3.range(min, max, 1))
                (hist))
            .enter().append("path")
            .attr("d", d3.geoPath(d3.geoIdentity().scale(gridResolution[1]).translate([-8, -3])))
            .attr("fill", function (d) {
                return color(d.value);
            }).exit().remove();
    }

    initSidebar() {
        $("#slider-heatmap").slider({
            range: true,
            min: 0,
            max: 100,
            slide: function (event, ui) {

                slideHeatmap(ui.values[0] / total, ui.values[1] / total);
            },
            step: 5,
            values: [5, 100],
            orientation: "horizontal",
            animate: true
        });
    }

    slideHeatmap(percentageLow, percentageHigh) {
        heatmapThresholdLow = percentageLow;
        heatmapThresholdHigh = percentageHigh;
        updateHeatmap();
    }

}