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

OnlineChecker.PING_URL = 'http://clients2.google.com';
OnlineChecker.CHECK_INTERVAL_MS = 10 * 60 * 1000;
OnlineChecker.PING_TIMEOUT_MS = 30 * 1000;
OnlineChecker.USE_FRAMEWORK_API = true;

function OnlineChecker() {
  // Assume online at first.
  this.isPingSucceeded = true;
  this.timeoutTimer = null;
  this.pingTimer = null;
  this.ping();
}

OnlineChecker.prototype.isOnline = function() {
  if (OnlineChecker.USE_FRAMEWORK_API) {
    if (framework.system.network.online) {
      this.isPingSucceeded = true;

      return true;
    }
  }

  return this.isPingSucceeded;
};

OnlineChecker.prototype.ping = function() {
  var interval = OnlineChecker.CHECK_INTERVAL_MS;
  var fuzz = interval / 5;
  fuzz *= Math.random();
  fuzz = Math.floor(fuzz);
  interval += fuzz;
  this.pingTimer = view.setTimeout(this.makePing(), interval);

  if (OnlineChecker.USE_FRAMEWORK_API) {
    if (framework.system.network.online) {
      this.isPingSucceeded = true;

      return;
    }
  }

  var request = new XMLHttpRequest();
  request.open('GET', OnlineChecker.PING_URL, true);
  this.timeoutTimer = view.setTimeout(
      this.makeOnTimeout(),
      OnlineChecker.PING_TIMEOUT_MS);
  request.onreadystatechange = this.makeOnReadyStateChange(request);

  debug.info('Sending ping.');
  request.send();
};

OnlineChecker.prototype.onTimeout = function() {
  debug.info('Ping timed out.');
  this.isPingSucceeded = false;
};

OnlineChecker.prototype.onReadyStateChange = function(request) {
  if (request.readyState != 4) {
    return;
  }

  if (request.status == 200) {
    if (this.timeoutTimer) {
      debug.info('Clearing ping timer.');
      view.clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }

    debug.info('Ping succeeded.');
    this.isPingSucceeded = true;
  }
};

OnlineChecker.prototype.makeOnTimeout = function() {
  var me = this;

  return function() {
    me.onTimeout();
  };
};

OnlineChecker.prototype.makePing = function() {
  var me = this;

  return function() {
    me.ping();
  };
};

OnlineChecker.prototype.makeOnReadyStateChange = function(request) {
  var me = this;

  return function() {
    me.onReadyStateChange(request);
  };
};
