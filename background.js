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
    if (request.filter == "update")
      updateFilters();
    else if (request.filter == "remove") {
      removeFilters();
    }
});
