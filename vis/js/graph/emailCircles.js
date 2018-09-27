

function emailCircleClick(event) {

    var domElement = $(event.target);

    highlight = domElement.attr('senderName');
    update();

    let text = domElement.attr('emailContent');
    $('.modal-body').html(text);
    $('.modal-title').html('From: ' + highlight + '<br>To: ' + domElement.attr('receiverName'));

}

