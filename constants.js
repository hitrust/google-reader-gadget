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

// @fileoverview Constants used throughout the plugin

var REPORTED_CLIENT_NAME = 'gd-reader-gadget-' + VERSION_STRING;

var CONNECTION = {
  TIME_BETWEEN_REQUESTS: 100, // 100 ms
  TIMEOUT: 15000, // 15 seconds
  REFRESH_INTERVAL: 60000, // 60 seconds

  DEFAULT_DOMAIN: 'gmail.com',
  AUTH_HOST: 'www.google.com',    
  AUTH_URL: 'https://www.google.com/accounts/ClientLogin',
  AUTH_SERVICE: 'reader',
  AUTH_TYPE: 'GOOGLE',  
  READER_HOST: 'www.google.com',  
  READER_URL: 'http://www.google.com/reader/api/0/',
  EMAIL_URL: 'http://www.google.com/reader/email-this',
  STREAM_PREFIX: 'stream/contents/',
  SEARCH_PREFIX: 'search/items/ids?output=json&q=',
  API_SUBSCRIPTIONS: 'subscription/list?output=json',
  API_UNREADCOUNT: 'unread-count?all=true&output=json',  
  API_SORTORDER: 'preference/stream/list?output=json',
  API_PREFERENCES: 'preference/list?output=json',
  API_FOLDERS: 'tag/list?output=json',
  API_USER_INFO: 'user-info?output=json',
  API_FRIEND_LIST: 'friend/list?output=json'
};

var UI = {
  MIN_WIDTH: 210,
  MIN_HEIGHT: 200,  
  MIN_DATE_WIDTH: 85,
  ERROR_MESSAGE_TIMEOUT: 3000
};

var LOGIN_ERRORS = {
  'BadAuthentication': ERROR_BAD_AUTH,
  'NotVerified': ERROR_NOT_VERIFIED,
  'TermsNotAgreed': ERROR_TERMS,
  'CaptchaRequired': ERROR_CAPTCHA,
  'Unknown': ERROR_UNKNOWN,
  'AccountDeleted': ERROR_ACCOUNT_DELETED,
  'AccountDisabled': ERROR_ACCOUNT_DISABLED,
  'ServiceDisabled': ERROR_SERVICE_DISABLED,
  'ServiceUnavailable': ERROR_SERVICE_UNAVAILABLE
};

var KEYS = {
  ENTER: 13, 
  ESCAPE: 27,
  SPACE: 32,
  UP: 38, 
  DOWN: 40, 
  PAGE_UP: 33, 
  PAGE_DOWN: 34,
  HOME: 36, 
  END: 35
};
