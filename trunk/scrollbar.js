/**
 * Constructor for CustomScrollbar class.
 */
function CustomScrollbar(container) {
  this.halt = {}; 
  this.container = container;
  this.saveY = false;

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
  scrollbarBar.y = y;
  this.scroll();            
}

CustomScrollbar.prototype.position = function(y) {  
  return scrollbarBar.y;
}

CustomScrollbar.prototype.scrollBottom = function() {  
  scrollbarBar.y = this.max();
  this.scroll();            
}

CustomScrollbar.prototype.scrollTop = function() {    
  scrollbarBar.y = this.min();
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
    scrollbarBar.y = event.value;
    this.scroll();
  }.bind(this), scrollbarBar.y, this.min(), time * this.ratio());
}

/**
 * Scroll button down
 */
CustomScrollbar.prototype.startDown = function() {  
  var time = (scrollbarBar.height && scrollbarTrack.height) ? 100 / (scrollbarBar.height / scrollbarTrack.height) : 100;
  
  this.down = view.beginAnimation(function() {
    scrollbarBar.y = event.value;
    this.scroll();    
  }.bind(this), scrollbarBar.y, this.max(), time * (1 - this.ratio()));
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
  return (scrollbarBar.y - this.min()) / (this.max() - this.min());
}

/**
 * Scroll content area
 */
CustomScrollbar.prototype.scroll = function(shouldRestore) { 
  var maxY = this.container.content.height - contentContainer.height;
  if (maxY < 0) maxY = 0;

  var newY = maxY * this.ratio(); 
  
  if (shouldRestore && this.saveY) {
    this.container.content.y = -this.saveY;
    return;
  }
  
  if (newY) {
    this.saveY = newY;
  }
  
  if (newY > maxY) this.container.content.y = -maxY;
  else this.container.content.y = -newY;
}

/**
 * Handle clicked track
 */
CustomScrollbar.prototype.track = function() {      
  var min = this.min();
  var max = this.max();

  if (event.y < min)
    scrollbarBar.y = min;
  else if (event.y > max)
    scrollbarBar.y = max;
  else
    scrollbarBar.y = event.y;
    
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
    if (scrollbarBar.y > min)
        scrollbarBar.y = (scrollbarBar.y + y > min) ? scrollbarBar.y + y : min;
  }
  else if (y > 0) {
    if (scrollbarBar.y < max)   
        scrollbarBar.y = (scrollbarBar.y + y > max) ? max : scrollbarBar.y + y;
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

  this.halt.drag = true;
}

/**
 * Draw scrollbar
 */
CustomScrollbar.prototype.draw = function() {
  
  var scrollRatio = scrollbarTrack.height ? ((scrollbarBar.y - scrollbarUp.height) / (scrollbarTrack.height)) : 0;    

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
    scrollbarBar.y = this.min();
  else if (newY > this.max())
    scrollbarBar.y = this.max();
  else
    scrollbarBar.y = newY;  
    
  this.scroll(true);        
}
