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

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.filter) {
      switch (request.filter) {
        case "update":
          updateFilters();
          break;

        case "remove":
          removeFilters();
          break;
        }
    } else if (request.page) {
      switch (request.page) {
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
});
