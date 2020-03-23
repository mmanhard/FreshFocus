
var myTimer;

/******************************************/
// MAIN SCRIPT
/******************************************/

chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'], function(result) {
  if (result.blocked) {
    // Update the count down every 1 second
    myTimer = setInterval(function() {
      checkTime(result.startTime, result.timeLimit)
    }, 1000);
  } else {
    window.location.href = "../views/configure.html"
    chrome.runtime.sendMessage({page: "configure"});
  }
});

/******************************************/
// EVENT LISTENERS
/******************************************/

// Tell the abandon button to stop the timer for the current session and switch to the break view once clicked.
const abandonSession = function() {
    stopTimer(false);
    window.location.href = "../views/break.html"
    chrome.runtime.sendMessage({page: "break"});
};
document.getElementById("abandon").addEventListener("click", abandonSession);

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
    stopTimer(true);
  }
}

function setTime(mins, secs) {
  document.getElementById("mins").innerHTML = mins;
  document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
}

function stopTimer(success) {
  clearInterval(myTimer);

  let startTime = new Date().getTime();

  chrome.storage.sync.set({'startTime': startTime, 'blocked': false});

  chrome.runtime.sendMessage({filter: "remove"});

  if (success) {
    chrome.storage.sync.get(["numSessions"], function(result) {
      const numSessions = result.numSessions - 1;
      if (numSessions > 0) {
        chrome.storage.sync.set({"numSessions": numSessions});
        window.location.href = "../views/break.html"
        chrome.runtime.sendMessage({page: "break"});
      } else {
        window.location.href = "../views/configure.html";
        chrome.runtime.sendMessage({page: "configure"});
        chrome.storage.sync.remove(['timeLimit', 'numSessions']);
        return;
      }
    });
  } else {
    window.location.href = "../views/break.html"
    chrome.runtime.sendMessage({page: "break"});
  }
}

/******************************************/
// Helper methods
/******************************************/

function addZeroPad(num, numDigits) {
  strNum = String(num);
  while (strNum.length < numDigits) {strNum = '0' + strNum};
  return strNum;
}
