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
    $("#type").change(function() {
        let type = $('#type').find(":selected").text();
        if (type != "Top" || type != "Controversial") {
            $('#time').find("select").prop('disabled', true);
            $("#time").css("display", "none");
        } else {
            $('#time').find("select").removeAttr("disabled");
            $("#time").css("display", "block");
        }

    });
    $('#txt').click(function() {
        $('#txt').animateCss('pulse');
        download("txt");
    });

    $('#pdf').click(function() {
        $('#pdf').animateCss('pulse');
        download("pdf");
    });
});



function download(fileType) {
    let subreddit = $("#subreddit").val();
    let time = $('#time').find(":selected").text();
    let type = $('#type').find(":selected").text();
    let numberOfPosts = $("#num").val();
    var numericVal = parseInt(numberOfPosts);

    if (numericVal > 100 || isNaN(numericVal)) {
        $("#num").val("100");
        numericVal = 100;
    }
    if (numericVal < 1) {
        $("#num").val("1");
        numericVal = 1;
    }
    $.ajax({
        method: 'GET',
        url: "/BulkReddit/download",
        type: 'json',
        data: {
            subreddit: subreddit,
            time: time,
            type: type,
            numberOfPosts: numberOfPosts,
            file: fileType
        },
        success: processFile,
        error: function(data, code, jqXHR) {
            //some kind of error
        }
    });


}

function processFile(data, code, jqXHR) {
    console.log(data);
}