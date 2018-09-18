var highlight = ['Jeff Dasovich',
    'Sara Shackleton',
    'Kay Mann',
    'Tana Jones',
    'Vince Kaminski',
    'Chris Germany',
    'Pete Davis',
    'UNK',
    'Gerald Nemec',
    'Matthew Lenhart',
    'Debra Perlingiere',
    'Mark Taylor',
    'John Arnold',
    'Louise Kitchen',
    'Susan Scott',
    'Kate Symes',
    'Sally Beck',
    'Elizabeth Sager',
    'Eric Bass',
    'D Steffes',
    'Michelle Cash',
    'Lynn Blair',
    'Mike Maggi',
    'Drew Fossum',
    'Carol Clair',
    'J Kaminski',
    'John Lavorato',
    'Michelle Nelson',
    'Marie Heard',
    'Jeffrey Shankman',
    'Dan Hyvl',
    'Steven Kean',
    'Richard Shapiro',
    'Mike Mcconnell',
    'Kimberly Watson',
    'Outlook Team',
    'Benjamin Rogers',
    'Phillip Love',
    'Mike Grigsby',
    'Rod Hayslett',
    'Daren Farmer',
    'Chris Dorland',
    'Shelley Corman',
    'Kevin Hyatt',
    'Stanley Horton',
    'Eva Pao Enron',
    'Arsystem',
    'Michelle Lokay',
    'Mark Haedicke',
    'Kerri Thompson',
    'David Delainey',
    'Darron Giron',
    'Bill Williams',
    'Susan Mara',
    'Houston',
    'Dutch Quigley',
    'W White',
    'Scott Neal',
    'Robin Rodrigue',
    'Mary Cook',
    'David Forster',
    'John.J.',
    'Enron Announcements'
][0];
highlight = 'none';

// 01: 2631.505970287577
// 02: 3333.9513311368687
// 03: 4023.692814617172
// 04: 3235.5327991385075
// 05: 3333.9513311368687
// 06: 3235.5327991385075
// 09: 3106.756895634146
// 10: 2992.9676614187697
// 11: 26067.876329178576
// 12: 24776.955336558865

var datastore = null;
var hoverMailContainer = document.getElementById('hover-mail');
var heatmap;
var mails;
var people;
var mailCircles;
var peopleCircles;

var offset;
var size = [$('#main').width(), $('#main').height()];
var gridResolution = [60, 60]; // 20 too small, 40 okay, 80 rough but okay
var scale;
var threshold = 0.05;

function pos_x(d) {
    return d['pos'][0];
}

function pos_y(d) {
    return d['pos'][1]
}

function density(lst) {
    var grid = [];
    for (var i = 0; i < size[1] / gridResolution[1]; i++) {
        grid[i] = [];
        for (var j = 0; j < size[0] / gridResolution[0]; j++) {
            grid[i][j] = 0;
        }
    }

    lst.forEach(function (d) {
        var x = Math.floor(pos_x(d) / gridResolution[0]);
        var y = Math.floor(pos_y(d) / gridResolution[1]);
        grid[(y < grid[0].length) ? y : (grid[0].length - 1)][(x < grid.length) ? x : (grid.length - 1)]++;
    });

    return grid.reduce(function (acc, curr) {
        return acc.concat(curr);
    }, []);

}

function updateHeatmap(thresh, overwrite) {
    var hist = density(mails.filter(function (d) {
        return d['from'] === highlight || d['to'] === highlight || highlight === 'none';
    }));


    if(overwrite) {
        threshold = thresh;
    }


    //var i0 = d3.interpolateHsvLong(d3.hsv(120, 1, 0.65), d3.hsv(60, 1, 0.90));
    //var i1 = d3.interpolateHsvLong(d3.hsv(60, 1, 0.90), d3.hsv(0, 0, 0.95));
    var i0 = d3.interpolateHsvLong(d3.hsv(95, 0.0, 1.0), d3.hsv(95, 1.0, 1.0)); // first white, second green
    var i1 = d3.interpolateHsvLong(d3.hsv(95, 1.0, 1.0), d3.hsv(95, 1.0, 0.5)); // first green, second dark green
    var interpolateTerrain = function (t) {
        if (t < threshold) return d3.hsv(1, 1, 1, 0); // red, invisible
        t = (t - threshold) / (1.0 - threshold);
        return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2);
    };
    var min = Math.min.apply(Math, hist);
    var max = Math.max.apply(Math, hist);
    var color = d3.scaleSequential(interpolateTerrain).domain([min, max]);
    heatmap.selectAll("path").remove();
    heatmap.selectAll('path')
        .data(d3.contours()
            .size([Math.ceil(size[0] / gridResolution[0]), Math.ceil(size[1] / gridResolution[1])])
            .thresholds(d3.range(min, max * .7, 5))
            (hist))
        .enter().append("path")
        .attr("d", d3.geoPath(d3.geoIdentity().scale(gridResolution[0])))
        .attr("fill", function (d) {
            return color(d.value);
        }).exit().remove();
}

