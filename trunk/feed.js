
/**
 * Constructor for Feed class.
 */
function Feed(id, title) {
  this.id = id;
  this.title = title || '';
  this.unread = 0;
  this.feed = {};
  this.show = 'all';
  this.scroll = false;
  this.link = false;
  this.folders = {};  
}

/**
 * Set unread count
 */
Feed.prototype.setUnread = function(x) {
  this.unread = x;
}

/**
* Load feed data
*/
Feed.prototype.reload = function() {
  if (loading.visible) return false;

  this.scroll = false;
  gadget.token = false;
  
  httpRequest.host = CONNECTION.FEED_HOST;
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.STREAM_PREFIX + this.id;
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.connect('', this.getSuccess.bind(this), this.getError.bind(this));
  return true;
}

/**
 * Check if the reader is currently displaying this feed
 */
Feed.prototype.isDisplayed = function() {
  if (!this.id) return false;
  if (!reader.currentFeed) return false;
  return this.id == reader.currentFeed.id;
}

/**
 * Save the scroll position
 */
Feed.prototype.saveScroll = function() {
  this.scroll = reader.scrollbar.postition();
}

/**
 * Parse feed contents
 */
Feed.prototype.parse = function() {
  for (var i=0; i < this.feed.items.length ; i++) {
    try {
      var article = this.feed.items[i];
      
      this.feed.items[i].read = false;
      this.feed.items[i].starred = false;

      this.feed.items[i].srcTitle = (article.origin && article.origin.title) ? article.origin.title : this.title;
      this.feed.items[i].subtitle = this.feed.items[i].srcTitle;
      if (article.author) {
        this.feed.items[i].subtitle += ' - '+article.author;
      }
      
      var content = article.content ? article.content : article.summary;
      
      this.feed.items[i].origin = (article.origin && article.origin.streamId) ? article.origin.streamId : this.id;

      this.feed.items[i].snippet = content.content
          .stripTags()
          .replace(new RegExp('[\n|\r|\\s]+', 'gm'), ' ')
          .substring(0,400)
          .trim();
          
      // XXX: strip HTML from the article body for now
      this.feed.items[i].body = content.content
          .replace(new RegExp('</p>', 'igm'), "</p>\n\n")
          .replace(new RegExp('<br[^>]+>', 'igm'), "<br />\n")
          .stripTags()
          .trim()
          .replace(new RegExp('[\n|\r]{3,}', 'gm'), "\n\n");

      this.feed.items[i].rawBody = content.content;
  
      this.feed.items[i].tags = [];
      
      for (var j=0; j < article.categories.length ; j++) {
        var category = article.categories[j];
        if (category.match(/user\/(.*?)\/read$/)) {
          this.feed.items[i].read = true;
        }
        if (category.match(/user\/(.*?)\/starred$/)) {

          this.feed.items[i].starred = true;
        }
        if (category.match(/user\/(.*?)\/broadcast$/)) {
          this.feed.items[i].shared = true;
        }        
        var matches = category.match(/\/label\/([^\/]+)$/);
        if (matches && matches[1]) {
          this.feed.items[i].tags.push(matches[1]);
        }      
      }
      
      if (this.feed.alternate && this.feed.alternate.length) {
        for (var j=0; j < this.feed.alternate.length ; j++) {
          if (this.feed.alternate[j].href) {
            this.feed.items[i].srcUrl = this.feed.alternate[j].href;
            break;
          }
        }
      }
      
      if (article.alternate && article.alternate.length) {
        for (var j=0; j < article.alternate.length ; j++) {
          if (article.alternate[j].href) {
            this.feed.items[i].url = article.alternate[j].href;
            break;
          }
        }
      }

    } catch(e) {
      this.feed.items[i] = false;
    }
  }  
}

/**
 * Load feed contents
 */
Feed.prototype.refresh = function() {
  if (!this.feed.items || !this.feed.items.length) return;

  feedContent.removeAllElements();

  for (var i=0; i < this.feed.items.length ; i++) {
    var article = this.feed.items[i];

    if (!article) continue;
    if (article.read && this.show != 'all') continue;

    var element = feedContent.appendElement('<div height="36" cursor="hand" enabled="true" />');

    var star = element.appendElement('<div y="10" width="13" height="13" background="images/star-on.png" enabled="true" cursor="hand" />');
    star.onclick = this.doStar.bind(this, star, this.feed.items[i]);
    this.doStar(star, this.feed.items[i], true);
    
    var titleLabel = element.appendElement('<label x="17" y="4" font="helvetica" size="8" bold="true" color="#161616" trimming="character-ellipsis"></label>');
    titleLabel.innerText = article.title;

    var snippetLabel = element.appendElement('<label x="17" y="17" font="helvetica" size="8" color="#19642c" trimming="character-ellipsis"></label>');
    snippetLabel.innerText = article.snippet;

    element.onmouseover = function() { event.srcElement.background='#e1eef6'; }.bind(this);
    element.onmouseout = function() { event.srcElement.background=''; }.bind(this);

    element.onclick = function(i) { 
      gadget.detailsView.SetContent('', undefined, 'details.xml', false, 0);
      gadget.detailsView.detailsViewData.putValue('article', this.feed.items[i]);
      gadget.detailsView.detailsViewData.putValue('loginSession', loginSession);
      gadget.detailsView.detailsViewData.putValue('gadget', gadget);
      gadget.detailsView.detailsViewData.putValue('listing', listing);
      plugin.showDetailsView(gadget.detailsView, "", gddDetailsViewFlagNone, gadget.onDetailsViewFeedback.bind(gadget));
    }.bind(this, i);
  
    feedContent.appendElement('<div height="1" background="#d7d7d7" />');

  }

}

/**
 * Toggle article star
 */
Feed.prototype.doStar = function(star, article, init) {      

  var editAPI = new EditAPI(article);

  if (!init) {
    article.starred = !article.starred;
  }
  if (article.starred) {
    star.background = 'images/star-on.png';      
    if (!init) {
      editAPI.call('Star');
    }
  } else {
    star.background = 'images/star-off.png';
    if (!init) {
      editAPI.call('Unstar');
    }
  }
}


/**
 * Draw feed contents
 */
Feed.prototype.draw = function() {
	
	// width and horizontal position
		
	for (var i=0; i<feedContent.children.count; i++) {
		var div = feedContent.children.item(i);
		div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
	}	
	
	for (var i=0; i<feedContent.children.count; i++) {
    var div = feedContent.children.item(i);		
  	for (var j=0; j<div.children.count; j++) {    
      if (div.children.item(j).tagName == 'label') {
        div.children.item(j).width = div.width - 2.5*(div.children.item(j).x);
      }
    }
  }
}

/**
 * Process feed data
 */
Feed.prototype.getSuccess = function(responseText) {
  this.feed = responseText.evalJSON()
  if (!this.feed) {
    errorMessage.display(ERROR_MALFORMED_FEED);
    return; 
  }

  this.parse();
  this.refresh();
  this.draw();
  
  reader.currentFeed = this;
  reader.showFeed();
}

/**
 * Display error unless it's a refresh 
 */
Feed.prototype.getError = function(status, responseText) {
  debug.error('error = '+status+' '+responseText);
  if (status == 401) {
    loginSession.logout();
    return;
  }
  if (feedContent.children.count == 0) {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);      
  }
}

