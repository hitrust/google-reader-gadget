
/**
 * Constructor for Reader class.
 */
function Reader() {
  this.content = listingContent;   
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
  listing.reset();
  feedContent.removeAllElements();
}

/**
* Reload reader content
*/
Reader.prototype.reload = function() {
  if (loading.visible) return;
  listing.reload();
}

/**
* Show feed listing
*/
Reader.prototype.showListing = function() {
  title.innerText = 'Feeds';

  feedContent.visible = false;
  listingContent.visible = true;
  commandsFeeds.visible = false;
  commandsClose.visible = this.currentFeed ? true : false;
  commandsSearch.visible = false;
  
  showNewItems.innerText = 'updated';
  showAllItems.innerText = 'all';
  showLine.draw();
  
  if (this.currentFeed) {
    this.currentFeed.saveScroll();
  }

  this.content = listingContent;
  this.draw();

  if (listing.scroll) {
    this.scrollbar.scrollTo(listing.scroll);
  }
}

/**
* Show individual feed
*/
Reader.prototype.showFeed = function() {
  if (!this.currentFeed) return;
  
  title.innerText = this.currentFeed.title;

  feedContent.visible = true;
  listingContent.visible = false;
  commandsFeeds.visible = true;
  commandsClose.visible = false;
  commandsSearch.visible = true;

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
