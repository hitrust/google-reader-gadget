/**
 * Constructor for Folder class.
 */
function Folder(id, label) {
  this.items = [];
  this.unread = 0;
  this.id = id;
  this.title = label;
  this.isExpanded = true;
}

/**
 * Reset feed order
 */
Folder.prototype.reset = function() {
  this.items = [];
}

/**
 * Push new item.
 */
Folder.prototype.push = function(item) {
  this.items.push(item)
}

/**
 * Unshift new item.
 */
Folder.prototype.unshift = function(item) {
  this.items.unshift(item)
}

/**
 * Constructor for Sort class.
 */
function Sort(obj, type) {
  this.id = obj.id;
  this.title = obj.title || '';
  this.type = type || 'feed';
}
