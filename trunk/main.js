/**
 * Main
 *
 * Reader view
 *
 * Created by Steve Simitzis on 2008-3-21.
 * Copyright (c) 2008 Google. All rights reserved.
 */


/**
 * Constructor for Main class.
 */
function Main() {
  this.detailsView = new DetailsView();
};

/**
 * Called when there is feedback from the details view
 */
Main.prototype.onDetailsViewFeedback = function(detailsViewFlags) {
  if (detailsViewFlags == gddDetailsViewFlagNone) {
    if (reader.currentFeed) {

      if (reader.currentFeed.unread < 0) {
        reader.currentFeed.unread = 0;
      }
      if (reader.currentFeed.unread >= listing.max-1) {
        reader.currentFeed.unread = listing.max;
      }
      
      reader.currentFeed.saveScroll();
      reader.currentFeed.refresh();  
    
      if (feedContent.visible) {
        showLine.update();        
        reader.showFeed();

        if (reader.currentFeed.scroll) {
          reader.scrollbar.scrollTo(reader.currentFeed.scroll);
        } else {
          reader.scrollbar.scrollTop();
        }
          
      }
    }
  }
}

/**
 * Draw the gadget when the view opens.
 */
Main.prototype.onOpen = function() {
  view.onsize = this.resize.bind(this);   
  view.onsizing = this.sizing.bind(this);     
  loginSession.autologin();
  this.draw();  
}

/**
 * Override the user's sizing if we go under.
 */
Main.prototype.sizing = function() {
  if (event.width < UI.MIN_WIDTH) {
    event.width = UI.MIN_WIDTH;  
  }
  if (event.height < UI.MIN_HEIGHT) {
    event.height = UI.MIN_HEIGHT;
  }
}

/**
 * Draw the gadget.
 */
Main.prototype.resize = function() {
  if (listingContent.visible) {
    listing.saveScroll();
  }

  this.draw();
  
  if (listingContent.visible) {
    reader.scrollbar.scrollTo(listing.scroll);
  }
}


/**
 * Draw the gadget.
 */
Main.prototype.draw = function() {
    
  window.width = view.width - 2;
  window.height = view.height - 9;

  topRightMainBg.x = middleRightMainBg.x = bottomRightMainBg.x =
      window.width - topRightMainBg.width;
  topCenterMainBg.width = middleCenterMainBg.width = bottomCenterMainBg.width =
      topRightMainBg.x - topCenterMainBg.x;
  bottomRightMainBg.y = bottomCenterMainBg.y = bottomLeftMainBg.y =
      window.height - bottomLeftMainBg.height;

  middleLeftMainBg.height = middleCenterMainBg.height =
      middleRightMainBg.height = bottomRightMainBg.y - middleLeftMainBg.y;
  // Adjust the positions of a images to move to the top right corner
  var loadingWidth = labelCalcWidth(loadingLabel);
  loading.x = window.width - (loadingWidth + 12);  
  loading.width = loadingWidth; 
   
  var searchingWidth = labelCalcWidth(searchingLabel);  
  searching.x = window.width - (searchingWidth + 12);
  searching.width = searchingWidth;

  if (loginDiv.visible) {
    loginDiv.width = window.width - 24;
    loginDiv.height = window.height - 50;
    user.width = pass.width = loginDiv.width - user.x - user.x;
    login.x = loginDiv.width - login.width;
    login.y = loginDiv.height - (login.height + 10);    
  }
  
  if (mainDiv.visible) {
    
    mainDiv.width = window.width - 16; 
    mainDiv.height = window.height - 42;    

    titleStatus.width = mainDiv.width;    
    titleStatusContent.width = mainDiv.width - (titleStatusLeft.width + titleStatusRight.width);
    titleStatusRight.x = titleStatusContent.width + titleStatusContent.x;
    
    var searchOffset = searchArea.visible ? 5 + searchArea.height : 0;

    contentArea.width = mainDiv.width;
    contentArea.height = mainDiv.height - (titleStatus.height + 14) - 9 - searchOffset;

    contentContainer.width = contentArea.width - contentShadowRight.width;
    contentContainer.height = contentArea.height - contentShadowBottom.height;

    searchArea.y = contentArea.y + contentArea.height + 5;
    searchArea.width = contentContainer.width;
    searchContainer.width = searchArea.width - 2;
    search.width = searchContainer.width - 22;
    searchClear.x = search.width + 7;

    reader.draw();

    contentShadowBottom.width = contentContainer.width - contentShadowBottomLeft.width;
    contentShadowRight.height = contentContainer.height;
    contentShadowBottom.x = contentShadowBottomLeft.width;
    contentShadowRight.x = contentContainer.width;
    contentShadowBottom.y = contentContainer.height;
    contentShadowBottomLeft.y = contentContainer.height;
    contentShadowBottomRight.x = contentContainer.width;
    contentShadowBottomRight.y = contentContainer.height;

    markRead.x = titleStatusContent.width - labelCalcWidth(markRead) + 3;
    title.width = markRead.x - 5;
        
    showLine.draw();
    
    commands.y = contentArea.height + contentArea.y + 6 + searchOffset;
    commands.width = contentArea.width;

    commandsSearch.x = labelCalcWidth(commandsFeeds) + 10;
    commandsSignout.x = commands.width - (labelCalcWidth(commandsSignout) + 4);  
  }
}

// instantiate object in the global scope
var gadget = new Main();

