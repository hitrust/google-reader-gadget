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
 * Constructor for Listing class.
 */
function Listing() {
  this.feeds = {};  
  this.sortIDs = {};
  this.folders = {};
  this.max = 1000;
  this.openFolders = {};
  this.scroll = false;
  this.show = 'all';
  this.init = true;
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
  this.scroll = reader.scrollbar.position();
}

/**
* Load listing content
*/
Listing.prototype.refresh = function() {	
  if (!this.folders['root'] || !this.folders['root'].items || !this.folders['root'].items.length) return;

  feeds.removeAllElements();
  friends.removeAllElements();
  
  this.updateUnreadCount(this.folders['root']);
  this.updateUnreadCount(this.folders['starred']);
  this.updateUnreadCount(this.folders['your']);
  this.updateUnreadCount(this.feeds['shared']);
  this.updateUnreadCount(this.feeds['notes']);
  this.updateUnreadCount(this.folders['friends']);  

  for (var i=0; i<this.folders['root'].items.length; i++) {
    var folder = this.folders['root'];
    var sortid = folder.items[i];
    var item = this.sortIDs[sortid];

    if (!item) continue;

    if (item.type == 'folder') {
      var folder = this.folders[item.id];
      if (!folder) continue;

      if (!folder.refresh()) continue;
      
      for (var j=0; j<folder.items.length; j++) {
        var sortid = folder.items[j];
        var item = this.sortIDs[sortid];

        folder.refreshFeed(item);
      }
      
    } else if (item.type == 'feed') {
      folder.refreshFeed(item);
    }
  }
  
  if (this.folders['friends'] && (this.folders['friends'].unread || this.show == 'all')) {  
    friendsItems.visible = (this.friends.length > 0);
    friends.visible = (this.friends.length > 0);
    
    for (var i=0; i<this.friends.length; i++) {
      var friend = this.friends[i];
      
      folder.refreshFriend(friend);    
    }
  } else {
    friendsItems.visible = false;
    friends.visible = false;
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

  if (!friendsItems.visible) {
    feeds.y -= friendsItems.height;
    reader.content.height -= friendsItems.height;
  }
}

/**
* Load feed list
*/
Listing.prototype.reload = function() {
  if (loading.visible) return false;

  this.saveScroll();

  httpRequest.host = CONNECTION.READER_HOST;
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.overrideLoading = true;

  // request the friends list
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_FRIEND_LIST;
  httpRequest.connect('', this.saveFriendsList.bind(this), this.getError.bind(this));
}

/**
* error case
*/
Listing.prototype.getError = function() {
  httpRequest.hideLoading();
  debug.error('error!');
}

/**
* save friends list
*/
Listing.prototype.saveFriendsList = function(responseText) {
  var json = responseText.evalJSON()

  if (!json || !json.friends) {
    this.getError();
    return false;     
  }
  
  this.friends = [];
  if (json.friends && json.friends.length) {
    for (var i=0; i<json.friends.length; i++) {
      var friend = json.friends[i];
      if (friend.contactId == "-1" || friend.flags == "9") {
        this.displayName = friend.displayName;
        if (friend.emailAddresses.length) {
          this.emailAddress = friend.emailAddresses[0];
        }
        this.userIds = friend.userIds;
      }
      else if (friend.types) {
        if (friend.types.indexOf(1) != -1) {
          this.friends.push(friend);
        }
      }
    }
  }

  // request the subscriptions
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_SUBSCRIPTIONS;
  httpRequest.connect('', this.saveSubscriptions.bind(this), this.getError.bind(this));
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
  
  // special folders and feeds
  
  this.folders['root'] = new Folder('user/-/state/com.google/reading-list', STRINGS.ALL_ITEMS);
  this.folders['root'].link = allItems;
  this.folders['root'].setUnread(0);
  
  this.folders['all'] = new Folder('user/-/state/com.google/reading-list', STRINGS.ALL_ITEMS);
  this.folders['all'].link = allItems;
  this.folders['all'].setUnread(0);

  if (!this.folders['starred']) {
    this.folders['starred'] = new Folder('user/-/state/com.google/starred', STRINGS.STARRED_ITEMS);
    this.folders['starred'].link = starredItems;
  }
  this.folders['starred'].setAlwaysShowUnread();
  this.folders['starred'].setUnread(0);

  if (this.friends && this.friends.length) {
    if (!this.folders['friends']) {
      this.folders['friends'] = new Folder('user/-/state/com.google/broadcast-friends', STRINGS.FRIENDS_SHARED_ITEMS);
      this.folders['friends'].link = friendsItems; 
    }
    this.folders['friends'].setUnread(0);

    for (var j=0; j<this.friends.length; j++) {
      var friend = this.friends[j];
      
      this.feeds[friend.stream] = new Feed(friend.stream, friend.displayName);
      this.feeds[friend.stream].isFriend = true;
    }   
  }

  if (!this.folders['your']) {
    this.folders['your'] = new Folder('user/-/state/com.google/self', STRINGS.YOUR_STUFF);
    this.folders['your'].link = yourStuff;
  }
  this.folders['your'].setAlwaysShowUnread();
  this.folders['your'].setUnread(0);

  if (!this.feeds['shared']) {
    this.feeds['shared'] = new Feed('user/-/state/com.google/broadcast', STRINGS.SHARED_ITEMS);
    this.feeds['shared'].link = sharedItems;
  }
  this.feeds['shared'].setAlwaysShowUnread();
  this.feeds['shared'].setUnread(0);

  if (!this.feeds['notes']) {
    this.feeds['notes'] = new Feed('user/-/state/com.google/created', STRINGS.NOTES);
    this.feeds['notes'].link = yourNotes;
  }
  this.feeds['notes'].setAlwaysShowUnread();
  this.feeds['notes'].setUnread(0);

  // subscriptions and folders

  for (var i=0; i<json.subscriptions.length; i++) {
    var subscription = json.subscriptions[i];
    this.sortIDs[subscription.sortid] = new Sort(subscription, 'feed');
    
    if (!this.feeds[subscription.sortid] || this.feeds[subscription.sortid].id != subscription.id) {
      this.feeds[subscription.id] = new Feed(subscription.id, subscription.title);
    } else {
      this.feeds[subscription.id].title = subscription.title;
      this.feeds[subscription.id].setUnread(0);
    }

    if (subscription.categories.length) {
      for (var j=0; j<subscription.categories.length; j++) {
        var category = subscription.categories[j];
        if (!this.folders[category.id]) {
          this.folders[category.id] = new Folder(category.id, category.label);
        }
        this.folders[category.id].setUnread(0);
        this.folders[category.id].push(subscription.sortid);
        this.feeds[subscription.id].folders[category.id] = this.folders[category.id];
      }
    } else {
     this.folders['root'].push(subscription.sortid);
     this.feeds[subscription.id].folders['root'] = 'root';
    }
    this.folders['all'].push(subscription.sortid);
  }
  
  return this.reloadUnreadCount();
}

/**
* reload unread count
*/
Listing.prototype.reloadUnreadCount = function(reload) {

  // request the unread count
  httpRequest.url = CONNECTION.READER_URL + CONNECTION.API_UNREADCOUNT;
  httpRequest.connect('', this.saveUnreadCount.bind(this, reload), this.getError.bind(this));
  return true;
}

/**
* save unread count
*/
Listing.prototype.saveUnreadCount = function(reload, responseText) {
  if (!this._saveUnreadCount(responseText)) {
    this.folders['root'] = this.folders['all'];
    this.finish();
    return false;
  }

  if (reload) {
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

  if (!json || !json.unreadcounts) {
    return false; 
  }
  
  if (json.max) {
    this.max = json.max;
  }

  for (var id in this.folders) {
    if (_typeOf(this.folders[id]) == "function") continue;
    this.folders[id].setUnread(0);
  }
  
  for (var id in this.feeds) {
    if (_typeOf(this.feeds[id]) == "function") continue;
    this.feeds[id].setUnread(0);
  }

  for (var i=0; i<json.unreadcounts.length; i++) {
    var unreadcount = json.unreadcounts[i];
    if (this.folders[unreadcount.id]) {
      this.folders[unreadcount.id].setUnread(unreadcount.count);
    }
    if (this.feeds[unreadcount.id]) {
      this.feeds[unreadcount.id].setUnread(unreadcount.count);
    }
    if (this.folders['friends']) {
      if (unreadcount.id.match(/user\/(.*?)\/broadcast-friends$/)) {
        this.folders['friends'].setUnread(unreadcount.count);
      }    
    }
    if (unreadcount.id.match(/user\/(.*?)\/reading-list$/)) {
      this.folders['root'].setUnread(unreadcount.count);
      this.folders['all'].setUnread(unreadcount.count);      
    }        
  }

  return true;
}

/**
* update unread count
*/
Listing.prototype.updateUnreadCount = function(item) {
  if (!item) return;
  item.link.innerText = item.title.fromEntities();
  item.link.bold = (item.unread > 0);
  if (!item.link.bold) {
    item.link.color = item.alwaysShowUnread() ? '#105caa' : '#5b7691';    
  }
 
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
    if (_typeOf(json.streamprefs[id]) == "function" ||
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
    if (_typeOf(ordering[id]) == "function" ||
        !ordering[id].length) continue;

    if (this.folders[id]) {  
      var saveItems = this.folders[id].items; 
      this.folders[id].reset();

      var len = ordering[id].length / 8;
      for (var i=0; i<len; i++) {
        var sortid = ordering[id].substring(i*8, i*8+8);

        var item = this.sortIDs[sortid];
        if (this.feeds[item.id]) {
          if (this.feeds[item.id].folders[id]) {
            this.folders[id].push(sortid);
          }
        } else {
          this.folders[id].push(sortid);      
        }
      }
      for (var i=0; i<saveItems.length; i++) {
        var sortid = saveItems[i];
        if (this.folders[id].items.indexOf(sortid) == -1) {
          this.folders[id].push(sortid);      
        }
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

  if (this.init) {
    this.init = false;
    listingContent.visible = true;
  }

  this.refresh();
  gadget.draw();
  
  if (this.scroll) {
    reader.scrollbar.scrollTo(this.scroll);
  }

  return true;
}

// instantiate object in the global scope
var listing = new Listing();
