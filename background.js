var totalTime = convertTimeToNumber((document.getElementById("time").innerHTML));

function convertTimeToNumber(timeString) {

  return 1500000;
}

document.getElementById("start").addEventListener("click", timer);

function timer() {

  var startDate = new Date().getTime();

  // Update the count down every 1 second
  var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = totalTime - (now - startDate);

    // Time calculations for days, hours, minutes and seconds
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("time").innerHTML = minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("time").innerHTML = "EXPIRED";
    }
  }, 1000);
}
