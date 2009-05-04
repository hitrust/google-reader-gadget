/**
 * Constructor for Details class.
 */
function Details() {
  this.active = false;
  this.article = false;
  
  this.tags = [];

  this.scrollbar = new CustomScrollbar(this);
  this.content = body;
};


/**
 * Draw the details view when the view opens.
 */
Details.prototype.onOpen = function() {
  loginSession = detailsViewData.getValue('loginSession');
  this.article = detailsViewData.getValue('article');
  this.listing = detailsViewData.getValue('listing');
  this.feed = detailsViewData.getValue('feed');

  this.editAPI = new EditAPI(this.article);

  this.article.keep = false;
  
  if (!this.article.read) {
    this.article.read = true;  
    this.editAPI.call('MarkRead');
    if (!this.feed.isAlwaysShowUnread) {
      this.feed.unread--;
    }
  }

  if (!this.article.fresh) {
    keep.visible = false;
  } else {
    this.doKeep(true);  
  }

  this.doStar(true);
  this.doShare(true);

  title.innerText = this.article.title;
  body.innerText = this.article.body;
  subtitle.innerText = this.article.subtitle+' ';
  date.innerText = new Date(this.article.updated*1000).ago()+' '+STRINGS.AGO;
  this.tags = this.article.tags || [];
  
  title.onclick = function() { framework.openUrl(this.article.url); }.bind(this)
  body.height = labelCalcHeight(body);

  if (this.listing.friends) {
    fromArea.innerText = this.listing.displayName+' <'+this.listing.emailAddress+'>';
  } else {
    fromArea.innerText = options.getValue('username');
  }

  this.draw();
  
  errorMessage.setup(contentArea);
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
    if (!div.visible) continue;
    
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
    
    icon.onclick = this['do'+div.name.ucwords()].bind(this);
    link.onclick = this['do'+div.name.ucwords()].bind(this);
  }
  
  this.drawTag(x);
  this.drawText();
  this.drawEmail();
  this.drawNote();
}

/**
 * Draw note form
 */
Details.prototype.drawNote = function(x) {
  addTagsArea.visible = false;
  addTagsLabel.visible = false;
  
  addTags.x = noteCheck.x + checkboxCalcWidth(noteCheck) + 23;
  addTags.innerText = STRINGS.ADD_TAGS;
  addTags.color = '#0252a5';
  addTags.underline = true;
  addTags.enabled = true;
  addTags.overColor = '#0252a5';
  addTags.onmouseover = function() { addTags.overColor = '#0000ff'; }

  addTagsArea.x = addTags.x + labelCalcWidth(addTags) + 3;
  addTagsLabel.x = addTags.x + labelCalcWidth(addTags) + 3;
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

    if (this.tags.length) {
      link.innerText = (this.tags.length > 1) ? STRINGS.EDIT_TAGS : STRINGS.EDIT_TAG;
    }
    text.visible = false;
  
    if (!x) {
      x = div.x + link.x + labelCalcWidth(link);
    }
  
    if (text && this.tags.length) {
      // for some reason Array.slice() is buggy
      // var tags = this.tags.slice();      
      var tags = [];
      for (var i=0; i<this.tags.length; i++) {
        tags.push(this.tags[i]);
      }
      var len = tags.length;
      var width = div.width;      
      
      for (var i=0; i<len; i++) {
        text.innerText = tags.join(', ');   
        if (toolbar.width > x + labelCalcWidth(text)) {
          link.innerText = link.innerText+':';
          text.x = link.x + labelCalcWidth(link) - 3;
          text.visible = true;    
          div.width = width + labelCalcWidth(text);
          break;
        } else {
          tags.pop();
        }
      }
    }
    if (!this.tags.length) {
      link.innerText = STRINGS.ADD_TAG;    
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
    this.article.starred = !this.article.starred;
  }

  if (this.article.starred) {
    this.article.starred = false;
    icon.src = 'images\\details-toolbar-star-off.png';
    link.innerText = STRINGS.ADD_STAR;
    this.editAPI.call('Unstar');  
  } else {
    this.article.starred = true;
    icon.src = 'images\\details-toolbar-star-on.png';
    link.innerText = STRINGS.REMOVE_STAR;  
    this.editAPI.call('Star');      
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
    this.article.shared = !this.article.shared;
  }

  if (this.article.shared) {
    this.article.shared = false;
    icon.src = 'images\\details-toolbar-share-off.png';
    link.innerText = STRINGS.SHARE;  
    this.editAPI.call('Unshare');  
  } else {
    this.article.shared = true;
    icon.src = 'images\\details-toolbar-share-on.png';
    link.innerText = STRINGS.UNSHARE;
    this.editAPI.call('Share');    
  }
  
  if (!init) {
    this.draw();
  }
}

