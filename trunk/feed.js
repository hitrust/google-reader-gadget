
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
  this.init = true;
  this.isFriend = true;
  this.isLoadingMore = false;
  this.continuation = false;
  this.noAllowContinuation = {};
  this.isAlwaysShowUnread = false;
  this.folders = {};  
  
  this.searchResults = [];
  this.searchStart = 0;
  
  this.itemHeight = 36;
  this.count = 20;    
}

/**
 * Set unread count
 */
Feed.prototype.setUnread = function(x) {
  this.unread = x;
}

/**
 * Mark feed to always show unread
 */
Feed.prototype.setAlwaysShowUnread = function() {
  this.isAlwaysShowUnread = true;
}

/**
 * Does feed show unread?
 */
Feed.prototype.alwaysShowUnread = function() {
  return this.isAlwaysShowUnread;
}

/**
* Mark feed as read
*/
Feed.prototype.markRead = function() {
  if (loading.visible) return false;

  this.unread = 0;
  
  var editAPI = new EditAPI(this);
  editAPI.call('MarkFeedRead');

  for (var i=0; i<this.feed.items.length; i++) {
    this.feed.items[i].read = true;
  }

  showLine.update();        
  reader.showFeed();
}

/**
* Search feed 
*/
Feed.prototype.search = function() {
  if (loading.visible) return false;

  var flags = '&num=1000';
  flags += '&s='+encodeURIComponent(this.id);
  
  httpRequest.host = CONNECTION.READER_HOST;
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.SEARCH_PREFIX + encodeURIComponent(search.value.trim()) + flags;    
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.connect('', this.getSearchIDs.bind(this), this.getError.bind(this));
}

/**
* Get search data
*/
Feed.prototype.getSearchIDs = function(responseText) {
  var results = responseText.evalJSON();
  if (!results || !results.results || !results.results.length) {
    errorMessage.display(ERROR_NO_RESULTS);
    return; 
  }

  this.searchResults = [];
  for (var i=0; i<results.results.length; i++) {
    this.searchResults.push(results.results[i].id);
  }

  reader.scrollbar.setCallback(this.loadMoreSearch.bind(this));

  gadget.token = false;
  this.scroll = false;  
  this.continuation = false;
  this.isLoadingMore = false;
  this.noAllowContinuation = {};
  
  this.searchStart = 0;
  
  var editAPI = new EditAPI(this, this.getSuccess.bind(this));
  editAPI.call('Search');

  return true;
}

Feed.prototype.closeSearch = function(noReload) {
  if (!this.searchResults || !this.searchResults.length) {
    return;
  }
  
  this.searchResults = [];
  this.searchStart = 0;

  if (!noReload) {
    this.reload();
  }
}


/**
* Load feed data
*/
Feed.prototype.reload = function() {
  if (loading.visible) return false;

  reader.scrollbar.setCallback(this.loadMore.bind(this));
  this.searchResults = [];

  gadget.token = false;
  this.scroll = false;  
  this.continuation = false;
  this.isLoadingMore = false;
  this.noAllowContinuation = {};
  
  var flags = '?n='+this.count;
  if (this.show == 'new') {
    flags += '&xt=user/-/state/com.google/read';
  }
  
  httpRequest.host = CONNECTION.READER_HOST;
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.STREAM_PREFIX + encodeURIComponent(this.id) + flags;
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.connect('', this.getSuccess.bind(this), this.getError.bind(this));
  return true;
}

/**
 * Load more search results
 */
Feed.prototype.loadMoreSearch = function() {
  if (this.noAllowContinuation['search']) {
    return false;
  }
  if (!feedContent.visible || !reader.currentFeed) {
    reader.scrollbar.callback = false;
    return false;
  }

  if (loading.visible) return false;
  if (!this.searchResults || !this.searchResults.length) return false;
  
  var height = reader.scrollbar.container.content.height - contentContainer.height;
  var beneath = reader.scrollbar.container.content.y + height;

  if (beneath < this.itemHeight * this.count * 0.25) {    
    reader.scrollbar.save();
    this.isLoadingMore = true;
    this.continuation = true;
    this.searchStart += this.count;

    var editAPI = new EditAPI(this, this.getSuccess.bind(this));
    editAPI.call('Search');
  }
  
  return true;
}

