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

// @fileoverview Functions for handling the login view and session of the gadget

function LoginSession() {
  
  login.onclick = this.login.bind(this);
  commandsSignout.onclick = this.logout.bind(this);  
  
  this.setup();
}

/**
 * Setup login field defaults
 */
LoginSession.prototype.setup = function() {
  this.token = '';  
  username.innerText = '';
  username.visible = false;  
  user.value = '';
  pass.value = '';
  remember.value = false;
};

/**
 * Auto login the user at startup
 */
LoginSession.prototype.autologin = function() {
  if (options.getValue('token') && options.getValue('username')) {
    this.token = options.getValue('token');    
    this.username = options.getValue('username');
    username.innerText = this.username.toLowerCase();
    username.visible = true;    
    reader.login();    
  }  
}

/**
 * Login the user from the login view
 */
LoginSession.prototype.login = function() {
  if (loading.visible) return;
    
  var userValue = (user.value.indexOf('@') == -1) ? user.value + '@' + CONNECTION.DEFAULT_DOMAIN : user.value;
  var passValue = pass.value;
  
  var domain = userValue.indexOf('@' + CONNECTION.DEFAULT_DOMAIN);
  this.username = domain == -1 ? userValue : userValue.substr(0, domain);

  var data = {  'Email': userValue, 
                'Passwd': passValue, 
                'service': CONNECTION.AUTH_SERVICE, 
                'source': REPORTED_CLIENT_NAME,
                'accountType': CONNECTION.AUTH_TYPE
              }.toQueryString();

  httpRequest.host = CONNECTION.AUTH_HOST;
  httpRequest.url = CONNECTION.AUTH_URL;  
  httpRequest.connect(data, this.loginSuccess.bind(this), this.loginError.bind(this));    
};

LoginSession.parseResponse = function(responseText) {
  var responseLines = responseText.split('\n');
  var responseData = {};
  for (var i = 0; i < responseLines.length; ++i) {
    var split = responseLines[i].indexOf('=');
    var key = responseLines[i].substr(0, split);
    var value = responseLines[i].substr(split + 1);
    responseData[key] = value;
  }

  return responseData;
};

/**
 * Save auth token
 */
LoginSession.prototype.loginSuccess = function(responseText) {
  var responseData = LoginSession.parseResponse(responseText);
  this.token = responseData['Auth'];

  if (this.token) {
    username.innerText = this.username.toLowerCase();
    username.visible = true;
    if (remember.value) {
      options.putValue('token', this.token);
      options.encryptValue('token');   
      options.putValue('username', this.username);
      options.encryptValue('username');               
    }
    reader.login();
  } else {
    this.loginError();
  }
};

/**
 * Display login error
 */
LoginSession.prototype.loginError = function(status, responseText) {
  if (status == 403) {
    var responseData = LoginSession.parseResponse(responseText);
    var error = responseData['Error'] || 'Unknown';
  }
  
  errorMessage.display(LOGIN_ERRORS[error] || ERROR_SERVER_OR_NETWORK);
};

/**
 * Log the user out
 */
LoginSession.prototype.logout = function() {
  this.setup();
  options.putValue('token', '');
  options.putValue('username', '');  
  reader.logout();
};

/**
 * This function is called onkeypress of the username editbox. accepts tab and
 * enter key.
 */
LoginSession.prototype.onUsernameKeyPress = function() {
  if (event.keycode == KEYS.ENTER) {
    if (pass.value === '') {
      pass.focus();
    } else {
      this.login();
    }
    event.returnValue = false;
  }
};

/**
 * This function is called onkeydown of the password editbox. accepts enter key.
 */
LoginSession.prototype.onPasswordKeyPress = function() {
  if (event.keycode == KEYS.ENTER) {
    if (user.value.length === 0) {
      user.focus(); // Put focus on user field.
    } else {
      this.login();
    }
    event.returnValue = false;
  }
};

/**
 * This function is called onkeydown of the remember checkbox.
 */
LoginSession.prototype.onRememberKeyPress = function() {
  if (event.keycode == KEYS.ENTER ||
      event.keycode == KEYS.SPACE) {
    remember.value = !remember.value;
    this.onRememberFocus(true);
  }
};

LoginSession.prototype.onLoginKeyPress = function() {
  if (event.keycode == KEYS.ENTER ||
      event.keycode == KEYS.SPACE) {
    // Put focus on user field if its empty.
    if (user.value.length === 0) {
      user.focus();
    } else {
      this.login();
    }
  }
};

/*
 * This function is called when the remember checkbox gets or looses focus
 */
LoginSession.prototype.onRememberFocus = function(got) {
  rememberFocus.visible = got;
};

/*
 * This function is called when the action combo gets or looses focus
 */
LoginSession.prototype.onLoginFocus = function(got) {
  login.image = got ? 'images/action_hover.png' : 'images/action_default.png';
};

// instantiate object in the global scope
var loginSession = new LoginSession();
