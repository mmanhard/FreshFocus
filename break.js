import { pageSwitcher, setTime } from './utils.js';

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

    setTime(result.startTime, breakTimeLimit);

    // Update the count down every 1 second
    myTimer = setInterval(function() {
      setTime(result.startTime, breakTimeLimit);
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
    pageSwitcher(request.page);
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

