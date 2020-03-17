var addTime = function() {return changeTime(true)};
var subtractTime = function() {return changeTime(false)};
document.getElementById("addTime").addEventListener("click", addTime);
document.getElementById("subtractTime").addEventListener("click", subtractTime);

var setTimer = function() {
  var mins = Number(document.getElementById("mins").innerHTML) * 60 * 1000;
  var secs = Number(document.getElementById("secs").innerHTML) * 1000;
  return timerWithLimit(mins+secs);
};
document.getElementById("start").addEventListener("click", setTimer);

function convertTimeToNumber(time) {
  var minutes =  time.substring(0,time.indexOf("m"))
  return 1500000;
}

function changeTime(addFlag) {
  var mins = Number(document.getElementById("mins").innerHTML);
  if (addFlag) {
    document.getElementById("mins").innerHTML = mins + 5;
  } else {
    document.getElementById("mins").innerHTML = mins - 5;
  }
}

function timerWithLimit(timeLimit) {

  var startDate = new Date().getTime();

  // Update the count down every 1 second
  var x = setInterval(function() {

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = timeLimit - (now - startDate);

    // Time calculations for days, hours, minutes and seconds
    var mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var secs = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("mins").innerHTML = mins;
    document.getElementById("secs").innerHTML = secs;

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("time").innerHTML = "EXPIRED";
    }
  }, 1000);
}
