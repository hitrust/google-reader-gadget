// Copyright 2007 Google Inc.
// All Rights Reserved.

// @fileoverview Functions for server communications through XMLHttpRequest

function createXhr() {
  return framework.google.betaXmlHttpRequest();
}

var httpRequest = new HTTPRequest();

function HTTPRequest() {
  this.packet = new createXhr();
  this.handler = null;
  this.failedHandler = null;
  // Token for timeout timer.
  this.timeoutTimer = null;
  this.headers = {};
  this.loadingIndicator = false;
  this.overrideLoading = false;
  this.shouldShowLoading = true;
}

HTTPRequest.available = true;
HTTPRequest.queue = [];

/**
 * Add a new custom header
 */
HTTPRequest.prototype.addHeader = function(key, value) {
  var type = typeof value;
  if (type == 'boolean' || type == 'number' || type == 'string') {
    this.headers[key] = value.toString();
  }
};

/**
 * Remove custom header
 */
HTTPRequest.prototype.removeHeader = function(key) {
  try {
    if (this.headers[key]) delete this.headers[key];
  } catch(e) {}
};

/**
 * Function used to allow a time between httpRequests, so as not to clutter
 * the servers. This function is static since all requests in the gadget are
 * made to the same server and thus must handle all objects of the class type
 */
HTTPRequest.finishedGracePeriod = function() {
  HTTPRequest.available = true;
  if (HTTPRequest.queue.length > 0) {
    var request = HTTPRequest.queue.shift();
    request.requestObject.connect(request.data, request.handler, request.failedHandler, request.headers);
  }
};

/**
 * Sends out a request using XMLHttpRequest
 * @param {String} data The data to be packed
 */
HTTPRequest.prototype.connect = function (data, handler, failedHandler, headers, isFile) {
  headers = headers || {};
  this.isFile = isFile || false;

  if (!HTTPRequest.available) {
    // The server fails to handle too many requests at a time so we need to
    // queue them.
    HTTPRequest.queue.push({ requestObject: this, data: data, handler: handler, failedHandler: failedHandler, headers: headers });
    return;
  }
  try {
    this.showLoading();
  } catch(e) {
    // rare occurance, if the details view is just closing
    return;
  }

  if (this.isFile) {
    // NOT IMPLEMENTED.
    debug.error('HTTPRequest::connect file input source is not implemented.');
  }

  //debug.error(this.url);
  
  var now = new Date();
  var suffix = 'client='+REPORTED_CLIENT_NAME+'&ck='+now.getTime();
  if (this.url.indexOf('?') == -1) {
    this.url += '?'+suffix;
  } else if (this.url.indexOf('?') == this.url.length-1) {
    this.url += suffix;
  } else {
    this.url += '&'+suffix; 
  }

  this.handler = handler;
  this.failedHandler = failedHandler;
  this.packet.abort();
  this.packet.onreadystatechange = this.receivedData.bind(this);

  if (data) {
    this.packet.open('POST', this.url, true);
    if (!this.headers['Content-Type'] && !headers['Content-Type']) {
      this.packet.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');    
    }
  } else {
    this.packet.open('GET', this.url, true);    
  }

  this.packet.setRequestHeader('Cookie', 'none');

  // custom headers
  for (var key in this.headers) {
    if (typeof this.headers[key] == 'string') {
      this.packet.setRequestHeader(key, this.headers[key]);   
    }
  }
  for (var key in headers) {
    if (typeof headers[key] == 'string') {
      this.packet.setRequestHeader(key, headers[key]);      
    }
  }

  this.packet.setRequestHeader('Cache-Control', 'no-cache, no-transform');
  this.packet.setRequestHeader('Connection', 'close');
  this.packet.setRequestHeader('Host', this.host);  
  this.packet.send(data);

  this.clearTimeout();  
  this.timeoutTimer = view.setTimeout(this.onTimeout.bind(this), CONNECTION.TIMEOUT);

  HTTPRequest.available = false;
};

HTTPRequest.prototype.stop = function() {
  if (!this.packet) {
    return;
  }
  if (this.packet.readyState != 4) {
    this.packet.abort();  
  }  
  this.clearTimeout();  
  this.hideLoading();  
};

HTTPRequest.prototype.clearTimeout = function() {
  if (this.timeoutTimer) {
    view.clearTimeout(this.timeoutTimer);
    this.timeoutTimer = null;
  }
};

HTTPRequest.prototype.onTimeout = function() {
  if (this.isFile) return;
  
  debug.error('Request timed out.');
  this.packet.abort();  
  setTimeout(HTTPRequest.finishedGracePeriod, CONNECTION.TIME_BETWEEN_REQUESTS);
  this.hideLoading();
  this.onFailure();
};

HTTPRequest.prototype.showLoading = function() {
  try {
    this.loadingIndicator = this.loadingIndicator || loading;
    if (this.shouldShowLoading) {
      this.loadingIndicator.visible = true;
    }
  } catch(e) {
    debug.warning('Could not show loading image.');
  }  
};

HTTPRequest.prototype.hideLoading = function() {
  try {    
    this.overrideLoading = false;
    this.loadingIndicator.visible = false;
    this.loadingIndicator = false;
  } catch(e) {
    debug.warning('Could not hide loading image.');
  }  
};

HTTPRequest.prototype.onFailure = function() {
  if (this.failedHandler !== null) {
    try {
      var status = this.packet.readyState == 4 ? this.packet.status : 0;
      this.failedHandler(status, this.packet.responseText);
    } catch(e) {
      errorMessage.display(ERROR_SERVER_OR_NETWORK);    
    }
  } else {
    errorMessage.display(ERROR_SERVER_OR_NETWORK);
  }
};

HTTPRequest.prototype.receivedData = function() {
  if (!this.packet) {
    return;
  }
  if (this.packet.readyState != 4) {
    return;
  }
  if (!this.overrideLoading) {
    this.hideLoading();  
  }
  this.clearTimeout();  
  setTimeout(HTTPRequest.finishedGracePeriod, CONNECTION.TIME_BETWEEN_REQUESTS);
  if (this.packet.status < 200 || this.packet.status >= 300) {
    debug.error('A transfer error has occured! Error = '+this.packet.status);
    if (this.overrideLoading) {
      this.hideLoading();  
    }
    this.onFailure();
    return;
  }
  if (this.handler !== null) {
    this.handler(this.packet.responseText, this.packet.responseStream);
  }
};
