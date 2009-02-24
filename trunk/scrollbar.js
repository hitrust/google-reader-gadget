/**
 * Constructor for CustomScrollbar class.
 */
function CustomScrollbar(container) {
  this.halt = {}; 
  this.container = container;
  this.saveY = false;
  this.callback = false;
  this.positionY = 0;

  scrollbarBar.onmousedown = this.startBar.bind(this);
  scrollbarBar.onmousemove = this.dragBar.bind(this);
  scrollbarBar.onmouseup = this.endBar.bind(this);
  scrollbarTrack.onclick = this.track.bind(this);
  
  scrollbarUp.onmousedown = this.startUp.bind(this);
  scrollbarDown.onmousedown = this.startDown.bind(this);
  scrollbarUp.onmouseup = this.endUp.bind(this);
  scrollbarDown.onmouseup = this.endDown.bind(this);
  
  view.onmousewheel = this.wheel.bind(this);
  window.onkeydown = this.keydown.bind(this);
  window.onkeyup = this.keyup.bind(this);  
}

/**
 * Set callback function for scollbar lazy load
 */
CustomScrollbar.prototype.setCallback = function(callback) {
  this.callback = callback;
}

/**
 * Callback function for scollbar
 */
CustomScrollbar.prototype.afterScroll = function() {    
  if (this.callback) this.callback();
}


/**
 * Callback function for scollbar
 */
CustomScrollbar.prototype.save = function(y) {  
  this.saveY = -this.container.content.y;
  this.shouldRestore = true;
}

/**
 * Keyboard controls on keydown
 */
CustomScrollbar.prototype.keydown = function() {    
  switch(event.keycode) {    

    case KEYS.UP:
      this.startUp();
      break;
      
    case KEYS.DOWN:
      this.startDown();
      break;
      
    case KEYS.PAGE_UP:
      this.scrollPageUp();
      break;
      
    case KEYS.PAGE_DOWN:
      this.scrollPageDown();
      break;
      
    case KEYS.HOME:
      this.scrollTop();    
      break;
      
    case KEYS.END:
      this.scrollBottom();
      break;
  }
}

/**
 * Shortcut functions
 */
CustomScrollbar.prototype.scrollTo = function(y) {  
  this.positionY = y;
  this.scroll();            
}

CustomScrollbar.prototype.position = function(y) {  
  return this.positionY;
}

CustomScrollbar.prototype.scrollBottom = function() {  
  this.positionY = this.max();
  this.scroll();            
}

CustomScrollbar.prototype.scrollTop = function() {    
  this.positionY = this.min();
  this.scroll();  
}

CustomScrollbar.prototype.scrollPageDown = function() {  
  this.moveBar(scrollbarBar.height);
}

CustomScrollbar.prototype.scrollPageUp = function() {    
  this.moveBar(-scrollbarBar.height);
}

/**
 * Keyboard controls on keyup
 */
CustomScrollbar.prototype.keyup = function() {    
  switch(event.keycode) {      

    case KEYS.UP:
      this.endUp();
      break;
      
    case KEYS.DOWN:
      this.endDown();
      break;
  }
}


/**
 * Mouse wheel
 */
CustomScrollbar.prototype.wheel = function() {    
  if (this.halt.wheel) return;
  this.halt.wheel = true;
    
  if (event.wheelDelta > 0) {
    this.startUp();
    
    var time = 100 * (Math.abs(event.wheelDelta) / 360);    
    setTimeout(function() {
      this.endUp();
      this.halt.wheel = false;
    }.bind(this), time);
  } else if (event.wheelDelta < 0) {
    this.startDown();
    
    var time = 100 * (Math.abs(event.wheelDelta) / 360);          
    setTimeout(function() {
      this.endDown();
      this.halt.wheel = false;      
    }.bind(this), time);    
  }
}

/**
 * Scroll button up
 */
CustomScrollbar.prototype.startUp = function() {    
  var time = (scrollbarBar.height && scrollbarTrack.height) ? 100 / (scrollbarBar.height / scrollbarTrack.height) : 100;
  
  this.up = view.beginAnimation(function() {
    this.positionY = event.value;
    this.scroll();
  }.bind(this), this.positionY, this.min(), time * this.ratio());
}

/**
 * Scroll button down
 */
CustomScrollbar.prototype.startDown = function() {  
  var time = (scrollbarBar.height && scrollbarTrack.height) ? 100 / (scrollbarBar.height / scrollbarTrack.height) : 100;
  
  this.down = view.beginAnimation(function() {
    this.positionY = event.value;
    this.scroll();    
  }.bind(this), this.positionY, this.max(), time * (1 - this.ratio()));
}

