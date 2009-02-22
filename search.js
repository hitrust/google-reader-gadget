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
