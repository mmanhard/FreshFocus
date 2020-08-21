const breakTimeLimit = 5 * 1000 * 60;

function blockRequest() {
  return {cancel: true};
}

function updateFilters() {
   if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
     chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
   chrome.storage.sync.get(['urls'], function(result){
     if (result.urls) {
       chrome.webRequest.onBeforeRequest.addListener(blockRequest, {urls: JSON.parse(result.urls)}, ['blocking']);
     }
   });
}

function removeFilters() {
   if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
     chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
}

// Listener for messages from the chrome runtime.
// Used for:
// - Removing or updating filters for URLs (i.e. blocking sites when filtered).
// - Changing the popup to be shown.
// - Quitting all sessions entriely.
// pages.
const messageListener = function(request, sender, sendResponse) {
  if (request.filter) {
    switch (request.filter) {
      case "update":
        updateFilters();
        break;

      case "remove":
        removeFilters();
        break;
      }
  }

  if (request.page) setPopup(request.page);
  if (request.quit) quit();
};
chrome.runtime.onMessage.addListener(messageListener);

/******************************************/
// SESSION HANDLERS
/******************************************/

// Set a timer to check the current state of the session / break every second.
const myTimer = setInterval(function() {
  chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'],
    function(result) {

      // Check if websites are currently being blocked.
      if (result.blocked) {
        // If so, we are in a session.
        checkSession(result.startTime, result.timeLimit, false);

      // If no blocking, check if there is a start time.
      } else if (result.startTime) {
        // If so, we are in a break.
        checkSession(result.startTime, breakTimeLimit, true);
      }
    }
  );
}, 1000);

// Check a session / break to determine if it is over based on the start time
// and time limit.
function checkSession(start, limit, isBreak) {
  // Get the current time.
  let now = new Date().getTime();

  // Calculate the time remaining.
  let distance = now - start;
  let remaining = limit - distance

  // If no time left, stop the session / break.
  if (remaining <= 0) {
    if (isBreak) stopBreak();
    else stopSession();
  }
}

// Stops a session that is in progress.
function stopSession() {

  chrome.storage.sync.get(["numSessions"], function(result) {
    const numSessions = result.numSessions - 1;

    // Check if there are any sessions left.
    if (numSessions > 0) {
      // If more sessions, set the break start time, remove filters, display
      // the appropriate notif, and change the page.
      let startTime = new Date().getTime();
      chrome.storage.sync.set({
        "numSessions": numSessions,
        'startTime': startTime,
        'blocked': false
      }, function() {
        removeFilters();
        displaySessionOverNotif(numSessions);

        chrome.runtime.sendMessage({page: "break"});
        setPopup("break");
      });
    } else {
      // If no sessions, display appropriate notif and quit.
      displayAllSessionsOverNotif();
      quit();
    }
  });
}

// Stops a break that is in progress.
function stopBreak() {
  let startTime = new Date().getTime();

  // Set the new session start time, update filters, display
  // the appropriate notif, and change the page.
  chrome.storage.sync.set({
    'startTime': startTime,
    'blocked': true
  }, function() {
    updateFilters();
    displayBreakOverNotif();

    chrome.runtime.sendMessage({page: "session"});
    setPopup("session");
  });
}

// Changes the current popup. NOTE: This is different than just changing the
// popup window's location. It will not do that but is used to determine which
// page should display when the user has reopened the popup after closing it.
function setPopup(page) {
  switch (page) {
    case "configure":
      chrome.browserAction.setPopup({popup: "../views/configure.html"});
      break;

    case "session":
      chrome.browserAction.setPopup({popup: "../views/session.html"});
      break;

    case "break":
      chrome.browserAction.setPopup({popup: "../views/break.html"});
      break;
  }
}

// Quit all sessions.
// Eliminates all date from storage, removes filters, and takes the user back
// to the configure page.
function quit() {
  chrome.storage.sync.remove(['blocked','startTime','timeLimit','numSessions'],
    function () {
      removeFilters();
      chrome.runtime.sendMessage({page: "configure"});
      setPopup("configure");
    }
  );
}

/******************************************/
// NOTIFICATION HANDLERS
/******************************************/

const sessionOverID = 'session_over';
const allSessionsOverID = 'all_sessions_over';
const breakOverID = 'break_over'

function displaySessionOverNotif(numSession) {
  const options = {
    type: "basic",
    title: "Session complete!",
    message: "You should take a break now.",
    iconUrl: "../assets/logo-128.png"
  };

  chrome.notifications.clear(sessionOverID, function() {
    chrome.notifications.create(sessionOverID, options);
  });
}

function displayAllSessionsOverNotif() {
  const options = {
    type: "basic",
    title: "You're done!",
    message: "Time to take a long break.",
    iconUrl: "../assets/logo-128.png"
  };

  chrome.notifications.clear(allSessionsOverID, function() {
    chrome.notifications.create(allSessionsOverID, options);
  });
}

function displayBreakOverNotif() {
  const options = {
    type: "basic",
    title: "Your break is over!",
    message: "Blacklisted sites are now blocked.",
    iconUrl: "../assets/logo-128.png"
  };

  chrome.notifications.clear(breakOverID, function() {
    chrome.notifications.create(breakOverID, options);
  });
}


