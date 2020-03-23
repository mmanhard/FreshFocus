const breakTimeLimit = 5 * 1000 * 60;

var myTimer;

/******************************************/
// MAIN SCRIPT
/******************************************/

chrome.storage.sync.get(['blocked', 'startTime', 'numSessions'], function(result) {
  if (result.blocked) {
    quit();
  } else {
    document.getElementById("numSessions").innerHTML = result.numSessions;
    myTimer = setInterval(function() {
      checkTime(result.startTime, breakTimeLimit)
    }, 1000);
  }
});

/******************************************/
// EVENT LISTENERS
/******************************************/

document.getElementById("start").addEventListener("click", stopBreakTimer);

document.getElementById("quit").addEventListener("click", quit);

/******************************************/
// Timer methods
/******************************************/

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
    stopBreakTimer(true);
  }
}

function setTime(mins, secs) {
  document.getElementById("mins").innerHTML = mins;
  document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
}

function stopBreakTimer(success) {
  clearInterval(myTimer);

  let startTime = new Date().getTime();

  chrome.storage.sync.set({'startTime': startTime, 'blocked': true});

  chrome.runtime.sendMessage({filter: "update"});
  window.location.href = "../views/session.html"
  chrome.runtime.sendMessage({page: "session"});
}

function quit() {
  chrome.storage.sync.remove(['blocked','startTime','timeLimit','numSessions']);
  window.location.href = "../views/configure.html"
  chrome.runtime.sendMessage({page: "configure"});
}

/******************************************/
// Helper methods
/******************************************/

function addZeroPad(num, numDigits) {
  strNum = String(num);
  while (strNum.length < numDigits) {strNum = '0' + strNum};
  return strNum;
}
