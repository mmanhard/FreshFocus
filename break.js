const breakTimeLimit = 5 * 1000 * 60;

var myTimer;

/******************************************/
// MAIN SCRIPT
/******************************************/

chrome.storage.sync.get(['blocked', 'startTime', 'numSessions'], function(result) {
  if (result.blocked) {
    // If we are blocking the black list on this page, there is something wrong.
    // Abandon all sessions and start over at the configure page.
    quit();
  } else {
    document.getElementById("numSessions").innerHTML = result.numSessions;

    checkTime(result.startTime, breakTimeLimit);

    // Update the count down every 1 second
    myTimer = setInterval(function() {
      checkTime(result.startTime, breakTimeLimit);
    }, 1000);
  }
});

/******************************************/
// EVENT LISTENERS
/******************************************/

// Listener for messages from the chrome runtime. Primarily used to switch
// pages.
const messageListener = function(request, sender, sendResponse) {
  if (request.page) {
    clearInterval(myTimer);

    switch (request.page) {
      case "configure":
        window.location.href = "../views/configure.html";
        break;
      case "session":
        window.location.href = "../views/session.html";
        break;
    }
  }
};
chrome.runtime.onMessage.addListener(messageListener);

// Button click handler for starting a session before the break is over.
const startSession = function() {
  clearInterval(myTimer);

  let startTime = new Date().getTime();

  // Set the new session start time, update filters, and change the page.
  chrome.storage.sync.set({
    'startTime': startTime,
    'blocked': true
  }, function() {
    chrome.runtime.sendMessage({filter: "update", page: "session"});
    window.location.href = "../views/session.html";
  });
};
document.getElementById("start").addEventListener("click", startSession);

// Button click handler for quitting all sessions entirely.
const quit = function() {
  chrome.runtime.sendMessage({quit: true});
  window.location.href = "../views/configure.html";
};
document.getElementById("quit").addEventListener("click", quit);

/******************************************/
// Timer methods
/******************************************/

function checkTime(start, limit) {
  // Get the current time.
  let now = new Date().getTime();

  // Calculate the time remaining.
  let distance = now - start;
  let remaining = limit - distance;

  // Convert time remaining to minutes and seconds.
  let mins, secs;
  if (remaining > 0) {
    mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    secs = Math.floor((remaining % (1000 * 60)) / 1000);
    setTime(mins, secs);
  }
}

function setTime(mins, secs) {
  document.getElementById("mins").innerHTML = mins;
  document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
}

/******************************************/
// Helper methods
/******************************************/

function addZeroPad(num, numDigits) {
  strNum = String(num);
  while (strNum.length < numDigits) {strNum = '0' + strNum};
  return strNum;
}
