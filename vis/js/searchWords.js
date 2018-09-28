
function searchWords(event) {
    return;
    if (event.keyCode === 13) {
        let input, filter;
        input = document.getElementById("wordSearch");
        filter = input.value.toUpperCase();
        if(filter === "") {
            highlightedEmailIndizes = [];
            updateSelectedCircles();
            return;
        }
        let res = idx.search(filter);
        highlightedEmailIndizes = [];
        for (let i = 0; i < res.length; i++) {
            highlightedEmailIndizes[res[i]['ref']] = true;
        }

        updateSelectedCircles();
    }
}