/**
 * Load more feed data
 */
Feed.prototype.loadMore = function() {
  if (this.noAllowContinuation[this.show]) {
    return false;
  }
  if (!feedContent.visible || !reader.currentFeed) {
    reader.scrollbar.callback = false;
    return false;
  }

  if (loading.visible) return false;
  if (!this.continuation) return false;

  var height = reader.scrollbar.container.content.height - contentContainer.height;
  var beneath = reader.scrollbar.container.content.y + height;

  if (beneath < this.itemHeight * this.count * 0.25) {
    gadget.token = false;
    reader.scrollbar.save();
    this.isLoadingMore = true;
    
    var flags = '?n=' + this.count + '&c=' + this.continuation;
    if (this.show == 'new') {
      flags += '&xt=user/-/state/com.google/read';
    }

    httpRequest.host = CONNECTION.READER_HOST;
    httpRequest.url = CONNECTION.READER_URL + CONNECTION.STREAM_PREFIX + encodeURIComponent(this.id) + flags;
    httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
    httpRequest.connect('', this.getSuccess.bind(this), this.getError.bind(this));
  }
  
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
  this.scroll = reader.scrollbar.position();
}

/**
 * Parse feed contents
 */
Feed.prototype.parse = function() {
  for (var i=0; i < this.feed.items.length ; i++) {
    try {
      if (this.feed.items[i].touched) continue;

      var article = this.feed.items[i];
      
      this.feed.items[i].read = false;
      this.feed.items[i].keep = false;
      this.feed.items[i].fresh = false;
      this.feed.items[i].starred = false;
      this.feed.items[i].touched = true;

      this.feed.items[i].srcTitle = (article.origin && article.origin.title) ? article.origin.title : this.title;
      this.feed.items[i].subtitle = this.feed.items[i].srcTitle.fromEntities();
      if (article.author) {
        this.feed.items[i].subtitle += ' - '+article.author.fromEntities();
      }
      
      var content = article.content ? article.content : article.summary;
      
      this.feed.items[i].origin = (article.origin && article.origin.streamId) ? article.origin.streamId : this.id;

      this.feed.items[i].snippet = content.content
          .stripTags()
          .replace(new RegExp('[\n|\r|\\s]+', 'gm'), ' ')
          .substring(0,400)
          .trim()
          .fromEntities();
          
      // XXX: strip HTML from the article body for now
      this.feed.items[i].body = content.content
          .replace(new RegExp('</p>', 'igm'), "</p>\n\n")
          .replace(new RegExp('<br[^>]+>', 'igm'), "<br />\n")
          .stripTags()
          .trim()
          .replace(new RegExp('[\n|\r]{3,}', 'gm'), "\n\n")
          .fromEntities();

      this.feed.items[i].title = article.title.fromEntities();

      this.feed.items[i].rawBody = content.content;
  
      this.feed.items[i].tags = [];
            
      for (var j=0; j < article.categories.length ; j++) {
        var category = article.categories[j];
        if (category.match(/user\/(.*?)\/read$/)) {
          this.feed.items[i].read = true;
        }
        if (category.match(/user\/(.*?)\/fresh$/)) {
          this.feed.items[i].fresh = true;
        }
        if (category.match(/user\/(.*?)\/kept-unread$/)) {
          this.feed.items[i].keep = true;
        }                
        if (category.match(/user\/(.*?)\/starred$/)) {

          this.feed.items[i].starred = true;
        }
        if (this.isFriend) {
          if (listing.userIds && listing.userIds.length) {
            for (var k=0; k<listing.userIds.length; k++) {
              var x = new RegExp('user/'+listing.userIds[k]+'/state/com\.google/broadcast$');
              if (category.match(x)) {
                this.feed.items[i].shared = true;
              }                
            }
          }        
        } else {
          if (category.match(/user\/(.*?)\/broadcast$/)) {
            this.feed.items[i].shared = true;
          }                
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
  if (!this.feed.items) return;

  feedContent.removeAllElements();

  for (var i=0; i < this.feed.items.length ; i++) {
    var article = this.feed.items[i];

    if (!article) continue;
    if (!this.isAlwaysShowUnread) {
      if (article.read && this.show != 'all') continue;
    }

    var element = feedContent.appendElement('<div height="'+this.itemHeight+'" cursor="hand" enabled="true" />');

    var star = element.appendElement('<div y="10" width="13" height="13" background="images/star-on.png" enabled="true" cursor="hand" />');
    star.onclick = this.doStar.bind(this, star, this.feed.items[i]);
    this.doStar(star, this.feed.items[i], true);
    
    var titleLabel = element.appendElement('<label x="17" y="4" font="helvetica" size="8" color="#161616" trimming="character-ellipsis"></label>');
    titleLabel.innerText = article.title;

    var snippetLabel = element.appendElement('<label x="17" y="17" font="helvetica" size="8" trimming="character-ellipsis"></label>');
    snippetLabel.innerText = article.snippet;

    if (article.read) {
      titleLabel.bold = false;
      snippetLabel.color = '#666666';
    } else {
      titleLabel.bold = true;
      snippetLabel.color = '#19642c';      
    }

    element.onmouseover = function() { 
      if (event.srcElement.children.item(1).bold == true) {
        event.srcElement.background='#e1eef6'; 
      } else {
        event.srcElement.background='#ececec';       
      }
    }.bind(this);
    element.onmouseout = function() { event.srcElement.background=''; }.bind(this);

    element.onclick = function(i) { 
      gadget.detailsView.SetContent('', undefined, 'details.xml', false, 0);
      gadget.detailsView.detailsViewData.putValue('article', this.feed.items[i]);
      gadget.detailsView.detailsViewData.putValue('loginSession', loginSession);
      gadget.detailsView.detailsViewData.putValue('gadget', gadget);
      gadget.detailsView.detailsViewData.putValue('listing', listing);
      gadget.detailsView.detailsViewData.putValue('feed', this);
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
  var newFeed = responseText.evalJSON();
  if (!newFeed) {
    errorMessage.display(ERROR_MALFORMED_FEED);
    return; 
  }

  if (!this.searchResults || !this.searchResults.length) {
    showItems.visible = true;  
    showSearchItems.visible = false; 
    showSearchItems.innerText = ''; 
    searchField.reset();
  } else {
    showItems.visible = false;
    showSearchItems.visible = true;  
    showSearchItems.innerText = STRINGS.SEARCH_FOR+' "'+search.value.trim()+'"';
  }

  if (this.continuation && this.feed) {
    this.feed.items = this.feed.items.concat(newFeed.items);
  } else {
    this.feed = newFeed;
  }

  this.continuation = newFeed.continuation;

  this.parse();
  this.refresh();
  this.draw();
  
  if (this.isLoadingMore) {
    reader.scrollbar.draw();
    reader.draw();
  
    var prevScrollY = reader.scrollbar.positionY;
    reader.scrollbar.reposition();
    if (reader.scrollbar.positionY == prevScrollY) {
      this.noAllowContinuation[this.show] = true;
      this.noAllowContinuation['search'] = true;
    }

    return;
  }

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
  if (!this.feed.items || !this.feed.items.length) {
    feedContent.removeAllElements();

    errorMessage.display(ERROR_SERVER_OR_NETWORK);

    reader.currentFeed = this;
    reader.showFeed();
    
    commandsSearch.visible = false;
    markRead.visible = false;
    reader.currentFeed = false;
  }
}

