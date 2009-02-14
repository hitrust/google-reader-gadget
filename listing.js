/**
 * Constructor for Listing class.
 */
function Listing() {
}

/**
* Toggle folder open/close
*/
Listing.prototype.folder = function(div) {	
  var divcontents = div.children.item('contents');
  var imgtoggle = div.children.item('header').children.item('toggle');;
  var imgicon = div.children.item('header').children.item('icon');;
  
  if (divcontents.visible) {
    imgtoggle.src = 'images\\folder-plus.png';
    imgicon.src = 'images\\folder-closed.png';
    divcontents.visible = false;
  } else {
    imgtoggle.src = 'images\\folder-minus.png';
    imgicon.src = 'images\\folder-open.png';
    divcontents.visible = true;  
  }
  reader.draw();
}

/**
* Draw listing content
*/
Listing.prototype.draw = function() {	
	// width and horizontal position

  starredItemsIcon.x = labelCalcWidth(starredItems) + 2;

	for (var i=0; i<listingContent.children.count; i++) {
		var div = listingContent.children.item(i);
		div.width = contentContainer.width - (scrollbar.visible ? 0 : 8);			
	}	

  // friends
	
  if (friends.height) {
    reader.content.height -= friends.height;
    feeds.y -= friends.height;
  }
  	
	var y = 0;
	for (var i=0; i<friends.children.count; i++) {
    var div = friends.children.item(i);		
		div.width = contentContainer.width - friends.x;
		div.y = y;
    if (div.height) {
  		y += div.height;
    }
	}

  friends.height = y;
  reader.content.height += friends.height;

  // feeds

  if (feeds.height) {
    reader.content.height -= feeds.height;
  }

	var y = 0;
	for (var i=0; i<feeds.children.count; i++) {
    var div = feeds.children.item(i);	
 		div.width = contentContainer.width - (div.x || 0)
 		div.y = y;

    if (div.name == 'feed')	{
      if (div.height) {
    		y += div.height;
      }
      
    } else if (div.name == 'folder') {
      var divheader = div.children.item('header');	    
      var divcontents = div.children.item('contents');	
     	var yy = 0;

     	divheader.width = div.width;     	
     	divcontents.width = div.width;
     	
     	divheader.children.item('toggle').onclick = this.folder.bind(this, div);
     	
     	if (divcontents.visible) {
       	for (var j=0; j<divcontents.children.count; j++) {
          var divfeed = divcontents.children.item(j);		
      		divfeed.width = divcontents.width;
      		divfeed.y = yy;
          if (divfeed.height) {
        		yy += divfeed.height;
          }     	  
        }
      }
      
      divcontents.height = yy;      
      div.height = divheader.height + divcontents.height;
   		y += div.height;
    }
    
	}

  feeds.height = y;
  reader.content.height += feeds.height;
  feeds.y += friends.height;

	/*
	for (var i=0; i<listingContent.children.count; i++) {
    var div = listingContent.children.item(i);		
  	for (var j=0; j<div.children.count; j++) {    
      if (div.children.item(j).tagName == 'label') {
        div.children.item(j).width = div.width - 2.5*(div.children.item(j).x);
      }
    }
  }*/
}

// instantiate object in the global scope
var listing = new Listing();
