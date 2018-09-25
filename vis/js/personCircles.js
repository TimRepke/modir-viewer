

function personCircleClick(event) {

    var domElement = $(event.target);
    //highlight = domElement.attr('emailSenderName');
    let text = domElement.attr('title');
    $('#modal-text').html(text);
    update();
}