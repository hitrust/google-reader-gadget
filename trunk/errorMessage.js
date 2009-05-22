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

// @fileoverview Functions for adding and handling an error message UI to a view


function ErrorMessage(topElement) {
  this.removeTimer = null;

  this.setup(topElement);
}

ErrorMessage.prototype.setup = function(topElement) {
  this.topElement = topElement || view;

  if (this.messageAndErrorDiv) {
    view.removeElement(this.messageAndErrorDiv);
  }

  this.messageAndErrorDiv = this.topElement.appendElement(
      '<div name="messageAndErrorDiv" x="10" height="44" enabled="true" />');
  try {
    this.messageAndErrorDiv.onfocusout = this.remove.bind(this);
  } catch(e) {}
  this.messageAndErrorDiv.appendElement('<div name="messageAndErrorLeft" ' +
      'x="0" y="0" width="7" height="44" background="images/error_left.png" />');
  this.messageAndErrorCenter = this.messageAndErrorDiv.appendElement(
      '<div name="messageAndErrorCenter" x="7" y="0" height="44" background="images/error_center.png" />');
  this.messageAndErrorRight = this.messageAndErrorDiv.appendElement(
      '<div name="messageAndErrorRight" y="0" width="7" height="44" ' +
      'background="images/error_right.png" />');
  this.messageAndErrorLabel = this.messageAndErrorCenter.appendElement(
      '<label name="messageAndErrorLabel" ' +
      'x="0" y="0" width="100%" height="100%" align="center" valign="middle" ' +
      'font="helvetica" bold="true" size="7" trimming="character-ellipsis" ' +
      'wordWrap="true" />');
}

ErrorMessage.prototype.display = function(message) {
  try {
    this.messageAndErrorDiv.y =
        (this.topElement.height - this.messageAndErrorDiv.height) / 2;
    this.messageAndErrorDiv.width =
        this.topElement.width - 2 * this.messageAndErrorDiv.x - 4;
    this.messageAndErrorRight.x = this.messageAndErrorDiv.width -
        this.messageAndErrorRight.width;
    this.messageAndErrorCenter.width = this.messageAndErrorRight.x -
        this.messageAndErrorCenter.x;

    this.messageAndErrorLabel.innerText = message;
    this.messageAndErrorDiv.visible = true;

    if (this.removeTimer) {
      view.clearTimeout(this.removeTimer);
    }
    this.removeTimer = view.setTimeout(this.remove.bind(this), UI.ERROR_MESSAGE_TIMEOUT);

    this.messageAndErrorDiv.focus();
  } catch(e) {}
};



ErrorMessage.prototype.remove = function() {
  try {
    this.messageAndErrorDiv.visible = false;
  } catch(e) {}
};

var errorMessage = new ErrorMessage();
