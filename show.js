/**
 * Constructor for ShowLine class.
 */
function ShowLine() {
  showNewItems.onclick = this.show.bind(this, 'new', true);
  showAllItems.onclick = this.show.bind(this, 'all', true);
}

/**
 * Draw show line
 */
ShowLine.prototype.draw = function() {
  showItems.width = titleStatusContent.width - (14 + reload.width);    
  showSearchItems.width = titleStatusContent.width - (14 + reload.width);    

  reload.x = showItems.width + 7;

  showNewItems.x = labelCalcWidth(showLabel) - 2;
  showItemsDivider.x = labelCalcWidth(showNewItems) + showNewItems.x;
  showAllItems.x = showItemsDivider.x + showItemsDivider.width + 3;

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
 * Update unread count
 */
ShowLine.prototype.update = function() {
  var number = reader.currentFeed.unread >= listing.max ? listing.max+'+' : reader.currentFeed.unread;
  showNewItems.innerText = number+' '+(reader.currentFeed.unread == 1 ? STRINGS.NEW_ITEM : STRINGS.NEW_ITEMS);
}

/**
 * Toggle what to show
 */
ShowLine.prototype.show = function(what, forceReload) {
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

  if (feedContent.visible && reader.currentFeed) {
    reader.currentFeed.show = what;
    if (forceReload) {
      reader.currentFeed.reload();
    } else {
      reader.currentFeed.refresh();
    }
    reader.scrollbar.saveY = false;
    reader.draw();  
  } else if (listingContent.visible) {
    listing.show = what;
    listing.refresh();
    reader.scrollbar.saveY = false;
    reader.draw();  
  }

  this.draw();
}

// instantiate object in the global scope
var showLine = new ShowLine();
