/* This is working code 
Currently it takes the APIkey value to validate the program, then when the user searches
a topic it finds the most relevant videos. Then exectue sends the videoId to the player
and it loads the video.
*/

/**
   * Sample JavaScript code for youtube.videos.list
   * See instructions for running APIs Explorer code samples locally:
   * https://developers.google.com/explorer-help/guides/code_samples#javascript
   */


//This function I left in, but isn't used. It's used for Oath2 authentication which we don't
//  actually need here.
function authenticate() {
  return gapi.auth2.getAuthInstance()
      .signIn({scope: "https://www.googleapis.com/auth/youtube.readonly"})
      .then(function() { console.log("Sign-in successful"); },
            function(err) { console.error("Error signing in", err); });
}


function loadClient() {
  gapi.client.setApiKey("AIzaSyDTUGby00FioybOLkAsNBwmN8NrR-YMrlg");
  return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function() { console.log("GAPI client loaded for API"); },
            function(err) { console.error("Error loading GAPI client for API", err); });
}

//This line gets the gapi object right after the window loads
window.addEventListener("load", loadClient);
window.addEventListener("load", getYouTubeIframeAPIReady);

function search() {
  var q = $('#search').val();
  console.log("search",q);
  execute(q);
}

// Make sure the client is loaded and sign-in is complete before calling this method.
function execute(str) {
  return gapi.client.youtube.search.list({
    "part": "snippet",
    "maxResults": 5,
    "q": str,
    "type": "video"
  })
      .then(function(response) {
              // Handle the results here (response.result has the parsed body).
              //response.result
              //var str = JSON.stringify(response.result);
              //console.log("Response", str);
              if ('items' in response.result) {
                // jQuery.map() iterates through all of the items in the response and
                // creates a new array that only contains the specific property we're
                // looking for: videoId.
                var videoIds = $.map(response.result.items, function(item) {
                  return item.id.videoId;
                });

                // Now that we know the IDs of all the videos in the uploads list,
                // we can retrieve info about each video.
                //getVideoMetadata(videoIds);
                console.log(videoIds);
                player.loadVideoById(videoIds[0]);
                player.stopVideo();
              } else {
                console.log('There are no videos in response.');
              }
            },
            function(err) { console.error("Execute error", err); });
}


gapi.load("client:auth2", function() {
  gapi.auth2.init({client_id: "725476056867-blkv2h18guhog0deqjoh1lq4fh5s9m28.apps.googleusercontent.com"});
});


// Given an array of video ids, obtains metadata about each video and then
// uses that metadata to display a list of videos to the user.
function getVideoMetadata(videoIds) {
  // https://developers.google.com/youtube/v3/docs/videos/list
  var request = gapi.client.youtube.videos.list({
    // The 'id' property value is a comma-separated string of video IDs.
    id: videoIds.join(','),
    part: 'id,snippet,statistics'
  });

  request.execute(function(response) {
    if ('error' in response) {
      displayMessage(response.error.message);
    } else {
      // Get the jQuery wrapper for #video-list once outside the loop.
      var videoList = $('#video-list');
      $.each(response.items, function() {
        // Exclude videos that don't have any views, since those videos
        // will not have any interesting viewcount analytics data.
        if (this.statistics.viewCount == 0) {
          return;
        }

        var title = this.snippet.title;
        var videoId = this.id;

        // Create a new &lt;li&gt; element that contains an &lt;a&gt; element.
        // Set the &lt;a&gt; element's text content to the video's title, and
        // add a click handler that will display Analytics data when invoked.
        var liElement = $('<li>');
        var aElement = $('<a>');
        // The dummy href value of '#' ensures that the browser renders the
        // &lt;a&gt; element as a clickable link.
        aElement.attr('href', '#');
        aElement.text(title);
        aElement.click(function() {
          displayVideoAnalytics(videoId);
        });

        // Call the jQuery.append() method to add the new &lt;a&gt; element to
        // the &lt;li&gt; element, and the &lt;li&gt; element to the parent
        // list, which is identified by the 'videoList' variable.
        liElement.append(aElement);
        videoList.append(liElement);
      });

      if (videoList.children().length == 0) {
        displayMessage('Your channel does not have any videos that have been viewed.');
      }
    }
  });
}

// Helper method to display a message on the page.
function displayMessage(message) {
  $('#message').text(message).show();
}

/*
The following set of code loads the selected video onto the page
*/
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;



function getYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'M7lc1UVf-VE',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
  //console.log("Player ready");
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    //stopVideo();
    setTimeout(stopVideo, 0);
    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}
/*
These are old functions which are not being used any more.
  // Load the client interface for the YouTube Analytics and Data APIs, which
  // is required to use the Google APIs JS client. More info is available at
  // http://code.google.com/p/google-api-javascript-client/wiki/GettingStarted#Loading_the_Client
  function loadAPIClientInterfaces() {
    gapi.client.load('youtube', 'v3', function() {
      gapi.client.load('youtubeAnalytics', 'v1', function() {
        // After both client interfaces load, use the Data API to request
        // information about the authenticated user's channel.
        getUserChannel();
      });
    });
  }
  // Calls the Data API to retrieve info about the currently authenticated
  // user's YouTube channel.
  function getUserChannel() {
    // https://developers.google.com/youtube/v3/docs/channels/list
    var request = gapi.client.youtube.channels.list({
      // "mine: true" indicates that you want to retrieve the authenticated user's channel.
      mine: true,
      part: 'id,contentDetails'
    });
    request.execute(function(response) {
      if ('error' in response) {
        displayMessage(response.error.message);
      } else {
        // We will need the channel's channel ID to make calls to the
        // Analytics API. The channel ID looks like "UCdLFeWKpkLhkguiMZUp8lWA".
        channelId = response.items[0].id;
        // This string, of the form "UUdLFeWKpkLhkguiMZUp8lWA", is a unique ID
        // for a playlist of videos uploaded to the authenticated user's channel.
        var uploadsListId = response.items[0].contentDetails.relatedPlaylists.uploads;
        // Use the uploads playlist ID to retrieve the list of uploaded videos.
        getPlaylistItems(uploadsListId);
      }
    });
  }
*/


/*
// After the API loads, call a function to enable the search box.
function handleAPILoaded() {
  $('#search-button').attr('disabled', false);
}
// Search for a specified string.
function search() {
  var q = $('#query').val();
  var request = gapi.client.youtube.search.list({
    q: q,
    part: 'snippet'
  });
  request.execute(function(response) {
    var str = JSON.stringify(response.result);
    $('#search-container').html('<pre>' + str + '</pre>');
  });
}
function searchDef() {
  var request = gapi.client.youtube.search.list({
    q: 'dogs',
    part: 'snippet'
  });
  request.execute(function(response) {
    var str = JSON.stringify(response.result);
    console.log("Response", response);
  });
}
function googleApiClientReady(){
                gapi.client.setApiKey('AIzaSyDTUGby00FioybOLkAsNBwmN8NrR-YMrlg');
                gapi.client.load('youtube', 'v3', function() {
                        searchA();
                });
        }
        function searchA() {
                var q = 'cowboy'|'bebop'|'trailer';
                var request = gapi.client.youtube.videos.list({
                        part: 'snippet',
                        maxResults  : 5,
                        q : q,
                       type : 'video'
                });
                request.execute(function(response) {
                        var str = JSON.stringify(response.result);
                        console.log(str);
                });
        }
*/
