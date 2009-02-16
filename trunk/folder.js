/**
 * Constructor for Folder class.
 */
function Folder(id, label) {
  this.items = [];
  this.unread = 0;
  this.id = id;
  this.title = label;
  this.isExpanded = true;

  this.element = false;
  this.header = false;
  this.contents = feeds;  
  this.link = false;
  this.plusminus = false;  
  this.icon = false;
  
  this.feed = new Feed(this.id, this.title);
}

/**
 * Set unread count
 */
Folder.prototype.setUnread = function(x) {
  this.unread = x;
  this.feed.unread = x;
}

/**
 * Reset feed order
 */
Folder.prototype.reset = function() {
  this.items = [];
}

/**
 * Push new item.
 */
Folder.prototype.push = function(item) {
  this.items.push(item)
}

/**
 * Unshift new item.
 */
Folder.prototype.unshift = function(item) {
  this.items.unshift(item)
}

/**
* Reload a folder feed
*/
Folder.prototype.reload = function() {	
  return this.feed.reload();
}

/**
 * Refresh in listing.
 */
Folder.prototype.refresh = function() {
  this.element = feeds.appendElement('<div name="folder" x="2" />');
  this.header = this.element.appendElement('<div name="header" height="19" />');
  this.contents = this.element.appendElement('<div name="contents" x="29" y="18" />');
  
  this.plusminus = this.header.appendElement('<img name="toggle" y="5" width="9" height="9" src="images/folder-minus.png" cursor="hand" enabled="true" />');
  this.icon = this.header.appendElement('<img name="icon" x="13" y="3" width="16" height="14" src="images/folder-open.png" />');
  
  this.link = this.header.appendElement('<a color="#105caa" x="29" height="19" font="helvetica" size="9" bold="true" />');
  listing.updateUnreadCount(this);

  if (listing.openFolders[this.id] === false) {
    this.isExpanded = false;
  }

  if (!listing.openFolders[this.id] && !this.isExpanded) {
    this.toggle();
  }
  
 	this.plusminus.onclick = this.toggle.bind(this);
}

/**
* Load a single feed
*/
Folder.prototype.refreshFeed = function(item) {	
  if (!item) return;

  var feed = listing.feeds[item.id];
  if (!feed) return;

  var element = this.contents.appendElement('<div name="feed" x="16" height="19" />');
  element.appendElement('<img y="4" width="11" height="11" src="images/icon-feed.png" />');

  feed.link = element.appendElement('<a color="#105caa" x="12" height="19" font="helvetica" size="9" bold="true"></a>');
  listing.updateUnreadCount(feed);
}

/**
* Toggle folder open/close
*/
Folder.prototype.toggle = function() {	  
  if (this.contents.visible) {
    this.plusminus.src = 'images\\folder-plus.png';
    this.icon.src = 'images\\folder-closed.png';
    this.contents.visible = false;
    this.isExpanded = false;
    listing.openFolders[this.id] = false;
  } else {
    this.plusminus.src = 'images\\folder-minus.png';
    this.icon.src = 'images\\folder-open.png';
    this.contents.visible = true;  
    this.isExpanded = true;
    listing.openFolders[this.id] = true;
  }
  reader.draw();
}

/**
 * Constructor for Sort class.
 */
function Sort(obj, type) {
  this.id = obj.id;
  this.title = obj.title || '';
  this.type = type || 'feed';
}
