/**
 * Constructor for Listing class.
 */
function Listing() {
  this.feeds = {};  
  this.sortIDs = {};
  this.folders = {};
  this.saveFolders = {};
  this.max = 1000;
  this.unread = 0;
}

/**
* Reset listing
*/
Listing.prototype.reset = function() {
  this.feeds = {};  
}

/**
* Toggle folder open/close
*/
Listing.prototype.toggleFolder = function(div) {	
  var divcontents = div.children.item('contents');
  var imgtoggle = div.children.item('header').children.item('toggle');;
  var imgicon = div.children.item('header').children.item('icon');;
  
  if (divcontents.visible) {
    imgtoggle.src = 'images\\folder-plus.png';
    imgicon.src = 'images\\folder-closed.png';
    divcontents.visible = false;
  } else {
    imgtoggle.src = 'images\\folder-minus.png';
    imgicon.src = 'images\\folder-open.png';
    divcontents.visible = true;  
  }
  reader.draw();
}

/**
* Load listing content
*/
Listing.prototype.refresh = function() {	
  if (!this.folders['root'] || !this.folders['root'].items || !this.folders['root'].items.length) return;

  feeds.removeAllElements();

  for (var i=0; i<this.folders['root'].items.length; i++) {
    var sortid = this.folders['root'].items[i];
    var item = this.sortIDs[sortid];

    if (!item) continue;

    if (item.type == 'folder') {
      var folder = this.folders[item.id];
      if (!folder) continue;
      
      var element = feeds.appendElement('<div name="folder" x="2" />');
      var header = element.appendElement('<div name="header" height="19" />');
      var contents = element.appendElement('<div name="contents" x="29" y="18" />');

      header.appendElement('<img name="toggle" y="5" width="9" height="9" src="images/folder-minus.png" cursor="hand" enabled="true" />');
      header.appendElement('<img name="icon" x="13" y="3" width="16" height="14" src="images/folder-open.png" />');

      var link = header.appendElement('<a color="#105caa" x="29" height="19" font="helvetica" size="9" bold="true" />');
      link.innerText = item.title;

      if (folder.unread > 0 && folder.unread < this.max) {
        link.innerText += ' ('+folder.unread+')';
      } else if (folder.unread >= this.max) {
        link.innerText += ' ('+this.max+'+)';      
      }

      for (var j=0; j<folder.items.length; j++) {
        var folderItem = this.sortIDs[folder.items[j]];
        this.refreshFeed(folderItem, contents);
      }

      if (!folder.isExpanded) {
        this.toggleFolder(element);
      }
      
    } else if (item.type == 'feed') {
      this.refreshFeed(item, feeds);
    }
  }
}

/**
* Load a single feed
*/
Listing.prototype.refreshFeed = function(item, container) {	
  if (!item) return;

  var feed = this.feeds[item.id];
  if (!feed) return;

  var element = container.appendElement('<div name="feed" x="16" height="19" />');
  element.appendElement('<img y="4" width="11" height="11" src="images/icon-feed.png" />');

  var link = element.appendElement('<a color="#105caa" x="12" height="19" font="helvetica" size="9" bold="true"></a>');
  link.innerText = item.title;

  if (feed.unread > 0 && feed.unread < this.max) {
    link.innerText += ' ('+feed.unread+')';
  } else if (feed.unread >= this.max) {
    link.innerText += ' ('+this.max+'+)';      
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
     	
     	divheader.children.item('toggle').onclick = this.toggleFolder.bind(this, div);
     	
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

	/*
	for (var i=0; i<listingContent.children.count; i++) {
    var div = listingContent.children.item(i);		
  	for (var j=0; j<div.children.count; j++) {    
      if (div.children.item(j).tagName == 'label') {
        div.children.item(j).width = div.width - 2.5*(div.children.item(j).x);
      }
    }
  }*/
}

/**
* Load feed list
*/
Listing.prototype.reload = function() {
  httpRequest.host = CONNECTION.FEED_HOST;
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.overrideLoading = true;

/*
  API_SUBSCRIPTIONS: 'subscription/list?output=json',
  API_UNREADCOUNT: 'unread-count?all=true&output=json',  
  API_SORTORDER: 'preference/stream/list?output=json',
  API_PREFERENCES: 'preference/list?output=json',
  API_FOLDERS: 'tag/list?output=json'
*/

  // request the subscriptions
  debug.error('beginning');
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_SUBSCRIPTIONS;
  httpRequest.connect('', this.saveSubscriptions.bind(this), this.getError.bind(this));

/* this.currentFeed = new Feed('feed/http://itsgettinghotinhere.org/feed/');
 this.currentFeed.load();
 showLine.show(this.currentFeed.show); */
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
  debug.error('saveSubscriptions');

  if (!json || !json.subscriptions || !json.subscriptions.length) {
    this.getError();
    return false; 
  }

  this.folders = {};
  this.folders['root'] = new Folder();
  this.folders['all'] = new Folder();

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
  debug.error('saveUnreadCount');

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
      this.folders[unreadcount.id].unread = unreadcount.count;
    }
    if (this.feeds[unreadcount.id]) {
      this.feeds[unreadcount.id].unread = unreadcount.count;
      this.unread += unreadcount.count;
    }
  }
  return true;
}

/**
* save folders
*/
Listing.prototype.saveFolders = function(responseText) {
  var json = responseText.evalJSON()
  debug.error('saveFolders');

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
  debug.error('savePreferences');

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
  debug.error('saveSortOrder');

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
  this.draw();
  return true;
}

// instantiate object in the global scope
var listing = new Listing();
