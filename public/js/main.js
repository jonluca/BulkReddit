/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.body.style.backgroundColor = "white";
}
//extension to jQuery for animate.css
$.fn.extend({
    animateCss: function(animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});

$(document).ready(function() {
    $('#txt').click(function() {
        getTxt();
    });

    $('#pdf').click(function() {
        getPdf();
    });
});

function getTxt() {
    $('#txt').animateCss('pulse');
    $.ajax({
        method: 'POST',
        url: "/BulkReddit/download",
        type: 'json',
        data: {
            checked: checkArray
        },
        success: showNewImage,
        error: function(data, code, jqXHR) {
            $(".loader").css("display", "none");
            $("#info").text("Error! Please try again.");
        }
    });
}

function getPdf() {
    $('#pdf').animateCss('pulse');
}