function updateSelectedCircles() {
    var mailCircleAttributes = mailCircles
        .style("fill", function (d) {
            if (d['from'] === highlight) return '#ff0c27';
            return '#0073ff';
        })
        .style("fill-opacity", function (d) {
            if (d['from'] === highlight) return 0.8;
            return 0.1;
        });

    var peopleCircleAttributes = peopleCircles
        .attr("r", function (d) {
            if (d['name'] === highlight) return 6.0;
            return 4.0;
        })
        .style("fill", function (d) {
            if (d['name'] === highlight) return '#ff0c27';
            return '#2357d6';
        })
        .style("fill-opacity", function (d) {
            if (d['name'] === highlight) return 1.0;
            return 0.8;
        })
        .style('stroke', function (d) {
            if (d['name'] === highlight) return 'white';
            return '';
        });

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
    var highlightedCircle = peopleCircles.filter(function(d) {
        return d['name'] == highlight;
    }).moveToFront();
}

function update() {
    updateHeatmap(0.05, false);
    updateSelectedCircles();
}

function buildRadios(relevantPeople, popularity) {
    var radios = d3.select('#persons')
        .selectAll('div')
        .data(['none'].concat(relevantPeople))
        .classed('funkyradio-primary', true)
        .enter()
        .append('div');

    radios.insert('input')
        .attr('type', 'radio')
        .attr('name', 'radio')
        .attr('id', function (d, i) {
            return 'radio' + i;
        })
        .attr('value', function (d) {
            return d['name'] || 'none';
        })
        .on('change', function () {
            highlight = this.value;
            update();
        });

    radios.insert('label')
        .attr('for', function (d, i) {
            return 'radio' + i;
        })
        .classed('personLabel', true)
        .text(function (d) {
            return (d['name'] || 'NONE!') + ' (' + (popularity[d['name']] || '*') + ')';
        })
        .on('change', function () {
            highlight = this.value;
            update();
        });
}


