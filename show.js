/**
 * Constructor for ShowLine class.
 */
function ShowLine() {
  showNewItems.onclick = this.show.bind(this, 'new');
  showAllItems.onclick = this.show.bind(this, 'all');
}

/**
 * Draw show line
 */
ShowLine.prototype.draw = function() {
  if (showNewItems.enabled) {
    showNewItems.color = '#0252a5';
    showNewItems.overColor = '#0252a5';
    showNewItems.underline = true;
    showNewItems.onmouseover = function() { showNewItems.overColor = '#0000ff'; }
    
    showAllItems.color = '#282828';
    showAllItems.overColor = '#282828';
    showAllItems.underline = false;
    showAllItems.enabled = false;  
  } else {
    showAllItems.color = '#0252a5';
    showAllItems.overColor = '#0252a5';
    showAllItems.underline = true;
    showAllItems.onmouseover = function() { showAllItems.overColor = '#0000ff'; }

    showNewItems.color = '#282828';
    showNewItems.overColor = '#282828';
    showNewItems.underline = false;  
    showNewItems.enabled = false;   
  }
}

/**
 * Toggle what to show
 */
ShowLine.prototype.show = function(what) {
  switch(what) {
    case 'new':
      showNewItems.enabled = false;
      showAllItems.enabled = true;
      break;
      
    case 'all':
      showAllItems.enabled = false;
      showNewItems.enabled = true;
      break;    
  }
  
  if (reader.currentFeed) {
    reader.currentFeed.show = what;
    reader.currentFeed.refresh();
    reader.draw();  
  }
  this.draw();
}

// instantiate object in the global scope
var showLine = new ShowLine();
