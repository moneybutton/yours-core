function Content(data, owner) {
  this.data = data;
  this.owner = owner;
}

Content.prototype.serialize = function serialize() {
  return JSON.stringify(this);
};

Content.serialize = function serialize(content) {
  if(!content || !content.serialize || typeof(content.serialize) !== "function") {
    throw "Content.serialize requires non-null Content instance as first argument";
  } else {
    return content.serialize();
  }
};

module.exports = Content;