function buildGraph() {
    d3.json("data/data_15.json.res.web.json", function (data) {
        datastore = data;


        mails = data['mails'];
        people = Object.entries(data['people']).map(function (d) {
            return d[1];
        });

        offset = [Math.abs(data['range']['xmin']), Math.abs(data['range']['ymin'])];
        scale = (function (size, span) {
            return [size[0] / span[0], size[1] / span[1]];
        }(size, [data['hspan'], data['vspan']]));

        var height = size[1] + 50; // +50 for text overhang
        var width = size[0] + 80; // +80 for text overhang

        var svgContainer = d3.select("#graph").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("id", "svg");
        var svgGroup = svgContainer.append('g');


        function pos(vec) {
            return [(vec[0] + offset[0]) * scale[0], (vec[1] + offset[1]) * scale[1]];
        }

        mails = mails.map(function (d) {
            d['pos'] = pos(d['vec']);
            return d;
        });
        people = people.map(function (d) {
            d['pos'] = pos(d['vec']);
            return d;
        });


        heatmap = svgGroup.append('g');

        var popularity = people.reduce(function (acc, curr) {
            acc[curr['name']] = curr['sent'].length;
            return acc;
        }, {});

        var ranked = Object.entries(popularity).sort(function (a, b) {
            return b[1] - a[1];
        });

        var relevantPeople = people.filter(function (d) {
            return popularity[d['name']] >= 70; //25
        }).sort(function (a, b) {
            return popularity[b['name']] - popularity[a['name']]
        });

        var pppl = relevantPeople.reduce(function (acc, p) {
            if (acc.indexOf(p['name']) < 0) acc.push(p['name']);
            return acc;
        }, []);

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

        var c = [];
        Object.keys(conns).forEach(function (f) {
            Object.keys(conns[f]).forEach(function (t) {
                c.push({
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

        console.log(c.reduce(function (sum, curr) {
            sum += curr['len'];
            return sum;
        }, 0));

        buildRadios(relevantPeople, popularity);

        mailCircles = svgGroup.append('g').selectAll("circle")
            .data(mails)
            .enter()
            .append("circle")
            .attr('data-toggle', 'tooltip')
            .attr('data-placement', 'top')
            .attr('data-html', 'true')
            .attr('title', function (d) {
                return "<em>" + d['from'] + "</em>:<br>" + d['text'];
            });

        var peopleConnections = svgGroup.append('g').selectAll('path')
            .data(c)
            .enter()
            .append('line')
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
                //return d['cnt'] > 1 ? (d['cnt']/3) : 1;
                return 1;
            })
            .attr("stroke-opacity", 0.5)
            .attr("stroke", "black");

        peopleCircles = svgGroup.append('g').selectAll("circle")
            .data(relevantPeople)
            .enter()
            .append("circle")
            .attr('data-toggle', 'tooltip')
            .attr('data-placement', 'top')
            .attr('data-html', 'true')
            .attr('title', function (d) {
                return d['name'] + "<br>" + d['email'];
            });

        mailCircles
            .attr("cx", pos_x)
            .attr("cy", pos_y)
            .attr('r', 1.5);
        peopleCircles
            .attr("cx", pos_x)
            .attr("cy", pos_y);

        var topWords = svgGroup.append('g').selectAll('text')
            .data(data['wordgrid']['words'].reduce(function (acc, curr, i) {
                var col = Math.floor(i / data['wordgrid']['nCols']);
                var row = Math.floor((i - (col * data['wordgrid']['nRows'])) % data['wordgrid']['nRows']);
                //console.log('col: ' + col + ' | row: ' + row);

                var xmin = Math.ceil((col * data['wordgrid']['hGridSize']) * scale[0]);
                var xmax = Math.ceil(((col + 1) * data['wordgrid']['hGridSize']) * scale[0]);
                var ymin = Math.ceil((row * data['wordgrid']['vGridSize']) * scale[1]);
                var ymax = Math.ceil(((row + 1) * data['wordgrid']['vGridSize']) * scale[1]);

                for (var run = 0; run < 4 && run < curr.length; run++) {
                    acc.push({
                        'x': Math.floor(Math.random() * (xmax - xmin + 1)) + xmin,
                        'y': Math.floor(Math.random() * (ymax - ymin + 1)) + ymin,
                        'size': curr[run][1],
                        'word': curr[run][0]
                    })
                }
                return acc;
            }, []))
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
                var size = d.size * 50;
                if (size < 8) size = 8;
                if (size > 20) size = 20;
                return size + 'px';
            })
            .attr("fill", "black")
            .style('pointer-events', 'none');


        let curr_scale = 1.0;

        function zoomed() {
            svgGroup.attr("transform", d3.event.transform);
            let scale = Math.max(Math.min(1.5 / d3.event.transform.k, 2.0), 0.6);
            if (Math.abs(scale - curr_scale) > 0.5) {
                mailCircles
                    .attr('r', scale);
                curr_scale = scale;
            }
        }

        svgContainer.call(d3.zoom()
            .scaleExtent([1 / 4, 10])
            .on("zoom", zoomed));

        updateHeatmap(0.05, true);
        updateSelectedCircles();
    });
}

function reload() {
    size = [$('#main').width(), $('#main').height()];
    let elem = document.getElementById('svg');
    elem.parentNode.removeChild(elem);
    buildGraph();
}

buildGraph();


/*
<h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
                    <span>Saved views</span>
                </h6>

                <ul class="nav flex-column mb-2">
                    <li class="nav-item">
                        <a class="nav-link" href="#">
                            <span data-feather="file-text"></span>
                            View 1
                        </a>
                    </li>
                </ul>
 */