/**
 * Toolbar function: share article with note
 */
Details.prototype.showNoteTags = function() {
  addTags.innerText = STRINGS.ADD_TAGS+':';
  addTags.color = '#000000';
  addTags.overColor = '#000000';
  addTags.underline = false;
  addTags.enabled = false;
  addTagsArea.visible = true;
  addTagsLabel.visible = true;
}

/**
 * Toolbar function: share article with note
 */
Details.prototype.doNote = function() {
  noteField.value = '';
  noteTagEdit.value = '';
  noteCheck.value = true;
  
  var post = notePane.children.item('pane').children.item('post');
  post.onclick = this.notePost.bind(this);

  addTags.onclick = this.showNoteTags.bind(this);

  this.toggle(note);
  this.drawNote();
  
  noteField.focus();
}

/**
 * Toolbar function: email article
 */
Details.prototype.doEmail = function() {
  toField.value = '';
  subjectField.value = this.article.title;
  emailField.value = '';
  emailCheck.value = true;

  var send = emailPane.children.item('pane').children.item('send');
  var cancel = emailPane.children.item('pane').children.item('cancel');
  
  cancel.onclick = this.emailCancel.bind(this);  
  send.onclick = this.emailSend.bind(this);


  this.toggle(email);
  
  toField.focus();
}

/**
 * Toolbar function: keep article marked to keep
 */
Details.prototype.doKeep = function(init) {
  var icon = keep.children.item('icon');

  if (init) {
    // don't toggle star on init
    this.article.keep = !this.article.keep;
    this.article.read = !this.article.read;    
  }

  if (this.article.keep) {
    this.article.keep = false;
    this.article.read = true;    
    icon.src = 'images\\details-toolbar-keep-off.png';
    this.editAPI.call('MarkRead');
    if (!init && !this.feed.isAlwaysShowUnread) {
      this.feed.unread--;
    }
  } else {
    this.article.keep = true;
    this.article.read = false;        
    icon.src = 'images\\details-toolbar-keep-on.png';
    this.editAPI.call('MarkUnread');
    if (!init && !this.feed.isAlwaysShowUnread) {
      this.feed.unread++;
    }
  }

  if (init) {
    this.draw();
  }
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
  this.editAPI.call('Tags', this.tags);
  this.article.tags = this.tags;

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

/**
 * Send email
 */
Details.prototype.emailSend = function() {
  this.editAPI.call('SendEmail', toField.value, subjectField.value, emailField.value, emailCheck.value);
  this.toggle(email);
  errorMessage.display(ALERT_EMAIL_SENT);  
}

/**
 * Post share with note
 */
Details.prototype.notePost = function() {
  this.editAPI.call('ShareWithNote', noteField.value, noteCheck.value, noteTagEdit.value);
  this.toggle(note);
  errorMessage.display(noteCheck.value ? ALERT_NOTE_ADDED_AND_SHARED : ALERT_NOTE_ADDED);
}

var loginSession;
var detailsView = new Details();
