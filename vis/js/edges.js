class Edges {
    constructor() {

        this.total = 100;
        this.thresholdLow = 0.0;
        this.thresholdHigh = 1.0;
    }

    initLandscape() {
        var conns = mails.reduce(function (acc, m) {
            for (var key in m['to']) {
                var to = m['to'][key];
                if (pppl.indexOf(m['from']) >= 0 && pppl.indexOf(to) >= 0) {
                    var f = (m['from'] >= to) ? m['from'] : to;
                    var t = (m['from'] < to) ? m['from'] : to;
                    if (!(f in acc)) acc[f] = {};
                    if (!(t in acc[f])) acc[f][t] = 0;
                    acc[f][t]++;
                }
            }
            return acc;
        }, {});

        connectionArray = [];
        Object.keys(conns).forEach(function (f) {
            Object.keys(conns[f]).forEach(function (t) {
                connectionArray.push({
                    'f': f, 't': t, 'cnt': conns[f][t],
                    'start': pos(data['people'][f]['vec']),
                    'end': pos(data['people'][t]['vec']),
                    'len': Math.sqrt(
                        Math.pow(data['people'][f]['vec'][0] - data['people'][t]['vec'][0], 2) +
                        Math.pow(data['people'][f]['vec'][1] - data['people'][t]['vec'][1], 2)
                    )
                })
            });
        });

        connectionArray.sort(function (a, b) {
            return a['cnt'] - b['cnt'];
        });
    }

    update() {

        let connectionArrayFiltered = connectionArray.filter(function (d, i) {
            return (connectionArray.length * connectionThresholdLow) <= i && i <= (connectionArray.length * connectionThresholdHigh);
        });

        //peopleConnections.selectAll('line').remove();

        let peopleConnectionLines = peopleConnections.selectAll('line')
            .data(connectionArrayFiltered);

        peopleConnectionLines
            .enter()
            .append('line');
        peopleConnectionLines
            .exit()
            .remove();

        var max = d3.max(connectionArray, function (d) {
            return d['cnt'];
        });
        var min = d3.min(connectionArray, function (d) {
            return d['cnt'];
        });


        peopleConnections.selectAll('line')
            .attr('x1', function (d) {
                return d['start'][0];
            })
            .attr('y1', function (d) {
                return d['start'][1];
            })
            .attr('x2', function (d) {
                return d['end'][0];
            })
            .attr('y2', function (d) {
                return d['end'][1];
            })
            .attr("stroke-width", function (d) {
                var maxWidth = 20;
                var minWidth = 0.5;
                return minWidth + (maxWidth - minWidth) * (d['cnt'] / (max - min));
                //return 1;
            })
            .attr("stroke-opacity", function (d) {
                return Math.min(Math.max(1 - (d['cnt'] / (max - min)), 0.20), 0.5);
            })
            .attr("stroke", "black");
    }

    initSidebar() {
        $("#slider-connections").slider({
            range: true,
            min: 0,
            max: 100,
            slide: function (event, ui) {
                slideConnections(ui.values[0] / total, ui.values[1] / total);
            },
            step: 5,
            values: [0, 100],
            orientation: "horizontal",
            animate: true
        });
    }

    slideConnections(percentageLow, percentageHigh) {
        connectionThresholdLow = percentageLow;
        connectionThresholdHigh = percentageHigh;
        updateConnections();
    }
}