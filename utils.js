// Changes the current window's page to the appropriate html page.
function pageSwitcher(page) {
  switch (page) {
    case "configure":
      window.location.href = "../views/configure.html";
      break;
    case "session":
      window.location.href = "../views/session.html";
      break;
    case "break":
      window.location.href = "../views/break.html";
      break;
  }
}

// Given a start time and a time limit (in milliseconds), sets the minutes and
// seconds in the DOM.
function setTime(start, limit) {
  const remaining = calcTimeRemaining(start, limit);

  // Convert time remaining to minutes and seconds.
  let mins, secs;
  if (remaining >= 0) {
    mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    secs = Math.floor((remaining % (1000 * 60)) / 1000);

    document.getElementById("mins").innerHTML = mins;
    document.getElementById("secs").innerHTML = addZeroPad(secs, 2);
  }
}

// Given a start time and a time limit (in milliseconds), calculates the time
// remaining in milliseconds.
function calcTimeRemaining(start, limit) {
  // Get the current time.
  let now = new Date().getTime();

  // Calculate the time remaining.
  let distance = now - start;
  return limit - distance;
}

// Pads a string, num, with 0s on the left of the original string so the new
// string is numDigits.
function addZeroPad(num, numDigits) {
  let strNum = String(num);
  while (strNum.length < numDigits) {strNum = '0' + strNum};
  return strNum;
}

export {
  pageSwitcher,
  setTime,
  calcTimeRemaining
}