var countingDown = false,
    countdownDone = false,
    score = 0,
    pressing = 0;

function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function countDown(){
    var sec = 10,
        msec = 100;

    countingDown = true;

    $("#options").find("input").prop("disabled", true);
    $(".sec").text("09");

    var secInt = setInterval(function(){
        if(sec != 0){
            sec--;
            $(".sec").text(pad(sec,2));
        } else {
            clearInterval(secInt);
        }
    },1000);

    var msecInt = setInterval(function(){
        if(msec != 0){
            msec--;
            $(".msec").text(pad(msec,2));
        } else {
            msec = 99;
            $(".msec").text(pad(msec,2));
        }

        if(sec == 0 && msec == 0){
            countdownDone = true;
            clearInterval(msecInt);
            $("#options, #game").find("input").prop("disabled", false);
        }
    },10);
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
        if($("#game").hasClass("active")){
            pressing++;
        }
    }
    // Detect button released
    function btnReleased(){
        if($("#game").hasClass("active")) {
            pressing--;

            if (!countingDown) {
                countDown();
            }

            if (!countdownDone && pressing < 1) {
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
        ga('send', 'event', 'Keyboard', 'Button pressed', e);
    });

    // Tap (mobile)
    $(".tap-button").click(function(e){
        btnPressed();
        btnReleased();
    });

    // Gamepad Controller
    var $gamepad = new Gamepad();
    $gamepad.on("connect", function(e){
        ga('send', 'event', 'Gamepad', 'Gamepad detected', e);
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
            ga('send', 'event', 'Gamepad', 'Gamepad pressed', e);
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
            $("body")[0].className = selectedSection;

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
});