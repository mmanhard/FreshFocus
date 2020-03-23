// Constants
const defaultMins = 25,     defaultSecs = 0;
const defaultMinChange = 5, smallMinChange = 1;
const minMins = 1,          maxMins = 60;

var myTimer;

displayBlackList();

chrome.storage.sync.get(['blocked', 'startTime', 'timeLimit'], function(result) {
  if (result.blocked) {
    console.log("Blocked");

    addStopListeners();

    // Update the count down every 1 second
    myTimer = setInterval(function() {
      checkTime(result.startTime, result.timeLimit)
    }, 1000);
  } else {
    console.log("Not blocked");
    addStartListeners();
  }
});

var temp = true;
const fancyButton = function() {
    if (temp) {
      document.getElementById("configure_view").style.visibility = "hidden";
      document.getElementById("fancy_view").style.visibility = "visible";
      document.body.style.backgroundColor = "yellow";
      temp = false;
      console.log("hello")
    } else {
      window.location.href = "test.html"
      // console.log("goodbye")
      // chrome.runtime.sendMessage({type: "reload"});
    }
};
document.getElementById("fancy_button").addEventListener("click", fancyButton);

function addStartListeners() {
  const addTime = function() {return changeTime(true)};
  document.getElementById("addTime").addEventListener("click", addTime);

  const subtractTime = function() {return changeTime(false)};
  document.getElementById("subtractTime").addEventListener("click", subtractTime);

  const setTimer = function() {
    document.getElementById("addTime").removeEventListener("click", addTime);
    document.getElementById("subtractTime").removeEventListener("click", subtractTime);

    const mins = Number(document.getElementById("mins").innerHTML) * 60 * 1000;
    const secs = Number(document.getElementById("secs").innerHTML) * 1000;

    return startTimer(mins+secs);
  };
  document.getElementById("start").addEventListener("click", setTimer);

  const addURL = function() {return addToBlackList()};
  document.getElementById("addURL").addEventListener("click", addURL);

  const clearURLs = function() {return clearBlackList()};
  document.getElementById("clearURLs").addEventListener("click", clearURLs);

  // const printURLs = function() {return printBlackList()};
  // document.getElementById("printURLs").addEventListener("click", printURLs);
}

function addStopListeners() {
  document.getElementById("stop").addEventListener("click", stopTimer);
}

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

function clearBlackList() {
  chrome.storage.sync.remove(['urls']);
  displayBlackList();
}

// function printBlackList() {
//   chrome.storage.sync.get(['urls'], function(result){
//     console.log(result.urls);
//   });
// }

function addToBlackList() {
  let newURL = document.getElementById("newURL").value;
  newURL = convertToValidURL(newURL);
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

function displayBlackList() {
  chrome.storage.sync.get(['urls'], function(result){
    if (result.urls) {
      let urls = JSON.parse(result.urls);
      urls.forEach((url) => {
        var li = document.createElement("li");
        li.textContent = url;
        document.getElementById("blacklist").appendChild(li);
      });
    }
  });
}

function startTimer(timeLimit) {

  let startTime = new Date().getTime();
  chrome.storage.sync.set({"startTime": startTime});
  chrome.storage.sync.set({"timeLimit": timeLimit});
  chrome.storage.sync.set({"blocked": true});

  chrome.runtime.sendMessage({filter: "update"});

  // Update the count down every 1 second
  myTimer = setInterval(function() {
    checkTime(startTime, timeLimit)
  }, 1000);
}

function stopTimer() {
  chrome.storage.sync.remove(['startTime', 'timeLimit']);
  chrome.storage.sync.set({'blocked': false});

  chrome.runtime.sendMessage({filter: "remove"});

  clearInterval(myTimer)
  setTime(defaultMins, defaultSecs);
  addStartListeners();
}

function addZeroPad(num, numDigits) {
  strNum = String(num);
  while (strNum.length < numDigits) {strNum = '0' + strNum};
  return strNum;
}

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
    stopTimer();
  }
}

function setTime(mins, secs) {
  document.getElementById("mins").innerHTML = addZeroPad(mins, 2);
  document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
}

// !! NEEDS AN UPDATE!!
function convertToValidURL(url) {
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
