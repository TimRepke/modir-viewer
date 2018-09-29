class Categories {
    constructor(data, searchBoxId, listId, cat_type) {
        this.data = data;
        this.cat_type = cat_type;
        this.categories = data[cat_type + '_index'];
        this.searchBox = document.getElementById(searchBoxId);
        this.selectedCategory = null;

        let size = Object.keys(this.categories).length;
        let i = 0;
        for (let key in this.categories) {
            this.categories[key] = {
                'docs': this.categories[key],
                'colour': d3.hsv((i / size) * 360, 1, 1)
            };
            i++;
        }
    }

    getColour(doc) {
        let category = doc[this.cat_type];
        if (!category) return undefined;
        return this.categories[category]['colour'];
    }

    selectCategory(id) {
        this.selectedCategory = id;
        this.update();
    }

    buildRadios() {
        var radios = d3.select('#categories')
            .selectAll('div')
            .data(['none'].concat(categories))
            .classed('funkyradio-primary', true)
            .enter()
            .append('div');

        radios.insert('input')
            .attr('type', 'radio')
            .attr('name', 'radio')
            .attr('id', function (d, i) {
                return 'categoryRadio' + i;
            })
            .attr('value', function (d) {
                return d['name'] || 'none';
            })
            .on('change', function () {
                highlightCategory = this.value;
                update();
            });

        radios.insert('label')
            .attr('for', function (d, i) {
                return 'categoryRadio' + i;
            })
            .classed('personLabel', true)
            .text(function (d) {
                return (d['name'] || 'NONE!');
            })
            .on('change', function () {
                highlightCategory = this.value;
                update();
            });
    }

    updateSidebar() {
        let radios = d3.select("#categories")
            .selectAll('div')
            .filter(function (d) {
                return d['name'] === highlightCategory;
            })
            .select('input')
            .attr('checked', 'true');
    }

    update() {

    }
}

function filterCategoryRadios() {
    let input, filter, persons, divs, a, i;
    input = document.getElementById("personSearch");
    filter = input.value.toUpperCase();
    persons = document.getElementById("persons");
    divs = persons.getElementsByTagName("div");

    for (i = 0; i < divs.length; i++) {
        a = divs[i].getElementsByTagName("label")[0];
        if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
            divs[i].style.display = "";
        } else {
            divs[i].style.display = "none";
        }
    }
}