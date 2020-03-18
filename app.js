// Constants
const defaultMins = 25;
const defaultSecs = 0;
const defaultMinChange = 5;
const smallMinChange = 1;
const maxMins = 60;
const minMins = 1;

chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'], function(result) {
  if (result.blocked) {
    console.log("Blocked");

    // Update the count down every 1 second
    var x = setInterval(function() {
      setTime(result.startTime, result.timeLimit)
    }, 1000);
    setTime(result.startTime, result.timeLimit);
  } else {
    console.log("Not blocked");

    const addTime = function() {return changeTime(true)};
    document.getElementById("addTime").addEventListener("click", addTime);

    const subtractTime = function() {return changeTime(false)};
    document.getElementById("subtractTime").addEventListener("click", subtractTime);

    const setTimer = function() {
      document.getElementById("addTime").removeEventListener("click", addTime);
      document.getElementById("subtractTime").removeEventListener("click", subtractTime);

      var mins = Number(document.getElementById("mins").innerHTML) * 60 * 1000;
      var secs = Number(document.getElementById("secs").innerHTML) * 1000;

      return timerWithLimit(mins+secs);
    };
    document.getElementById("start").addEventListener("click", setTimer);
  }
});

function changeTime(addFlag) {
  var mins = Number(document.getElementById("mins").innerHTML);

  var minChange = defaultMinChange;
  if (mins + addFlag <= minChange) {
    minChange = smallMinChange;
  }

  if (addFlag) {
    if (mins < maxMins) {
      document.getElementById("mins").innerHTML = mins + minChange;
    }
  } else {
    if (mins > minMins) {
      document.getElementById("mins").innerHTML = mins - minChange;
    }
  }
}

function timerWithLimit(timeLimit) {

  chrome.storage.sync.set({"timeLimit": timeLimit}, function() {
          console.log('Time limit is set to ' + timeLimit);
  });

  let startTime = new Date().getTime();
  chrome.storage.sync.set({"startTime": startTime}, function() {
          console.log('Start time is set to ' + startTime);
  });

  chrome.storage.sync.set({"blocked": true});

  // Update the count down every 1 second
  var x = setInterval(function() {
    setTime(startTime, timeLimit)
  }, 1000);
}

function addZeroPad(num, numDigits) {
  strNum = String(num)
  while (strNum.length < numDigits) {strNum = '0' + strNum}
  return strNum
}

function setTime(start, limit) {
  // Get the current time.
  let now = new Date().getTime();

  // Calculate the time remaining.
  let distance = now - start
  let remaining = limit - distance

  // Convert time remaining to minutes and seconds.
  let mins, secs;
  if (remaining > 0) {
    mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    secs = Math.floor((remaining % (1000 * 60)) / 1000);
  } else {
    mins = defaultMins;
    secs = defaultSecs;
    chrome.storage.sync.set({"blocked": false});
  }

  document.getElementById("mins").innerHTML = addZeroPad(mins, 2);
  document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
}
