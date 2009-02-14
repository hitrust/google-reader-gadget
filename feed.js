
/**
 * Constructor for Feed class.
 */
function Feed(url) {
  this.url = url;
  this.unread = 0;
  this.feed = {};
  this.show = 'all';
}

/**
* Load feed data
*/
Feed.prototype.load = function() {
  if (!this.url) {
    errorMessage.display(ERROR_FEED_NOT_FOUND);
    return false;
  }
  
  httpRequest.host = CONNECTION.FEED_HOST;
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.STREAM_PREFIX + this.url; 
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.connect('', this.getSuccess.bind(this), this.getError.bind(this));
  return true;
}

/**
 * Check if the reader is currently displaying this feed
 */
Feed.prototype.isDisplayed = function() {
  if (!this.url) return false;
  if (!reader.currentFeed) return false;
  return this.url == reader.currentFeed.url;
}

/**
 * Parse feed contents
 */
Feed.prototype.parse = function() {
  for (var i=0; i < this.feed.items.length ; i++) {
    var article = this.feed.items[i];
    
    this.feed.items[i].read = false;
    this.feed.items[i].starred = false;
    
    this.feed.items[i].snippet = article.content.content.stripTags().replace(new RegExp('[\n|\r|\\s]+', 'gm'), ' ').substring(0,400).trim();
    
    for (var j=0; j < article.categories.length ; j++) {
      var category = article.categories[j];
      if (category.match(/\/read$/)) {
        this.feed.items[i].read = true;
      }
      if (category.match(/\/starred$/)) {
        this.feed.items[i].starred = true;
      }      
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
    if (article.read && this.show != 'all') continue;
    
    var item = feedContent.appendElement('<div height="36" cursor="hand" enabled="true" />');

    if (article.starred) {
      item.appendElement('<div y="10" width="13" height="13" background="images/star-on.png" />');
    } else {
      item.appendElement('<div y="10" width="13" height="13" background="images/star-off.png" />');    
    }

    var titleLabel = item.appendElement('<label x="17" y="4" font="helvetica" size="8" bold="true" color="#161616" trimming="character-ellipsis"></label>');
    titleLabel.innerText = article.title;

    var snippetLabel = item.appendElement('<label x="17" y="17" font="helvetica" size="8" color="#19642c" trimming="character-ellipsis"></label>');
    snippetLabel.innerText = article.snippet;

    item.onmouseover = function() { event.srcElement.background='#e1eef6'; }
    item.onmouseout = function() { event.srcElement.background=''; }

    item.onclick = function() { 
      gadget.detailsView.SetContent('', undefined, 'details.xml', false, 0);
      plugin.showDetailsView(gadget.detailsView, "", gddDetailsViewFlagNone, gadget.onDetailsViewFeedback.bind(gadget));
    }.bind(this);
  
    feedContent.appendElement('<div height="1" background="#d7d7d7" />');

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
Feed.prototype.getSuccess = function(responseText, search) {
  try {
    if (!responseText.trim()) throw new Exception();    
    this.feed = eval('(' + responseText + ')');    
  } catch (e) {  
    errorMessage.display(ERROR_MALFORMED_FEED);
    return;
  }
  
  if (this.isDisplayed()) {
    this.parse();
    this.refresh();
    reader.draw();
  }
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
