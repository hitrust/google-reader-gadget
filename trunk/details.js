/**
 * Constructor for Details class.
 */
function Details() {
  this.active = false;
  this.starred = false;
  this.shared = false;
  this.unread = false;
  this.tags = ["politics", "news", "cats", "environment"];
//  this.tags = [];

  this.scrollbar = new CustomScrollbar(this);
  this.content = body;
};


/**
 * Draw the details view when the view opens.
 */
Details.prototype.onOpen = function() {
  this.doStar(true);
  this.doShare(true);

  title.onclick = function() { framework.openUrl('http://google.com/'); }.bind(this)
  body.height = labelCalcHeight(body);

  this.draw();
}

/**
 * Draw the details view
 */
Details.prototype.draw = function() {
  var x = 0;
  
  var width = labelCalcWidth(subtitle);
  if (width > .85 * title.width) {
    width = subtitle.width = .85 * title.width;
  }
  date.x = subtitle.x + width;

  for (var i=0; i<toolbar.children.count; i++) {
    var div = toolbar.children.item(i);
    var icon = div.children.item('icon');
    var link = div.children.item('link');
    var active = div.children.item('active');

    div.x = x;
    div.width = link.x + labelCalcWidth(link);
        
    if (active) {
      div.width += 5;
      active.width = div.width;
      active.children.item(0).width = div.width - 2;
    }
    x += div.width;
    
    eval('icon.onclick = this.do'+div.name.ucwords()+'.bind(this);');
    eval('link.onclick = this.do'+div.name.ucwords()+'.bind(this);');
  }
  
  this.drawTag(x);
  this.drawText();
  this.drawEmail();
}

/**
 * Draw email form
 */
Details.prototype.drawEmail = function(x) {
  var fromWidth = labelCalcWidth(fromLabel);
  var toWidth = labelCalcWidth(toLabel);
  var subjectWidth = labelCalcWidth(subjectLabel);
  
  if (fromWidth >= toWidth && fromWidth >= subjectWidth) {
    fromLabel.width = fromWidth;
    toLabel.width = fromWidth;
    subjectLabel.width = fromWidth;
    fromArea.x = fromWidth + fromLabel.x + 5;
    toArea.x = fromWidth + toLabel.x + 5;
    subjectArea.x = fromWidth + subjectLabel.x + 5;    
  } else if (toWidth >= fromWidth && toWidth >= subjectWidth) {
    fromLabel.width = toWidth;
    toLabel.width = toWidth;
    subjectLabel.width = toWidth; 
    fromArea.x = toWidth + fromLabel.x + 5;
    toArea.x = toWidth + toLabel.x + 5;
    subjectArea.x = toWidth + subjectLabel.x + 5;    
  } else {
    fromLabel.width = subjectWidth;
    toLabel.width = subjectWidth;
    subjectLabel.width = subjectWidth;  
    fromArea.x = subjectWidth + fromLabel.x + 5;
    toArea.x = subjectWidth + toLabel.x + 5;
    subjectArea.x = subjectWidth + subjectLabel.x + 5;    
  }
  
  noteRight.x = labelCalcWidth(noteLeft) + 5;
}

/**
 * Draw text area
 */
Details.prototype.drawText = function(x) {
	if (this.content.height <= contentContainer.height) {		
  	contentArea.x = 11;
		contentArea.background = "#ffffff";
		inner.x = contentContainer.x = 0;
		inner.y = contentContainer.y = 0;
		inner.width = contentContainer.width = contentArea.width;
  	inner.height = contentContainer.height = contentArea.height;
  	
  	this.content.width = contentContainer.width;
		scrollbar.visible = false;		     
	} else {		
   	contentArea.x = 14;
		contentArea.background = "#bfbfbf";
		contentContainer.x = 1;
		contentContainer.y = 1;
		inner.x = 5;
		inner.y = 5;
		contentContainer.width = contentArea.width - 2;
		contentContainer.height = contentArea.height - 2;
		inner.width = contentContainer.width - 8;
		inner.height = contentContainer.height - 11;

		this.content.width = inner.width - (scrollbar.width + 14);			
		scrollbar.visible = true;
	}

	this.scrollbar.draw();
	scrollbar.x += 8;
}

/**
 * Draw the edit tag tab
 */
Details.prototype.drawTag = function(x) {

  var div = toolbar.children.item('tag');
  if (div) {
    var link = div.children.item('link');
    var text = div.children.item('text');

    link.innerText = 'Edit Tag';
    text.visible = false;
  
    if (!x) {
      x = div.x + link.x + labelCalcWidth(link);
    }
  
    if (text && this.tags.length) {
      text.innerText = this.tags[0];   
      if (toolbar.width > x + labelCalcWidth(text)) {
        link.innerText = 'Edit Tag:';
        text.x = link.x + labelCalcWidth(link) - 3;
        text.visible = true;    
        div.width += labelCalcWidth(text) - 3;
      }
    }       
  }
}

/**
 * Toggle active toolbar tab
 */
