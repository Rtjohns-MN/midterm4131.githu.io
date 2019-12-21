/*
  The goal of the advanced search is to find some kind of related topics from the
  youtube video and send them as additional results to the flickr page.
  
  Related video title search process:
  1. Do the normal search posting the related video and pictures
  2. use the video Id to call the youtube API function relatedToVideoId to get another
     list of videos.
  3. Strip the data down to just the video titles and put them into an array.
  4. Send those titles as string as additional search results for Flickr
*/

// Make sure the client is loaded and sign-in is complete before calling this method.
function executeAdv(str) {
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
                var videoTags = youtube.list(videoIds[0]).snippet.tags;

                // Now that we know the IDs of all the videos in the uploads list,
                // we can retrieve info about each video.
                getVideoMetadata(videoIds);
                console.log(videoTags);
                player.loadVideoById(videoIds[0]);
                player.stopVideo();
              } else {
                console.log('There are no videos in response.');
              }
            },
            function(err) { console.error("Execute error", err); });
}
