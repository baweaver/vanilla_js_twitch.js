(function () {
  'use strict';

  /**
   * Encapsulates a Twitch Stream with Paging and rendering logic
   *
   * @param {Object} data   Original response data
   * @param {Object} params Requesting params
   */
  var TwitchStream = function TwitchStream (data, params) {
    this.data   = data;
    this.params = params;
  };

  /**
   * @return {Integer} Length of results
   */
  TwitchStream.prototype.length = function length () {
    return this.data._total;
  };

  /**
   * How many items to get per page
   *
   * @return {Integer}
   */
  TwitchStream.prototype.itemsPerPage = function itemsPerPage () {
    return this.params.limit;
  };

  /**
   * What offset to start gathering results from
   *
   * @return {Integer}
   */
  TwitchStream.prototype.offset = function offset () {
    return this.params.offset;
  };

  /**
   * The total number of available pages
   *
   * @return {Integer}
   */
  TwitchStream.prototype.totalPages = function totalPages () {
    return Math.floor(this.length() / this.itemsPerPage());
  };

  /**
   * The current page number
   *
   * @return {Integer}
   */
  TwitchStream.prototype.page = function page () {
    return Math.floor(this.offset() / this.itemsPerPage());
  };

  /**
   * Gets a page
   *
   * @param  {Integer} n Page number to fetch
   *
   * @return {Promise}   Promise returning newly wrapped TwitchStream response
   */
  TwitchStream.prototype.getPage = function getPage (n) {
    var offset = (n * this.itemsPerPage()) % this.length(),
        limit  = this.itemsPerPage(),
        q      = this.params.q;

    var twitchClient = new TwitchClient(this.params.client_id);
    var searchParams = Object.assign({}, this.params, {
      limit:     limit,
      offset:    offset,
      client_id: this.params.client_id
    });

    return new Promise(function (resolve, reject) {
      twitchClient.GET(searchParams).then(resolve, reject);
    });
  };

  /**
   * Gets the next page in order
   *
   * @return {Promise}
   */
  TwitchStream.prototype.nextPage = function nextPage () {
    return this.getPage(this.page() + 1).then(function (newStream) {
      newStream.renderDOM();
    });
  };

  /**
   * Gets the previous page in order
   *
   * @return {Promise}
   */
  TwitchStream.prototype.previousPage = function previousPage () {
    return this.getPage(this.page() - 1).then(function (newStream) {
      newStream.renderDOM();
    });
  };

  /**
   * Meta information HTML template
   *
   * @todo Factor out into templating engine
   *
   * @return {String}
   */
  TwitchStream.prototype.metaHTML = function metaHTML () {
    return [
      '<span id="meta">',
      '  <summary>',
      '    Total Results: ' + this.length(),
      '  </summary>',

      '  <navigation>',
      '    <strong id="previous-page">&#9664;</strong>',

      '    <span id="page-count">',
      '      ' + this.page() + ' / ' + this.totalPages(),
      '    </span>',

      '    <strong id="next-page">&#9658;</strong>',
      '  </navigation>',
      '</span>'
    ].join("\n");
  };

  /**
   * List of Streams HTML template
   *
   * @todo Factor out into templating engine
   *
   * @return {String}
   */
  TwitchStream.prototype.listHTML = function toHTML () {
    var listItems = this.data.streams.map(function (streamItem) {
      return [
        '<li>',
        '  <img src="' + streamItem.preview.medium + '" />',

        '  <article>',
        '    <header>',
        '      <h2>',
        '        <a href="' + streamItem.channel.url + '">',
        '          ' + streamItem.channel.display_name,
        '        </a>',
        '      </h2>',

        '      <p>',
        '        ' + streamItem.game + ' - ' + streamItem.viewers + ' viewers',
        '      </p>',
        '    </header>',

        '    <p>',
        '      ' + streamItem.channel.status,
        '    </p>',
        '  </article>',
        '</li>'
      ].join("\n");
    }).join("\n");

    return [
      '<ul class="stream-list">',
        listItems,
      '</ul>'
    ].join("\n");
  };

  /**
   * Transforms Stream into HTML
   *
   * @return {String}
   */
  TwitchStream.prototype.toHTML = function toHTML () {
    return [
      this.metaHTML(),
      this.listHTML()
    ].join("\n");
  };

  /**
   * Renders Stream to the DOM
   *
   * @note Side effects
   *
   * @return {undefined}
   */
  TwitchStream.prototype.renderDOM = function renderDOM () {
    document.getElementById('stream-container').innerHTML = this.toHTML();

    document.getElementById('next-page')
      .addEventListener('click', this.nextPage.bind(this), false);

    document.getElementById('previous-page')
      .addEventListener('click', this.previousPage.bind(this), false);
  };

  // For lack of a better idea on "exports" in Vanilla JS
  window.TwitchStream = TwitchStream;
})();
