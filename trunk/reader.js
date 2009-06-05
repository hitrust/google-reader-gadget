/*
Copyright (C) 2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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

var REFRESH_INTERVAL_MS = 5 * 60 * 1000;
var MAX_REFRESH_INTERVAL_MS = 2 * 60 * 60 * 1000;

/**
* Start refresh timer
*/
Reader.prototype.startTimeout = function() {
  this.clearTimeout();

  var nextRetryMs = Math.pow(2, httpRequest.failCount) * REFRESH_INTERVAL_MS;

  if (nextRetryMs > MAX_REFRESH_INTERVAL_MS) {
    nextRetryMs = MAX_REFRESH_INTERVAL_MS;
  }

  // A dash of randomness.
  var jitter = nextRetryMs * .1;
  jitter *= Math.random();
  jitter = Math.floor(jitter);

  nextRetryMs += jitter;

  debug.trace('Retry request in ' + nextRetryMs);

  this.timer = view.setTimeout(this.reloadUnreadCount.bind(this), nextRetryMs);
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

  if (feedContent.visible && this.currentFeed) {
    this.currentFeed.reload();
    return;
  }

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
    
  showNewItems.innerText = STRINGS.UPDATED;
  showAllItems.innerText = STRINGS.ALL;
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
  
  title.innerText = this.currentFeed.title.fromEntities();

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
  showAllItems.innerText = STRINGS.ALL_ITEMS_LOWER;
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
