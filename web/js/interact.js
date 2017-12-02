var countingDown = false,
    countdownDone = false,
    score = 0,
    pressing = 0,
    platform = "unknown",
    tmpPlatform = "unknown";

function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function countDown(){
    var sec = 10,
        msec = 100;
    score = 0;
    pressing = 0;

    countingDown = true;

    $("#options").find("input").prop("disabled", true);
    // $(".sec").text("09");

    var secInt = setInterval(function(){
        if(sec != 1){
            sec--;
            $(".sec").text(pad(sec,2));
        } else {
            $(".sec").text("00");
            clearInterval(secInt);
            countdownDone = true;
            platform = tmpPlatform;
            $("#options, #game").find("input").prop("disabled", false);
            $(".tap-button").fadeOut(500).prop("disabled", true);
            $("#share").fadeIn(500);
            $("#share").find("#share-fb").attr("href", "https://www.facebook.com/sharer/sharer.php?u=http%3A//shmupspeed.com/score/" + score);
            $("#share").find("#share-tw").attr("href", "https://twitter.com/intent/tweet?url=www.shmupspeed.com&text=I%20just%20scored%20"+ score +"%20on%20#ShmupSpeed!%20Finger%20dexterity%20game%20on%20point!");
        }
    },1000);

    /*var msecInt = setInterval(function(){
        if(msec != 0){
            msec--;
            $(".msec").text(pad(msec,2));
        } else {
            msec = 99;
            $(".msec").text(pad(msec,2));
        }

        if(sec == 0 && msec == 0){
            countdownDone = true;
            platform = tmpPlatform;
            clearInterval(msecInt);
            $("#options, #game").find("input").prop("disabled", false);
            $(".tap-button").fadeOut(500).prop("disabled", true);
            $("#share").fadeIn(500);
            $("#share").find("#share-fb").attr("href", "https://www.facebook.com/sharer/sharer.php?u=http%3A//shmupspeed.com/score/" + score);
            $("#share").find("#share-tw").attr("href", "https://twitter.com/intent/tweet?url=www.shmupspeed.com&text=I%20just%20scored%20"+ score +"%20on%20#ShmupSpeed!%20Finger%20dexterity%20game%20on%20point!");
        }
    },10);*/
}

function reset(){
    countingDown = false;
    countdownDone = false;
    score = 0;

    $(".sec").text("10");
    $(".msec").text("00");
    $(".counter").text("000");
    $("#score").text("000");

    $(".reset, .submit, #username input").prop("disabled", true);
    $("#share").fadeOut(500);
    $(".tap-button").fadeIn(500).prop("disabled", false);
}

function submitScore(e){
    e.preventDefault();

    if($("#username").find("input").val() == ""){
        $("#errors").show();

        setTimeout(function(){
            $("#errors").hide();
        },3000);
    } else {
        var dateNow = new Date();

        $(".submit").prop("disabled", "true");

        $("#shmupbundle_score_dateCreated_year").val(dateNow.getFullYear());
        $("#shmupbundle_score_dateCreated_month").val(dateNow.getMonth()+1);
        $("#shmupbundle_score_dateCreated_day").val(dateNow.getDate());
        $("#shmupbundle_score_score").val(score);
        $("#shmupbundle_score_platform").val(platform);
        $("#shmupbundle_score_name").val($("#username").find("input").val());

        var $form = $("form[name='shmupbundle_score']"),
            formSerialize = $form.serialize();

        $.post(url, formSerialize, function(response){
            console.log(response.status);
        }, 'JSON');
    }
}

function updateScore(){
    $("#score").text(pad(score,3));
}

/* Google Analytics */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-48989090-9', 'auto');
ga('send', 'pageview');

/* Interactions */
$(document).ready(function(){
    /* Gameplay */
    // Detect button pressed
    function btnPressed(){
        pressing++;
    }
    // Detect button released
    function btnReleased(){
        pressing--;

        if($("#game").hasClass("active")) {
            if (!countingDown) {
                countDown();
            }

            if (!countdownDone && pressing === 0) {
                score++;
                updateScore();
            }
        }
    }

    // Keypress (desktop)
    $(window).keydown(function(){
        btnPressed();
    });
    $(window).keyup(function(e){
        btnReleased();
        tmpPlatform = "keyboard";
        // ga('send', 'event', 'Keyboard', 'Button pressed', e);
    });

    // Tap (mobile)
    $(".tap-button").click(function(e){
        btnPressed();
        btnReleased();
        tmpPlatform = "touch";
        // ga('send', 'event', 'Mobile', 'Tap pressed', e);
    });

    // Gamepad Controller
    var $gamepad = new Gamepad();
    $gamepad.on("connect", function(e){
        // ga('send', 'event', 'Gamepad', 'Gamepad detected', e);
    });

    for(var x in $gamepad._keyMapping.gamepad){
        var gpadPressed = x.toString();
        $gamepad.on("press", gpadPressed, function(e){
            btnPressed();
        });
    }

    for(var y in $gamepad._keyMapping.gamepad){
        var gpadReleased = y.toString();
        $gamepad.on("release", gpadReleased, function(e){
            btnReleased();
            tmpPlatform = "controller";
            // ga('send', 'event', 'Gamepad', 'Gamepad pressed', e);
        });
    }


    /* Other */
    // Reset the scoreboard
    $(".reset").click(function(){
        reset();
        ga('send', 'event', 'Options', 'Reset');
    });

    // Submit score
    $(".submit").click(function(e){
        submitScore(e);
        ga('send', 'event', 'Options', 'Score submitted', "Score: " + score);
    });

    // Footer copyright year
    $("#this-year").text(new Date().getYear() + 1900);

    // Section swap
    var swapping = false;
    $("input[type=button][class^=view-]").click(function(e){
        if(!($(this).hasClass("active")) && !(swapping)){
            var selectedSection = e.target.className.split("-")[1];
            swapping = true;

            ga('send', 'pageview', selectedSection);

            $("#options").find("input").removeClass("active");
            $(".wrapper").find("section").removeClass("active");
            $(this).addClass("active");

            setTimeout(function(){
                swapping = false;
                $("#" + selectedSection).addClass("active");
            },500);
        }
    });

    // Cartridge clicked
    $("#cartridge").click(function(){
        ga('send', 'event', 'Cartridge', 'NES ROM downloaded');
    });

    // Social Shares
    $("#share-fb, #share-tw").click(function(e){
        e.preventDefault();

        var url = $(this).attr("href");
        window.open(url, "Share your score", "width=400,height=400,scrollbars=yes");
    });

    // Extra Analytics
    $("#extra-life").click(function(){
        ga('send', 'pageview', '/Extra Life');
    });
    $("#share-fb").click(function(){
        ga('send', 'event', 'Share', "Facebook Share", "Shared score: " + score);
    });
    $("#share-tw").click(function(){
        ga('send', 'event', 'Share', "Twitter Share", "Shared score: " + score);
    });
});