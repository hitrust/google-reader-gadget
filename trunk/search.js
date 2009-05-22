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
 * Constructor for SearchField class.
 */
function SearchField() {
  commandsSearch.onclick = this.open.bind(this);  
  
  search.onfocusout = this.blur.bind(this);
  search.onkeydown = this.keydown.bind(this);
  
  searchClear.onclick = this.close.bind(this);
}

/**
 * Blur search field
 */
SearchField.prototype.blur = function() {
  if (!search.value.trim()) {
    this.close();
  }
}

/**
 * Open search field
 */
SearchField.prototype.open = function() {
  search.value = '';
  commandsSearch.visible = false;
  searchArea.visible = true;
  search.focus();
  gadget.draw();
}

/**
 * Reset search field
 */
SearchField.prototype.reset = function(arg) {
  searchArea.visible = false;
  commandsSearch.visible = true;
  search.value = '';
  gadget.draw();
}


/**
 * Close search field
 */
SearchField.prototype.close = function(arg) {
  if (reader.currentFeed) {
    reader.currentFeed.closeSearch(arg);
  }

  this.reset();
}

/**
 * Keyboard controls
 */
SearchField.prototype.keydown = function() {
  switch(event.keycode) {    

    case KEYS.ESCAPE:
      this.close();
      break;
      
    case KEYS.ENTER:
      if (reader.currentFeed) {        
        reader.currentFeed.search();
      }
      break;      
  }
}

// instantiate object in the global scope
var searchField = new SearchField();
