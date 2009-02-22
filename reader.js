
/**
 * Constructor for Reader class.
 */
function Reader() {
  this.content = listingContent;   
  this.currentFeed = false;
  this.currentFeedUnread = 0;
  this.scrollbar = new CustomScrollbar(this);
    
  commandsClose.onclick = this.showFeed.bind(this);
  commandsFeeds.onclick = this.showListing.bind(this);
  reload.onclick = this.reload.bind(this);  
  markRead.onclick = this.markRead.bind(this);
  
  
}

/**
 * Open reader after login
 */
Reader.prototype.login = function() {
  loginDiv.visible = false;
  mainDiv.visible = true;  
  gadget.draw();
  this.reload();
  this.startTimeout();
}

/**
* Close reader after logout
*/
Reader.prototype.logout = function() {
  this.reset();
  
  loginDiv.visible = true;
  mainDiv.visible = false;  
  gadget.draw(); 
  
  this.clearTimeout();  
}

/**
* Reset reader
*/
Reader.prototype.reset = function() {
  listing.reset();
  feedContent.removeAllElements();
}

/**
* Start refresh timer
*/
Reader.prototype.startTimeout = function() {
  this.clearTimeout();
  this.timer = view.setTimeout(this.reloadUnreadCount.bind(this), CONNECTION.REFRESH_INTERVAL);
};

/**
* Clear refresh timer
*/
Reader.prototype.clearTimeout = function() {
  if (this.timer) {
    view.clearTimeout(this.timer);
    this.timer = null;
  }
};

/**
* Periodic reload of unread count
*/
Reader.prototype.reloadUnreadCount = function() {
  this.startTimeout();  

  if (loading.visible) return;
  if (!listingContent.visible) return;
  if (!listing.folders || !listing.feeds) return;
  if (!listing.folders['root'] || !listing.folders['all']) return;

  listing.saveScroll();  
  listing.reloadUnreadCount(true);
}

/**
* Mark feed as read
*/
Reader.prototype.markRead = function() {
  if (loading.visible) return;
  if (!markRead.visible) return;
  
  if (this.currentFeed) {
    this.currentFeed.markRead();
  }
}

/**
* Reload reader content
*/
Reader.prototype.reload = function() {
  if (loading.visible) return;
  if (feedContent.visible && this.currentFeed) {
    this.currentFeed.reload();
  } else {
    listing.reload();
  }
}

/**
* Show feed listing
*/
Reader.prototype.showListing = function() {
  this.scrollbar.shouldCallback = false;
  
  title.innerText = STRINGS.FEEDS;

  if (searchArea.visible && this.currentFeed) {
    searchField.close(true);
    this.currentFeed.feed = false;
  }

  feedContent.visible = false;
  listingContent.visible = true;
  commandsFeeds.visible = false;
  commandsClose.visible = this.currentFeed ? true : false;
  commandsSearch.visible = false;
  markRead.visible = false;

  showSearchItems.visible = false;
  showSearchItems.innerText = '';
  showItems.visible = true;
    
  showNewItems.innerText = 'updated';
  showAllItems.innerText = 'all';
  showLine.show(listing.show);
  
  if (this.currentFeed) {
    this.currentFeed.saveScroll();
  }

  this.content = listingContent;
  this.draw();

  if (listing.scroll) {
    this.scrollbar.scrollTo(listing.scroll);
  }
  
  if (this.currentFeed) {
    if (this.currentFeed.unread != this.currentFeedUnread) {
      listing.reloadUnreadCount(true);
    }
  }
  this.currentFeedUnread = 0;
}

/**
* Show individual feed
*/
Reader.prototype.showFeed = function() {
  if (!this.currentFeed) return;

  if (!this.currentFeedUnread) {
    this.currentFeedUnread = this.currentFeed.unread;
  }
  
  if (this.currentFeed && !this.currentFeed.feed) {
    this.currentFeed.reload();
    return;
  }
  
  title.innerText = this.currentFeed.title;

  feedContent.visible = true;
  listingContent.visible = false;
  commandsFeeds.visible = true;
  commandsClose.visible = false;
  if (!searchArea.visible) {
    commandsSearch.visible = true;
  }
  markRead.visible = true;

  listing.saveScroll();

  showLine.update();
  showAllItems.innerText = 'all items';
  showLine.show(this.currentFeed.show);

  this.content = feedContent;
  this.draw();

  if (this.currentFeed.scroll) {
    this.scrollbar.scrollTo(this.currentFeed.scroll);
  } else {
    this.scrollbar.scrollTop();
  }
}

/**
* Draw current reader content
*/
Reader.prototype.draw = function() {

	// height and vertical position 

	var y = 0;
	for (var i=0; i<this.content.children.count; i++) {
    var div = this.content.children.item(i);		
		div.y = y;
    if (div.height) {
  		y += div.height;
    }
	}
	
	this.content.height = y;	// show or hide scrollbar

  if (feedContent.visible && this.currentFeed) {
    this.currentFeed.draw();
  } else if (listingContent.visible) {
    listing.draw();
  }
  	
	if (this.content.height <= contentContainer.height) {
		this.content.width = contentContainer.width;
		scrollbar.visible = false;			
	} else {
		this.content.width = contentContainer.width - (scrollbar.width + 14);			
		scrollbar.visible = true;
    this.content.height--;
	}

  this.scrollbar.draw();  
}


// instantiate object in the global scope
var reader = new Reader();
