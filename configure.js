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
const addURL = function(event) {
  if(event.which === 13) {
    addToBlackList();
  }};
document.getElementById("newURL").addEventListener("keyup", addURL);
const clearURLs = function() {return clearBlackList()};
document.getElementById("clearURLs").addEventListener("click", clearURLs);

/******************************************/
// Timer methods
/******************************************/

function startSessions(timeLimit, numSessions) {

  let startTime = new Date().getTime();

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

function addToBlackList() {
  let newURL = document.getElementById("newURL").value;
  document.getElementById("newURL").value = '';
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

      displayBlackListURL(newURL);
    });
  } else {
    console.log("Invalid URL");
  }
}

function clearBlackList() {
  chrome.storage.sync.remove(['urls']);
  let lis = document.getElementById("blacklist").children;
  for (i = lis.length-1; i > 0; i--) {
    document.getElementById("blacklist").removeChild(lis[i]);
    console.log(lis[i]);
  }

}

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

const test = (event) => {
  let li = event.currentTarget.parentNode;
  let ul = li.parentNode;
  let index = Array.from(ul.children).indexOf(li);

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

function displayBlackListURL(url) {
    var li = document.createElement("li");
    var span = document.createElement("span");
    var btn = document.createElement("button");
    li.appendChild(span);
    li.appendChild(btn);
    span.textContent = formatURL(url);
    btn.textContent = "-";
    btn.className = "btn-list";

    btn.addEventListener("click",test);
    document.getElementById("blacklist").appendChild(li);
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