Details.prototype.toggle = function(tab) {
  var active = tab.children.item('active');
  var pane = window.children.item(tab.name+'Pane');
  
  if (this.active && this.active != tab.name) {
    var oldPane = window.children.item(this.active+'Pane');

    if (this.active == 'email' && !subtitle.visible) {
      subtitle.visible = true;
      date.visible = true;
      contentArea.y += 18;
      contentArea.height -= 18;
    }
    
    toolbar.children.item(this.active).children.item('active').visible = false;
    oldPane.visible = false
    this.active = false;
    
    contentArea.height += oldPane.height;
    contentContainer.height += oldPane.height;
  }

  if (active.visible) {
    active.visible = false;
    this.active = false;
    pane.visible = false;

    if (!subtitle.visible) {
      subtitle.visible = true;
      date.visible = true;
      contentArea.y += 18;
      contentArea.height -= 18;
    }

    contentArea.height += pane.height;
    contentContainer.height += pane.height;
    this.drawText();
  } else {
    active.visible = true;
    this.active = tab.name;  
    pane.visible = true;

    if (tab.name == 'email' && subtitle.visible) {
      subtitle.visible = false;
      date.visible = false;
      contentArea.y -= 18;
      contentArea.height += 18;
    }
    
    contentArea.height -= pane.height;
    contentContainer.height -= pane.height;    
    this.drawText();
  }

}

/**
 * Toolbar function: mark article with star
 */
Details.prototype.doStar = function(init) {
  var icon = star.children.item('icon');
  var link = star.children.item('link');

  if (init) {
    // don't toggle star on init
    this.starred = !this.starred;
  }

  if (this.starred) {
    this.starred = false;
    icon.src = 'images\\details-toolbar-star-off.png';
    link.innerText = 'Add star';  
  } else {
    this.starred = true;
    icon.src = 'images\\details-toolbar-star-on.png';
    link.innerText = 'Remove star';  
  }
  
  if (!init) {
    this.draw();
  }
}

/**
 * Toolbar function: share article
 */
Details.prototype.doShare = function(init) {
  var icon = share.children.item('icon');
  var link = share.children.item('link');

  if (init) {
    // don't toggle star on init
    this.shared = !this.shared;
  }

  if (this.shared) {
    this.shared = false;
    icon.src = 'images\\details-toolbar-share-off.png';
    link.innerText = 'Share';  
  } else {
    this.shared = true;
    icon.src = 'images\\details-toolbar-share-on.png';
    link.innerText = 'Unshare';  
  }
  
  if (!init) {
    this.draw();
  }
}

/**
 * Toolbar function: share article with note
 */
Details.prototype.doNote = function() {
  noteField.value = '';
  noteCheck.value = true;

  this.toggle(note);
  
  noteField.focus();
}

/**
 * Toolbar function: email article
 */
Details.prototype.doEmail = function() {
  toField.value = '';
  subjectField.value = '';
  emailField.value = '';
  emailCheck.value = true;

  var send = emailPane.children.item('pane').children.item('send');
  var cancel = emailPane.children.item('pane').children.item('cancel');
  
  cancel.onclick = this.emailCancel.bind(this);  
//  send.onclick = this.emailSend.bind(this);


  this.toggle(email);
  
  toField.focus();
}

/**
 * Toolbar function: mark article as unread
 */
Details.prototype.doUnread = function() {
  var icon = unread.children.item('icon');

  if (this.unread) {
    this.unread = false;
    icon.src = 'images\\details-toolbar-unread-off.png';
  } else {
    this.unread = true;
    icon.src = 'images\\details-toolbar-unread-on.png';
  }
  
  this.draw();
}

/**
 * Toolbar function: edit article tags
 */
Details.prototype.doTag = function() {
  var save = tagPane.children.item(0).children.item('save');
  var cancel = tagPane.children.item(0).children.item('cancel');
  
  cancel.onclick = this.tagCancel.bind(this);  
  save.onclick = this.tagSave.bind(this);
  tagEdit.onkeydown = this.tagKeydown.bind(this);

  tagEdit.value = this.tags.join(', ');
  
  tagPane.visible = true;  
  if (!this.tags.length) {
    tagEdit.focus();  
  }
}

/**
 * Save tags
 */
Details.prototype.tagSave = function() {
  var newTags = tagEdit.value.trim().split(/,\s*/);
  this.tags = [];
  
  for (var i=0; i<newTags.length; i++) {
    var t = newTags[i].trim();
    if (t && this.tags.indexOf(t) == -1) {
      this.tags.push(t);
    }
  }
  
  tagPane.visible = false; 
  this.drawTag();
}

/**
 * Cancel tags
 */
Details.prototype.tagCancel = function() {
  tagPane.visible = false; 
}

/**
 * Keyboard controls for tags
 */
Details.prototype.tagKeydown = function() {
  switch(event.keycode) {    

    case KEYS.ESCAPE:
      this.tagCancel();
      break;
      
    case KEYS.ENTER:
      this.tagSave();
      break;      
  }
}

/**
 * Cancel email
 */
Details.prototype.emailCancel = function() {
  this.toggle(email);
}


var detailsView = new Details();
