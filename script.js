(function () {
  'use strict';

  /**
   * Runs a search against the Twitch API
   *
   * @note Introduces side effects to DOM
   */
  var search = function search () {
    var clientToken  = document.getElementById('clientToken').value;
    var twitchClient = new TwitchClient(clientToken);

    twitchClient.GET({
      q: document.getElementById('searchQuery').value
    }).then(function (response) {
      var stream = new TwitchStream(response, response.params);
      stream.renderDOM();
    });
  };

  // Bind to search button. OnClick isn't fond of Document Ready.
  document.getElementById('searchBtn').addEventListener('click', search, false);
}());

