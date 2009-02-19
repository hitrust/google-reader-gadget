// Copyright 2008 Google Inc.
// All Rights Reserved.

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
  AUTH_TYPE: 'HOSTED_OR_GOOGLE',  
  READER_HOST: 'www.google.com',  
  READER_URL: 'http://www.google.com/reader/api/0/',
  EMAIL_URL: 'http://www.google.com/reader/email-this',
  STREAM_PREFIX: 'stream/contents/',
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

var FILE_TYPES = {
  'doc': 'document',
  'dot': 'document',
  'pdf': 'document',
  'xls': 'spreadsheet',
  'xlb': 'spreadsheet',
  'xlt': 'spreadsheet',
  'csv': 'document',
  'wks': 'spreadsheet',
  '123': 'spreadsheet',
  'ppt': 'presentation',
  'pps': 'presentation',
  'prc': 'presentation',  
  'htm': 'document',
  'html': 'document',
  'rtf': 'document'
};

var MIME_TYPES = {
  'doc': 'application/msword',
  'dot': 'application/msword',
  'pdf': 'application/pdf',
  'xls': 'application/vnd.ms-excel',
  'xlb': 'application/vnd.ms-excel',
  'xlt': 'application/vnd.ms-excel',
  'csv': 'text/csv',
  'wks': 'application/vnd.ms-excel',
  '123': 'application/vnd.ms-excel',
  'ppt': 'application/vnd.ms-powerpoint',
  'pps': 'application/vnd.ms-powerpoint',
  'prc': 'application/vnd.ms-powerpoint',
  'htm': 'text/html',
  'html': 'text/html',
  'rtf': 'text/rtf'
};

var NEW_DOC = {
  'newDocumentDocument': 'http://docs.google.com/MiscCommands?command=newdoc&redirectToDocument=true&hl=en',
  'newDocumentSpreadsheet': 'http://spreadsheets.google.com/ccc?new&hl=en',
  'newDocumentPresentation': 'http://docs.google.com/DocAction?action=new_presentation&source=doclist&hl=en',
  'newDocumentForm': 'http://spreadsheets.google.com/newform?hl=en'
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
