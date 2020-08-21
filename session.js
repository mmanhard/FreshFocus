
var myTimer;

/******************************************/
// MAIN SCRIPT
/******************************************/

chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'], function(result) {
  if (result.blocked) {
    checkTime(result.startTime, result.timeLimit);

    // Update the count down every 1 second
    myTimer = setInterval(function() {
      checkTime(result.startTime, result.timeLimit);
    }, 1000);
  } else {
    // If we are not blocking the black list on this page, there is something wrong.
    // Abandon all sessions and start over at the configure page.
    chrome.runtime.sendMessage({quit: true});
    window.location.href = "../views/configure.html";
  }
});

/******************************************/
// EVENT LISTENERS
/******************************************/

// Abandons the current session.
const abandonSession = function() {
  clearInterval(myTimer);

  let startTime = new Date().getTime();

  // Set the new break start time, remove filters, and change the page.
  chrome.storage.sync.set({
    'startTime': startTime,
    'blocked': false
  }, function() {
    chrome.runtime.sendMessage({filter: "remove", page: "break"});
    window.location.href = "../views/break.html";
  });
};
document.getElementById("abandon").addEventListener("click", abandonSession);

// Listener for messages from the chrome runtime. Primarily used to switch
// pages.
const messageListener = function(request, sender, sendResponse) {
  if (request.page) {
    clearInterval(myTimer);

    switch (request.page) {
      case "configure":
        window.location.href = "../views/configure.html";
        break;
      case "break":
        window.location.href = "../views/break.html";
        break;
    }
  }
};
chrome.runtime.onMessage.addListener(messageListener);

/******************************************/
// Timer methods
/******************************************/

function checkTime(start, limit) {
  // Get the current time.
  let now = new Date().getTime();

  // Calculate the time remaining.
  let distance = now - start;
  let remaining = limit - distance

  // Convert time remaining to minutes and seconds.
  let mins, secs;
  if (remaining >= 0) {
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
