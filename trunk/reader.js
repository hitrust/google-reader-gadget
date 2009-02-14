
/**
 * Constructor for Reader class.
 */
function Reader() {
  this.feeds = [];  
  
  this.content = feedContent;   
  this.currentFeed = false;
  this.scrollbar = new CustomScrollbar(this);
  
  commandsClose.onclick = this.showFeed.bind(this);
  commandsFeeds.onclick = this.showListing.bind(this);
  reload.onclick = this.reload.bind(this);
}

/**
 * Open reader after login
 */
Reader.prototype.login = function() {
  loginDiv.visible = false;
  mainDiv.visible = true;  
  gadget.draw();
  this.reload();
}

/**
* Close reader after logout
*/
Reader.prototype.logout = function() {
  this.reset();
  
  loginDiv.visible = true;
  mainDiv.visible = false;  
  gadget.draw();  
}

/**
* Reset reader
*/
Reader.prototype.reset = function() {
  this.feeds = [];  
  
  feedContent.removeAllElements();
}

/**
* Show feed listing
*/
Reader.prototype.showListing = function() {
  feedContent.visible = false;
  listingContent.visible = true;
  commandsFeeds.visible = false;
  commandsClose.visible = true;
  commandsSearch.visible = false;

  this.content = listingContent;
  this.draw();
}

/**
* Show individual feed
*/
Reader.prototype.showFeed = function() {
  feedContent.visible = true;
  listingContent.visible = false;
  commandsFeeds.visible = true;
  commandsClose.visible = false;
  commandsSearch.visible = true;

  this.content = feedContent;
  this.draw();
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

/**
* Reload reader feed list
*/
Reader.prototype.reload = function() {
  if (loading.visible) return;
 // http://www.google.com/reader/api/0/subscription/list
 // http://www.google.com/reader/api/0/unread-count?all=true 
 
 this.currentFeed = new Feed('feed/http://itsgettinghotinhere.org/feed/');
 this.currentFeed.load();
 showLine.show(this.currentFeed.show);
}

// instantiate object in the global scope
var reader = new Reader();
