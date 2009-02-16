/**
 * Constructor for Listing class.
 */
function Listing() {
  this.feeds = {};  
  this.sortIDs = {};
  this.folders = {};
  this.max = 1000;
  this.unread = 0;
  this.openFolders = {};
  this.scroll = false;
}

/**
* Reset listing
*/
Listing.prototype.reset = function() {
  this.feeds = {};  
}

/**
 * Save the scroll position
 */
Listing.prototype.saveScroll = function() {
  this.scroll = reader.scrollbar.postition();
}

/**
* Load listing content
*/
Listing.prototype.refresh = function() {	
  if (!this.folders['root'] || !this.folders['root'].items || !this.folders['root'].items.length) return;

  feeds.removeAllElements();

  this.updateUnreadCount(this.folders['root']);

  for (var i=0; i<this.folders['root'].items.length; i++) {
    var folder = this.folders['root'];
    var sortid = folder.items[i];
    var item = this.sortIDs[sortid];

    if (!item) continue;

    if (item.type == 'folder') {
      var folder = this.folders[item.id];
      if (!folder) continue;

      folder.refresh();
      
      for (var j=0; j<folder.items.length; j++) {
        var sortid = folder.items[j];
        var item = this.sortIDs[sortid];

        folder.refreshFeed(item);
      }
      
    } else if (item.type == 'feed') {
      folder.refreshFeed(item);
    }
  }
}


/**
* Draw listing content
*/
Listing.prototype.draw = function() {	
	// width and horizontal position

  starredItemsIcon.x = labelCalcWidth(starredItems) + 2;

	for (var i=0; i<listingContent.children.count; i++) {
		var div = listingContent.children.item(i);
		div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
	}	

  // friends
	
  if (friends.height) {
    reader.content.height -= friends.height;
    feeds.y -= friends.height;
  }
  	
	var y = 0;
	for (var i=0; i<friends.children.count; i++) {
    var div = friends.children.item(i);		
		div.width = contentContainer.width - friends.x;
		div.y = y;
    if (div.height) {
  		y += div.height;
    }
	}

  friends.height = y;
  reader.content.height += friends.height;

  // feeds

  if (feeds.height) {
    reader.content.height -= feeds.height;
  }

	var y = 0;
	for (var i=0; i<feeds.children.count; i++) {
    var div = feeds.children.item(i);	
 		div.width = contentContainer.width - (div.x || 0)
 		div.y = y;

    if (div.name == 'feed')	{
      if (div.height) {
    		y += div.height;
      }
      
    } else if (div.name == 'folder') {
      var divheader = div.children.item('header');	    
      var divcontents = div.children.item('contents');	
     	var yy = 0;

     	divheader.width = div.width;     	
     	divcontents.width = div.width;
     	     	
     	if (divcontents.visible) {
       	for (var j=0; j<divcontents.children.count; j++) {
          var divfeed = divcontents.children.item(j);		
      		divfeed.width = divcontents.width;
      		divfeed.y = yy;
          if (divfeed.height) {
        		yy += divfeed.height;
          }     	  
        }
      }
      
      divcontents.height = yy;      
      div.height = divheader.height + divcontents.height;
   		y += div.height;
    }
    
	}

  feeds.height = y;
  reader.content.height += feeds.height;
  feeds.y += friends.height;
}

/**
* Load feed list
*/
Listing.prototype.reload = function() {
  if (loading.visible) return false;

  httpRequest.host = CONNECTION.FEED_HOST;
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.overrideLoading = true;

  // request the subscriptions
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_SUBSCRIPTIONS;
  httpRequest.connect('', this.saveSubscriptions.bind(this), this.getError.bind(this));
}

/**
* error case
*/
Listing.prototype.getError = function() {
  httpRequest.hideLoading();
  debug.error('error!');
}


/**
* save subscriptions
*/
Listing.prototype.saveSubscriptions = function(responseText) {
  var json = responseText.evalJSON()

  if (!json || !json.subscriptions || !json.subscriptions.length) {
    this.getError();
    return false; 
  }

  this.folders = {};
  this.folders['root'] = new Folder('', 'All items');
  this.folders['root'].link = allItems;
  
  this.folders['all'] = new Folder('', 'All items');
  this.folders['all'].link = allItems;

  for (var i=0; i<json.subscriptions.length; i++) {
    var subscription = json.subscriptions[i];
    this.sortIDs[subscription.sortid] = new Sort(subscription, 'feed');
    
    if (!this.feeds[subscription.sortid] || this.feeds[subscription.sortid].id != subscription.id) {
      this.feeds[subscription.id] = new Feed(subscription.id, subscription.title);
    } else {
      this.feeds[subscription.id].title = subscription.title;
    }

    if (subscription.categories.length) {
      for (var j=0; j<subscription.categories.length; j++) {
        var category = subscription.categories[j];
        if (!this.folders[category.id]) {
          this.folders[category.id] = new Folder(category.id, category.label);
        }
        this.folders[category.id].push(subscription.sortid);
        this.feeds[subscription.id].folders[category.id] = this.folders[category.id];
      }
    } else {
     this.folders['root'].push(subscription.sortid);
    }
    this.folders['all'].push(subscription.sortid);
  }
  
  // request the unread count
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_UNREADCOUNT;
  httpRequest.connect('', this.saveUnreadCount.bind(this), this.getError.bind(this));
  return true;
}

