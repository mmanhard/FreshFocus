import { pageSwitcher, setTime } from './utils.js';

var myTimer;

/******************************************/
// MAIN SCRIPT
/******************************************/

chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'], function(result) {
  if (result.blocked) {
    setTime(result.startTime, result.timeLimit);

    // Update the count down every 1 second
    myTimer = setInterval(function() {
      setTime(result.startTime, result.timeLimit);
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
    pageSwitcher(request.page);
  }
};
chrome.runtime.onMessage.addListener(messageListener);

