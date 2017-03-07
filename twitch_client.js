(function () {
  'use strict';

  /**
   * Creates a Twitch Client for retrieving data from the API
   *
   * @param {String} clientToken Token for authentication to the API
   */
  var TwitchClient = function TwitchClient (clientToken) {
    this.clientToken = clientToken;
  };

  // Base API URL
  TwitchClient.prototype.baseUrl = 'https://api.twitch.tv/kraken/search/streams';

  /**
   * Generates URL from params
   *
   * @param  {Object} params Parameters to chain to URL
   * @return {String}        Generated URL
   */
  TwitchClient.prototype.generateUrl = function generateUrl (params) {
    var paramUrlSegment = Object.keys(params).map(function (paramKey) {
      return paramKey + '=' + params[paramKey];
    }).join('&');

    return this.baseUrl + '?' + paramUrlSegment;
  };

  /**
   * Performs a search of the streams
   *
   * @param  {Object} params Parameters to pass
   *
   * @return {Promise}
   */
  TwitchClient.prototype.GET = function (params) {
    var that = this;

    var searchParams = {
      q:         params.q,
      client_id: this.clientToken,
      offset:    params.offset || 0,
      limit:     params.limit  || 5
    };

    return new Promise(function (resolve, reject) {
      that.getJSONP(that.generateUrl(searchParams), function (response) {
        response.params = searchParams;
        resolve(response);
      });
    });
  };

  /**
   * Gets a URL using JSONP to address CORS issues.
   *
   * @note Impure function - introduces side effects to window.
   *
   * Not particularly fond of this one. Landon had mentioned that JSONP is a hack
   * and based on this implementation I would be likely to agree. I'll look to
   * get rid of this in favor of another strategy later to deal with CORS.
   *
   * @return {undefined}
   */
  TwitchClient.prototype.getJSONP = function getJSONP () {
    var requestCounter = 0;

    return function (url, callbackFn) {
      var scriptTag = document.createElement('script');
      var i         = requestCounter++;
      var name      = 'jsonp_callback_' + i;
      var newUrl    = encodeURI(url + '&callback=' + name);

      window[name] = function (response) {
        try {
          callbackFn(response);
        } finally {
          delete window[name];
          scriptTag.parentNode.removeChild(scriptTag);
        }
      };

      scriptTag.src = newUrl;
      document.body.appendChild(scriptTag);
    };
  }();

  // For lack of a better idea on "exports" in Vanilla JS
  window.TwitchClient = TwitchClient;
})();