/**
* save unread count
*/
Listing.prototype.saveUnreadCount = function(responseText) {
  if (!this._saveUnreadCount(responseText)) {
    this.folders['root'] = this.folders['all'];
    this.finish();
    return false;
  }

  // request the folders
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_FOLDERS;
  httpRequest.connect('', this.saveFolders.bind(this), this.getError.bind(this));
  return true;  
}

/**
* actually save unread count
*/
Listing.prototype._saveUnreadCount = function(responseText) {
  var json = responseText.evalJSON()

  if (!json || !json.unreadcounts || !json.unreadcounts.length) {
    return false; 
  }
  
  if (json.max) {
    this.max = json.max;
  }

  this.unread = 0;

  for (var i=0; i<json.unreadcounts.length; i++) {
    var unreadcount = json.unreadcounts[i];
    if (this.folders[unreadcount.id]) {
      this.folders[unreadcount.id].setUnread(unreadcount.count);
    }
    if (this.feeds[unreadcount.id]) {
      this.feeds[unreadcount.id].setUnread(unreadcount.count);
      this.unread += unreadcount.count;
    }
  }

  this.folders['root'].setUnread(this.unread);
  return true;
}

/**
* update unread count
*/
Listing.prototype.updateUnreadCount = function(item) {
  item.link.innerText = item.title;
  
  if (item.unread > 0 && item.unread < this.max) {
    item.link.innerText += ' ('+item.unread+')';
  } else if (item.unread >= this.max) {
    item.link.innerText += ' ('+this.max+'+)';      
  }
 	item.link.onclick = item.reload.bind(item);
}

/**
* save folders
*/
Listing.prototype.saveFolders = function(responseText) {
  var json = responseText.evalJSON()

  if (!json || !json.tags || !json.tags.length) {
    this.folders['root'] = this.folders['all'];
    this.finish();
    return false; 
  }
  
  var sortids = [];
  
  for (var i=0; i<json.tags.length; i++) {
    var tag = json.tags[i];
    if (this.folders[tag.id]) {
      this.sortIDs[tag.sortid] = new Sort(this.folders[tag.id], 'folder');
      sortids.unshift(tag.sortid);
    }
  }

  for (var i=0; i<sortids.length; i++) {
    this.folders['root'].unshift(sortids[i]);
  }

  // request the preferences
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_PREFERENCES;
  httpRequest.connect('', this.savePreferences.bind(this), this.getError.bind(this));
  return true;
}


/**
* save preferences
*/
Listing.prototype.savePreferences = function(responseText) {
  var json = responseText.evalJSON()
  var sort = false;

  if (json && json.prefs && json.prefs.length) {
    for (var i=0; i<json.prefs.length; i++) {
      var pref = json.prefs[i];
      if (pref.id == 'lhn-prefs') {
        if (pref.value) {
          var value = pref.value.evalJSON()
          if (value && value.subscriptions && value.subscriptions.ssa == 'false') {
            sort = true;
          }
        }
      }
    }
  }
  
  if (sort) {
    // request the sort order
    httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_SORTORDER;
    httpRequest.connect('', this.saveSortOrder.bind(this), this.getError.bind(this));
    return true;
  } else {
    return this.finish();
  }
}

/**
* save sort order
*/
Listing.prototype.saveSortOrder = function(responseText) {
  var json = responseText.evalJSON()

  if (!json || !json.streamprefs) {
    return this.finish();
  }

  var ordering = {};
  
  for (var id in json.streamprefs) {
    if (typeof json.streamprefs[id] == "function" ||
        typeof json.streamprefs[id] == "array" ||
        !json.streamprefs[id].length) continue;

    var prefs = json.streamprefs[id];
    
    if (id.match(/\/root$/)) {
      for (var i=0; i<prefs.length; i++) {
        if (prefs[i].id == 'subscription-ordering') {
          ordering['root'] = prefs[i].value;
        }
      }
    } else if (this.folders[id]) {
      for (var i=0; i<prefs.length; i++) {
        if (prefs[i].id == 'subscription-ordering') {
          ordering[id] = prefs[i].value;
        }
        if (prefs[i].id == 'is-expanded' && prefs[i].value == 'false') {
          this.folders[id].isExpanded = false;
        }
      }
    }
  }

  for (var id in ordering) {
    if (typeof ordering[id] == "function" ||
        typeof ordering[id] == "array" ||
        !ordering[id].length) continue;

    if (this.folders[id]) {   
      this.folders[id].reset();

      var len = ordering[id].length / 8;
      for (var i=0; i<len; i++) {
        var sortid = ordering[id].substring(i*8, i*8+8);
        this.folders[id].push(sortid);
      }    
    }
  }

  this.finish();
}

/**
 * Finish feed load and draw
 */
Listing.prototype.finish = function() {
  httpRequest.hideLoading();

  this.refresh();
  gadget.draw();
  return true;
}

// instantiate object in the global scope
var listing = new Listing();
