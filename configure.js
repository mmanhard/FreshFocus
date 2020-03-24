// Constants
const defaultMins = 25;
const defaultMinChange = 5, smallMinChange = 1;
const minMins = 1,          maxMins = 60;
const minNumSessions = 1,   maxNumSessions = 8;

/******************************************/
// MAIN SCRIPT
/******************************************/

displayBlackList();

/******************************************/
// EVENT LISTENERS
/******************************************/

// Tell the start button to start the timer and switch to the session view once clicked.
const beginSession = function() {
    const mins = Number(document.getElementById("mins").innerHTML) * 60 * 1000;
    const sessions = Number(document.getElementById("numSessions").innerHTML)
    startSessions(mins, sessions);
};
document.getElementById("start").addEventListener("click", beginSession);

// Create event listeners for adding or subtracting time.
const addTime = function() {return changeTime(true)};
document.getElementById("addTime").addEventListener("click", addTime);
const subtractTime = function() {return changeTime(false)};
document.getElementById("subtractTime").addEventListener("click", subtractTime);

// Create event listeners for incrementing or decrementing number of sessions.
const incrementSession = function() {return changeSession(true)};
document.getElementById("incSession").addEventListener("click", incrementSession);
const decrementSession = function() {return changeSession(false)};
document.getElementById("decSession").addEventListener("click", decrementSession);

// Create event listeners for adding to or clearing the blacklist.
const addURL = function() {return addToBlackList()};
document.getElementById("addURL").addEventListener("click", addURL);
const clearURLs = function() {return clearBlackList()};
document.getElementById("clearURLs").addEventListener("click", clearURLs);

/******************************************/
// Timer methods
/******************************************/

function startSessions(timeLimit, numSessions) {

  let startTime = new Date().getTime();
  chrome.storage.sync.set({"startTime": startTime});
  chrome.storage.sync.set({"timeLimit": timeLimit});
  chrome.storage.sync.set({"numSessions": numSessions});
  chrome.storage.sync.set({"blocked": true});

  chrome.runtime.sendMessage({filter: "update"});
  chrome.runtime.sendMessage({page: "session"});
  window.location.href = "../views/session.html";
}

/******************************************/
// Blacklist methods
/******************************************/

function addToBlackList() {
  let newURL = document.getElementById("newURL").value;
  newURL = convertToValidURLPattern(newURL);
  if (newURL.length > 0) {
    chrome.storage.sync.get(['urls'], function(result){
      let urls;
      if (result.urls) {
        urls = JSON.parse(result.urls);
      } else {
        urls = [];
      }
      urls.push(newURL);
      chrome.storage.sync.set({"urls": JSON.stringify(urls)});

      var li = document.createElement("li");
      li.textContent = newURL;
      document.getElementById("blacklist").appendChild(li);
    });
  } else {
    console.log("Invalid URL");
  }
}

function clearBlackList() {
  chrome.storage.sync.remove(['urls']);
  displayBlackList();
}

function displayBlackList() {
  chrome.storage.sync.get(['urls'], function(result){
    if (result.urls) {
      let urls = JSON.parse(result.urls);
      urls.forEach((url) => {
        var li = document.createElement("li");
        li.textContent = formatURL(url);
        document.getElementById("blacklist").appendChild(li);
      });
    }
  });
}

/******************************************/
// Helper methods
/******************************************/

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

function changeSession(incrementFlag) {
  const numSessions = Number(document.getElementById("numSessions").innerHTML);

  if (incrementFlag) {
    if (numSessions < maxNumSessions) {
      document.getElementById("numSessions").innerHTML = numSessions + 1;
    }
  } else if (numSessions > minNumSessions) {
    if (numSessions > minNumSessions) {
        document.getElementById("numSessions").innerHTML = numSessions - 1;
    }
  }
}

// !! NEEDS AN UPDATE!!
function convertToValidURLPattern(url) {
//   <url-pattern> := <scheme>://<host><path>
// <scheme> := '*' | 'http' | 'https' | 'file' | 'ftp'
// <host> := '*' | '*.' <any char except '/' and '*'>+
// <path> := '/' <any chars>
  const schemeSeparator = "://";

  // Determine scheme
  let scheme, host, path;
  let schemeEnd, hostEnd;
  schemeEnd = url.indexOf(schemeSeparator);
  if (schemeEnd <= 0) {
    scheme = "*";
  } else {
    scheme = url.substr(0,schemeEnd);
  }

  if (schemeEnd >= 0) {
    url = url.substr(schemeEnd+schemeSeparator.length);
  }
  console.log(url);

  // Determine host
  host = url;

  // Determine path
  path = "*";
  return scheme+schemeSeparator+"*."+host+"/"+path;
}

function formatURL(url) {
  const schemeSeparator = "://*.";
  const pathSeparator = "/";

  schemeEnd = url.indexOf(schemeSeparator);
  url = url.substr(schemeEnd+schemeSeparator.length);
  hostEnd = url.indexOf(pathSeparator);
  return url.substr(0,hostEnd);
}
