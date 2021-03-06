
// todo use strict, let instead of var (what was the reason?)

var offset = [57.0, 59.0];
var span = [112.0, 114.0];
var size = [800.0, 440.0];
var gridResolution = [40, 40]; // 20 too small, 40 okay, 80 rough but okay
var scale = [size[0] / span[0], size[1] / span[1]];
var highlight = [
    'none',
    'kay.mann@enron.com',
    'vince.kaminski@enron.com',
    'pete.davis@enron.com',
    'jeff.dasovich@enron.com',
    'sara.shackleton@enron.com',
    'enron.announcements@enron.com',
    'chris.germany@enron.com',
    'tana.jones@enron.com',
    'steven.kean@enron.com',
    'kate.symes@enron.com'][0];
var mailstore = null;
var peoplestore = null;
var wordstore = null;

var hoverMailContainer = document.getElementById('hover-mail');
d3.json("../data/mails.json", function (mails) {
    d3.json("../data/people.json", function (people) {
        d3.json("../data/words.json", function (words) {
            mailstore = mails;
            peoplestore = people;
            wordstore = words;
            var svgContainer = d3.select("#graph").append("svg")
                .attr("width", size[0] + 80) // +80 for text overhang
                .attr("height", size[1]+ 50);// +50 for text overhang

            function pos_x(d) {
                return d['pos'][0];
            }

            function pos_y(d) {
                return d['pos'][1]
            }

            mails = mails.map(function (d) {
                d['pos'] = [(d['2dvec'][0] + offset[0]) * scale[0], (d['2dvec'][1] + offset[1]) * scale[1]];
                return d;
            });
            people = people.map(function (d) {
                d['pos'] = [(d['position'][0] + offset[0]) * scale[0], (d['position'][1] + offset[1]) * scale[1]];
                return d;
            });

            var pplMap = people.reduce(function (acc, p) {
                if (!(p['name'] in acc))
                    acc[p['name']] = p;
                return acc;
            }, {}); // map from emails to people, could be computed before

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

            var heatmap = svgContainer.append('g');

            var popularity = mails.reduce(function (counter, mail) {
                var name = mail['from'];

                if (name in counter) counter[name]++;
                else counter[name] = 1;
                return counter
            }, {});

            var ranked = Object.entries(popularity).sort(function (a, b) {
                return b[1] - a[1];
            });

            var relevantPeople = people.filter(function (d) {
                return popularity[d['name']] > 150;
            }).sort(function (a, b) {
                return popularity[b['name']] - popularity[a['name']]
            }); // full info about people in here

            var pppl = relevantPeople.reduce(function (acc, p) { //
                if (acc.indexOf(p['name']) == -1) acc.push(p['name']);
                return acc;
            }, []); // list of relevant people (only email)
            var conns = mails.reduce(function (acc, m) {
                if (pppl.indexOf(m['from']) >= 0 && pppl.indexOf(m['to']) >= 0) { // why not write includes(...) ?!
                    var f = (m['from'] >= m['to']) ? m['from'] : m['to']; // string comparision?
                    var t = (m['from'] < m['to']) ? m['from'] : m['to']; // probably for the direction but still weird; todo ask tim
                    if (!(f in acc)) acc[f] = {};
                    if (!(t in acc[f])) acc[f][t] = 0;
                    acc[f][t]++;
                }
                return acc;
            }, {}); // js object (matrix) containings counts for each [from][to] email addresses

            var c = [];
            Object.keys(conns).forEach(function (f) {
                Object.keys(conns[f]).forEach(function (t) {
                    c.push({'f': f, 't': t, 'cnt': conns[f][t], 'start': pplMap[f]['pos'], 'end': pplMap[t]['pos']})
                });
            }); // array containing js object for each connection (better for sparse matrices?
            // also contians positions of each of the emails from the person

            var radios = d3.select('body').append('form')
                .attr('style', 'position:absolute; top:10px; right:10px;')
                .selectAll('label')
                .data(['none'].concat(relevantPeople))
                .enter()
                .append('label')
                .text(function (d) {
                    return (d['name'] || 'NONE!') + ' (' + (popularity[d['name']] || '*') + ')';
                })
                .insert('input')
                .attr('type', 'radio')
                .attr('name', 'highlightSelect')
                .attr('value', function (d) {
                    return d['name'] || 'none';
                })
                .on('change', function () {
                    highlight = this.value;
                    update();
                });

            var mailCircles = svgContainer.append('g').selectAll("circle")
                .data(mails)
                .enter()
                .append("circle")
                .on('mouseover', function (d) {
                    hoverMailContainer.style.display = 'block';
                    hoverMailContainer.innerHTML = d['raw'];
                })
                .on('mouseout', function (d) {
                    //hoverMailContainer.style.display = 'none';
                });

            var peopleConnections = svgContainer.append('g').selectAll('path')
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
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 0.5)
                .attr("stroke", "black");

            var peopleCircles = svgContainer.append('g').selectAll("circle")
                .data(relevantPeople)
                .enter()
                .append("circle");

            mailCircles
                .attr("cx", pos_x)
                .attr("cy", pos_y)
                .attr('r', 1.5);
            peopleCircles
                .attr("cx", pos_x)
                .attr("cy", pos_y);


            var topWords = svgContainer.append('g').selectAll('text')
                .data(words.reduce(function (selected_words, cell) {
                    var xmin = Math.ceil((cell['xmin'] + offset[0]) * scale[0]);
                    var xmax = Math.ceil((cell['xmax'] + offset[0]) * scale[0]);
                    var ymin = Math.ceil((cell['ymin'] + offset[1]) * scale[1]);
                    var ymax = Math.ceil((cell['ymax'] + offset[1]) * scale[1]);

                    for (var run = 0; run < 4 && run < cell['top_words'].length; run++) {

                        selected_words.push({
                            'x': Math.floor(Math.random() * (xmax - xmin + 1)) + xmin,
                            'y': Math.floor(Math.random() * (ymax - ymin + 1)) + ymin,
                            'size': cell['top_words'][run][0],
                            'word': cell['top_words'][run][1]
                        });
                    }
                    return selected_words;
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
                .attr("fill", "black");

            function update() {
                var mailCircleAttributes = mailCircles
                    .style("fill", function (d) {
                        if (d['from'] === highlight) return 'red';
                        return '#0073ff';
                    })
                    .style("fill-opacity", function (d) {
                        if (d['from'] === highlight) return 0.8;
                        return 0.1;
                    });
                var peopleCircleAttributes = peopleCircles
                    .attr("r", function (d) {
                        if (d['name'] === highlight) return 8.0;
                        return 5.0;
                    })
                    .style("fill", function (d) {
                        if (d['name'] === highlight) return 'green';
                        return 'red';
                    })
                    .style("fill-opacity", function (d) {
                        if (d['name'] === highlight) return 1.0;
                        return 0.8;
                    })
                    .style('stroke', function (d) {
                        if (d['name'] === highlight) return 'white';
                        return '';
                    });

                var hist = density(mails.filter(function (d) {
                    return d['from'] === highlight || d['to'] === highlight || highlight === 'none';
                }));

                var i0 = d3.interpolateHsvLong(d3.hsv(120, 1, 0.65), d3.hsv(60, 1, 0.90));
                var i1 = d3.interpolateHsvLong(d3.hsv(60, 1, 0.90), d3.hsv(0, 0, 0.95));
                var interpolateTerrain = function (t) {
                    if (t < 0.05) return d3.hsv(1, 1, 1, 0);
                    return t < 0.5 ? i0(t * 2) : i1((t - 0.5) * 2);
                };
                var min = Math.min.apply(Math, hist);
                var max = Math.max.apply(Math, hist);
                var color = d3.scaleSequential(interpolateTerrain).domain([min, max]);
                heatmap.selectAll("path").remove();
                heatmap.selectAll('path')
                    .data(d3.contours()
                        .size([Math.ceil(size[0] / gridResolution[0]), Math.ceil(size[1] / gridResolution[1])])
                        .thresholds(d3.range(min, max * 0.7, 5))
                        (hist))
                    .enter().append("path")
                    .attr("d", d3.geoPath(d3.geoIdentity().scale(gridResolution[0])))
                    .attr("fill", function (d) {
                        return color(d.value);
                    }).exit().remove();
            }

            update();
        });
    });
});