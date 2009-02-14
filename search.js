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
 * Close search field
 */
SearchField.prototype.close = function() {
//  var refresh = this.active;
//  this.active = false;
//  if (refresh) doclist.refresh();
  
  searchArea.visible = false;
  commandsSearch.visible = true;
  search.value = '';
  gadget.draw();
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
      doclist.search();
      break;      
  }
}

// instantiate object in the global scope
var searchField = new SearchField();
