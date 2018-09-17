function filterBoxes() {
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