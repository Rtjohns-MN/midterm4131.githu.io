/*
  This script merely calls both the youtube search and the flickr search.
  Having one function do this rather than calling both individually is
  better compartmentalization
*/

function searchBoth() {
  search();
  JavaScriptFetch();
}


function onEnter(event) {
  var key = event.keyCode;
  if (key == 13) { //13 is the ENTER key
    searchBoth();
  }
}
