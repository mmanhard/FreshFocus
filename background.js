// async function blockRequest(details) {
//   // let promise = new Promise(function (resolve, reject) {
//   //   chrome.storage.sync.get(['blocked'], function(result) {
//   //     console.log("Checking local storage.");
//   //     console.log(!result.blocked);
//   //   }
//
//   let promise = new Promise(function(resolve, reject){
//       chrome.storage.sync.get(['blocked'], function(result){
//           resolve(result.blocked);
//       });
//   });
//
//   let blocked = await promise;
//   console.log("blocked is " + blocked);
//   return {cancel: blocked};
// }

function blockRequest() {
  return {cancel: true};
}

function updateFilters() {
   if(chrome.webRequest.onBeforeRequest.hasListener(blockRequest))
     chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
   chrome.storage.sync.get(['urls'], function(result){
     chrome.webRequest.onBeforeRequest.addListener(blockRequest, {urls: JSON.parse(result.urls)}, ['blocking']);
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