/**
 * End scroll button up
 */
CustomScrollbar.prototype.endUp = function() {    
  view.cancelAnimation(this.up);
}

/**
 * End scroll button down
 */
CustomScrollbar.prototype.endDown = function() {    
  view.cancelAnimation(this.down);
}

/**
 * Start scrollbar move
 */
CustomScrollbar.prototype.startBar = function() {   
  this.halt.drag = true;
  this.start = event.y;
}

/**
 * End scrollbar move
 */
CustomScrollbar.prototype.endBar = function() {   
  this.halt.drag = false;
}

/**
 * Compute min value of y
 */
CustomScrollbar.prototype.min = function() {    
  return scrollbarUp.height;
}

/**
 * Compute max value of y
 */
CustomScrollbar.prototype.max = function() {    
  return (scrollbarTrack.height - (scrollbarBar.height - scrollbarUp.height + 1));
}

/**
 * Compute scroll ratio
 */
CustomScrollbar.prototype.ratio = function() {    
  if (this.max() == this.min()) return 0;
  return (this.positionY - this.min()) / (this.max() - this.min());
}

/**
 * Reposition scrollbar based on content area
 */
CustomScrollbar.prototype.reposition = function() { 
  this.positionY = - this.container.content.y / (this.container.content.height - contentContainer.height) * (this.max() - this.min()) + this.min();
  this.scroll();
}

/**
 * Scroll content area
 */
CustomScrollbar.prototype.scroll = function(shouldRestore) { 
  var maxY = this.container.content.height - contentContainer.height;
  if (maxY < 0) maxY = 0;

  var newY = maxY * this.ratio(); 
  var prevY = this.container.content.y;
  
  if (shouldRestore && this.saveY) {
    this.container.content.y = -this.saveY;
    return;
  }
  
  if (newY) {
    this.saveY = newY;
  }
  
  if (newY > maxY) this.container.content.y = -maxY;
  else this.container.content.y = -newY;

  if (prevY > this.container.content.y) {
    this.timer = view.setTimeout(this.afterScroll.bind(this), 300);
  } else {
    if (this.timer) {
      view.clearTimeout(this.timer);
      this.timer = null;
    }
  }
  
  scrollbarBar.y = this.positionY;
}

/**
 * Handle clicked track
 */
CustomScrollbar.prototype.track = function() {      
  var min = this.min();
  var max = this.max();

  if (event.y < min)
    this.positionY = min;
  else if (event.y > max)
    this.positionY = max;
  else
    this.positionY = event.y;
    
  this.scroll();        
}

/**
 * Move scrollbar
 */
CustomScrollbar.prototype.moveBar = function(moveY) {    
  var y = moveY;

  var min = this.min();
  var max = this.max();

  if (y < 0) {
    if (this.positionY > min)
        this.positionY = (this.positionY + y > min) ? this.positionY + y : min;
  }
  else if (y > 0) {
    if (this.positionY < max)   
        this.positionY = (this.positionY + y > max) ? max : this.positionY + y;
  }

  this.scroll();    
}

/**
 * Drag scrollbar
 */
CustomScrollbar.prototype.dragBar = function() {    
  if (!this.halt.drag) return;  
  this.halt.drag = false;
  
  this.moveBar(event.y - this.start);

  view.setTimeout(function() { this.halt.drag = true; }.bind(this), 25);  
}

/**
 * Draw scrollbar
 */
CustomScrollbar.prototype.draw = function() {
  
  var scrollRatio = scrollbarTrack.height ? ((this.positionY - scrollbarUp.height) / (scrollbarTrack.height)) : 0;    

  scrollbar.x = this.container.content.width + 9;
  scrollbar.height = contentContainer.height - 5;

  scrollbarDown.y = scrollbar.height - scrollbarDown.height;          
  scrollbarTrack.height = scrollbar.height - (scrollbarDown.height + scrollbarUp.height);
  
  if (this.container.content.height == 0) {
    scrollbarBar.height = scrollbarTrack.height - 1;
  } else {
    var newHeight = Math.ceil(scrollbarTrack.height * (contentContainer.height / this.container.content.height));
    if (newHeight < 10) newHeight = 10;
    scrollbarBar.height = newHeight >= scrollbarTrack.height ? scrollbarTrack.height - 1 : newHeight;    
  }
  
  var newY = scrollRatio * scrollbarTrack.height + scrollbarUp.height;
  
  if (newY < this.min())
    this.positionY = this.min();
  else if (newY > this.max())
    this.positionY = this.max();
  else
    this.positionY = newY;  
    
  this.scroll(true);        
}
