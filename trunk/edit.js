/**
 * Constructor for Edit api functions
 */
function EditAPI(item) {
  try {
    this.gadget = gadget;
  } catch (e) {}

  try {
    this.gadget = detailsViewData.getValue('gadget');
  } catch (e) {}

  this.token = this.gadget ? this.gadget.token : false;
  this.item = item;
  this.halt = false;
  this.command = false;
}

/**
 * API call
 */
EditAPI.prototype.call = function(fn) {
  if (this.halt) return;

  var __arguments = [];
  for (var n = 1; n < arguments.length; n++) {
    __arguments.push(arguments[n]);    
  }

  if (eval('this.edit'+fn)) {
    this.halt = true;
    eval('this.edit'+fn+'.apply(this, __arguments);');
    this._apiCall();
  }
}


// MESSAGE FUNCTIONS HERE

/**
 * Change message tags
 */
EditAPI.prototype.editSendEmail = function(to, subject, body, ccME) {

  this.url = CONNECTION.EMAIL_URL;
  this.command = false;
  this.token = false;
  
  this.data = { 'i': this.item.id,
               'emailTo': to,
               'comment': body,
               'subject': subject,
               'ccME': ccME
             };
}


/**
 * Change message tags
 */
EditAPI.prototype.editShareWithNote = function(annotation, share, tags) {

  var addTags = [];
  var newTags = tags.trim().split(/,\s*/);

  for (var i=0; i<newTags.length; i++) {
    addTags.push('user/-/label/'+newTags[i].replace('/','-'));
  }

  this.command = 'item/edit';

  this.data = { 'title': this.item.title,
               'snippet': this.item.body,
               'url': this.item.url,
               'srcUrl': this.item.srcUrl,
               'srcTitle': this.item.srcTitle,
               'snippet' : this.item.rawBody,
               'annotation' : annotation,
               'share' : share,
               'tags' : addTags,
               'linkify' : false
             };
}


/**
 * Change message tags
 */
EditAPI.prototype.editTags = function(tags) {

  var addTags = [];
  var delTags = [];
  
  for (var i=0; i<tags.length; i++) {
    if (this.item.tags.indexOf(tags[i]) == -1) {
      addTags.push('user/-/label/'+tags[i].replace('/','-'));
    }
  }

  for (var i=0; i<this.item.tags.length; i++) {
    if (tags.indexOf(this.item.tags[i]) == -1) {
      delTags.push('user/-/label/'+this.item.tags[i].replace('/','-'));
    }
  }

  this.command = 'edit-tag';
  
  this.data = { 'i': this.item.id,
               'a': addTags,
               'r': delTags,
               'ac': 'edit'
             };
}


/**
 * Star a message
 */
EditAPI.prototype.editShare = function() {

  this.command = 'edit-tag';
  
  this.data = { 'i': this.item.id, 
               'a': 'user/-/state/com.google/broadcast', 
               'ac': 'edit'
             };             
}

/**
 * Unstar a message
 */
EditAPI.prototype.editUnshare = function() {

  this.command = 'edit-tag';
  
  this.data = { 'i': this.item.id, 
               'r': 'user/-/state/com.google/broadcast', 
               'ac': 'edit'
             };
}

/**
 * Star a message
 */
EditAPI.prototype.editStar = function() {

  this.command = 'edit-tag';
  
  this.data = { 'i': this.item.id, 
               'a': 'user/-/state/com.google/starred', 
               'ac': 'edit'
             };
}

/**
 * Unstar a message
 */
EditAPI.prototype.editUnstar = function() {

  this.command = 'edit-tag';
  
  this.data = { 'i': this.item.id, 
               'r': 'user/-/state/com.google/starred', 
               'ac': 'edit'
             };
}

/**
 * Mark feed as read
 */
EditAPI.prototype.editMarkFeedRead = function() {

  this.command = 'mark-all-as-read';

  this.data = { 's': this.item.id, 
               't': this.item.title
             };
}

/**
 * Mark message as read
 */
EditAPI.prototype.editMarkRead = function() {

  this.command = 'edit-tag';

  this.data = { 'i': this.item.id, 
               'a': 'user/-/state/com.google/read', 
               'ac': 'edit'
             };
}

/**
 * Mark message as unread
 */
EditAPI.prototype.editMarkUnread = function() {

  this.command = 'edit-tag';

  this.data = { 'i': this.item.id, 
               'r': 'user/-/state/com.google/read', 
               'ac': 'edit'
             };
}


// GENERIC API MECHANICS

/**
 * Do the API call
 */
EditAPI.prototype._apiCall = function(secondTry) {

  if (!this.token) {
    this.getToken(secondTry);
    return;
  }
  this.data.T = this.token;

  var successCallback = secondTry ? this.getAPISuccess2.bind(this) : this.getAPISuccess.bind(this);
  var errorCallback = secondTry ? this.getAPIError2.bind(this) : this.getAPIError.bind(this);

  httpRequest.host = CONNECTION.READER_HOST;
  httpRequest.url = this.command ? CONNECTION.READER_URL + this.command : this.url
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.connect(this.data.toQueryString(), successCallback, errorCallback);
}

/**
 * Get token for edit api.
 */
EditAPI.prototype.getToken = function(secondTry) {
  var successCallback = secondTry ? this.getTokenSuccess2.bind(this) : this.getTokenSuccess.bind(this);

  httpRequest.host = CONNECTION.READER_HOST;
  httpRequest.url = CONNECTION.READER_URL + 'token';
  httpRequest.addHeader('Cookie', 'SID='+loginSession.token);
  httpRequest.connect('', successCallback, this.getError.bind(this));
}

EditAPI.prototype.getError = function() {
  this.halt = false;
  this.token = false;
  this.gadget.token = this.token;
  errorMessage.display(ERROR_SERVER_OR_NETWORK);  
}

EditAPI.prototype.getTokenSuccess = function(responseText) {
  if (responseText) {
    this.token = responseText;
    if (this.gadget) {
      this.gadget.token = this.token;
    }
    this._apiCall();
  } else {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);
    this.halt = false;
  }
}

EditAPI.prototype.getTokenSuccess2 = function(responseText) {
  if (responseText) {
    this.token = responseText;
    if (this.gadget) {
      this.gadget.token = this.token;
    }
    this._apiCall(true);
  } else {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);
    this.halt = false;
  }
}


/**
 * Check for API call success.
 */
EditAPI.prototype.getAPISuccess = function(responseText) {
  if (this.command && responseText != 'OK') {
    this.token = false;
    this._apiCall(true);
  }
  this.halt = false;
}

/**
 * Check for API call success, second try.
 */
EditAPI.prototype.getAPISuccess2 = function(responseText) {
  if (this.command && responseText != 'OK') {
    this.token = false;
    errorMessage.display(ERROR_SERVER_OR_NETWORK);
    this.halt = false;
  }
  this.halt = false;
}

EditAPI.prototype.getAPIError = function() {
  this.halt = false;
  this.token = false;
  this.gadget.token = this.token;
  this._apiCall(true);
}

EditAPI.prototype.getAPIError2 = function() {
  this.halt = false;
  this.token = false;
  this.gadget.token = this.token;
  errorMessage.display(ERROR_SERVER_OR_NETWORK);  
}
