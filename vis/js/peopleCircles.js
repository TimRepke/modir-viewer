
function peopleCircleClick(event) {

    var domElement = $(event.target);

    highlight = domElement.attr('senderName');
    update();

}
