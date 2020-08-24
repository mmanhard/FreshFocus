// Constants
const defaultMins = 25;
const defaultMinChange = 5, smallMinChange = 1;
const minMins = 1,          maxMins = 60;
const minNumSessions = 1,   maxNumSessions = 8;
const enterKey = 13;

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
const addURL = function(event) {
  if(event.which === enterKey) {
    addToBlackList();
  }};
document.getElementById("newURL").addEventListener("keyup", addURL);
const clearURLs = function() {return clearBlackList()};
document.getElementById("clearURLs").addEventListener("click", clearURLs);

/******************************************/
// Timer methods
/******************************************/

// Starts a set of sessions given a time limit and a number of sessions.
function startSessions(timeLimit, numSessions) {

  let startTime = new Date().getTime();

  // Set the new start time, the time limit for each session, number of sessions,
  // add filters, and navigate to the session page.
  chrome.storage.sync.set({
    "startTime": startTime,
    "timeLimit": timeLimit,
    "numSessions": numSessions,
    "blocked": true
  }, function() {
    chrome.runtime.sendMessage({filter: "update", page: "session"});
    window.location.href = "../views/session.html";
  });
}

/******************************************/
// Blacklist methods
/******************************************/

// Adds the URL indicated in the text field 'newURL' to the blacklist.
function addToBlackList() {
  // Take the new url from the DOM and convert it to a valid URL pattern.
  let newURL = document.getElementById("newURL").value;
  document.getElementById("newURL").value = '';
  newURL = convertToValidURLPattern(newURL);

  // Check if the new URL is not empty.
  if (newURL.length > 0) {
    // If not empty, add the url to the list of urls in storage and update
    // the displayed black list.
    chrome.storage.sync.get(['urls'], function(result){
      let urls;
      if (result.urls) {
        urls = JSON.parse(result.urls);
      } else {
        urls = [];
      }
      urls.push(newURL);

      chrome.storage.sync.set({
        "urls": JSON.stringify(urls)
      }, displayBlackListURL(newURL));
    });
  } else {
    console.log("Invalid URL");
  }
}

// Clears the blacklist from storage.
function clearBlackList() {
  chrome.storage.sync.remove(['urls']);

  // Remove all displayed urls from the DOM.
  let lis = document.getElementById("blacklist").children;
  for (i = lis.length-1; i > 0; i--) {
    document.getElementById("blacklist").removeChild(lis[i]);
    console.log(lis[i]);
  }

}

// Displays the black list.
function displayBlackList() {
  chrome.storage.sync.get(['urls'], function(result){
    if (result.urls) {
      let urls = JSON.parse(result.urls);
      urls.forEach((url) => {
        displayBlackListURL(url);
      });
    }
  });
}

// Event handler for deleting a url from the blacklist.
const deleteFromBlacklist = (event) => {
  // Get the index of the selected url.
  let li = event.currentTarget.parentNode;
  let ul = li.parentNode;
  let index = Array.from(ul.children).indexOf(li);

  // Delete the url from the list of urls in storage and update the display.
  chrome.storage.sync.get(['urls'], function(result){
    let urls;
    if (result.urls) {
      urls = JSON.parse(result.urls);
      urls.splice(index-1,1);
      document.getElementById("blacklist").removeChild(li);
      chrome.storage.sync.set({"urls": JSON.stringify(urls)});
    }
  });

};

// Displays a url in the blacklist.
function displayBlackListURL(url) {

    // Create the element that encompasses the url.
    let li = document.createElement("li");
    let span = document.createElement("span");
    let btn = document.createElement("button");
    li.appendChild(span);
    li.appendChild(btn);
    span.textContent = formatURL(url);
    btn.textContent = "-";
    btn.className = "btn-list";

    btn.addEventListener("click", deleteFromBlacklist);
    document.getElementById("blacklist").appendChild(li);
}

/******************************************/
// Helper methods
/******************************************/

// Changes the time displayed on the page. If addFlag is true, adds to the time.
// Otherwise, subtracts from the time. By default, the minutes change by 5 for
// times greater than 5 minutes. Below 5 minutes, the change is 1 minute.
// The max number of mins is 60 and the min is 1.
function changeTime(addFlag) {
  const mins = Number(document.getElementById("mins").innerHTML);

  // Determine the appropriate change in minutes.
  let minChange = defaultMinChange;
  if (mins + addFlag <= minChange) {
    minChange = smallMinChange;
  }

  // Change the minutes displayed if the updated mins is between maxMins and
  // minMins.
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

// Changes the number of sessions displayed on the page. If incrementFlag is
// true, adds 1 to the number of sessions. Otherwise, subrtracts 1.
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
