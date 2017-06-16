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
        if (type == "Hot" || type == "New") {
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
    $("#title").text("Reddit Offline Cache");
    $("#loading").css('display', 'block');
    $("#options").css('display', 'none');
    let subreddit = $("#subreddit").val();
    let time = $('#time').find(":selected").text();
    let type = $('#type').find(":selected").text();

    if (time == undefined) {
        time = "all";
    }
    if (subreddit == undefined || subreddit == "") {
        subreddit = "TalesFromTechSupport";
    }
    if (type == undefined || type == "") {
        type = "Hot";
    }
    subreddit = subreddit.trim();

    $.ajax({
        method: 'POST',
        url: "/BulkReddit/download",
        type: 'json',
        data: {
            subreddit: subreddit,
            time: time,
            type: type,
            file: fileType
        },
        success: processFile,
        error: function(data, code, jqXHR) {
            //some kind of error
            $("#title").text("Error! Please refresh and try again");
        }
    });


}

function processFile(data, code, jqXHR) {
    location.pathname = "/BulkReddit/" + data.url;
    $("#loading").css('display', 'none');
    $("#options").css('display', 'flex');
}