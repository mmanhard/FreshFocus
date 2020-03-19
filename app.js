// Constants
const defaultMins = 25,     defaultSecs = 0;
const defaultMinChange = 5, smallMinChange = 1;
const minMins = 1,          maxMins = 60;

var myTimer;

chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'], function(result) {
  if (result.blocked) {
    console.log("Blocked");

    addStopListeners();

    // Update the count down every 1 second
    myTimer = setInterval(function() {
      checkTime(result.startTime, result.timeLimit)
    }, 1000);
  } else {
    console.log("Not blocked");
    addStartListeners();
  }
});

function addStartListeners() {
  const addTime = function() {return changeTime(true)};
  document.getElementById("addTime").addEventListener("click", addTime);

  const subtractTime = function() {return changeTime(false)};
  document.getElementById("subtractTime").addEventListener("click", subtractTime);

  const setTimer = function() {
    document.getElementById("addTime").removeEventListener("click", addTime);
    document.getElementById("subtractTime").removeEventListener("click", subtractTime);

    const mins = Number(document.getElementById("mins").innerHTML) * 60 * 1000;
    const secs = Number(document.getElementById("secs").innerHTML) * 1000;

    return startTimer(mins+secs);
  };
  document.getElementById("start").addEventListener("click", setTimer);
}

function addStopListeners() {
  document.getElementById("stop").addEventListener("click", stopTimer);
}

function changeTime(addFlag) {
  const mins = Number(document.getElementById("mins").innerHTML);

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

// function addToBlackList() {
//   let newURL = document.getElementById("newURL").innerHTML
// }

function startTimer(timeLimit) {

  let startTime = new Date().getTime();
  chrome.storage.sync.set({"startTime": startTime});
  chrome.storage.sync.set({"timeLimit": timeLimit});
  chrome.storage.sync.set({"blocked": true});
  urls = ["*://*.facebook.com/*", "*://*.cnn.com/*", "*://*.twitter.com/*"]
  chrome.storage.sync.set({"urls": JSON.stringify(urls)});

  chrome.runtime.sendMessage({filter: "update"});

  // Update the count down every 1 second
  myTimer = setInterval(function() {
    checkTime(startTime, timeLimit)
  }, 1000);
}

function stopTimer() {
  chrome.storage.sync.remove(['startTime', 'timeLimit']);
  chrome.storage.sync.set({'blocked': false});

  chrome.runtime.sendMessage({filter: "remove"});

  clearInterval(myTimer)
  setTime(defaultMins, defaultSecs);
  addStartListeners();
}

function addZeroPad(num, numDigits) {
  strNum = String(num);
  while (strNum.length < numDigits) {strNum = '0' + strNum};
  return strNum;
}

function checkTime(start, limit) {
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
    setTime(mins, secs);
  } else {
    stopTimer();
  }
}

function setTime(mins, secs) {
  document.getElementById("mins").innerHTML = addZeroPad(mins, 2);
  document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
}
