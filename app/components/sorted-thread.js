import Ember from 'ember';

export default Ember.Component.extend({
  datt: Ember.inject.service(),
  things: [],
  sortParams: ['created:desc'],
  sortedThings: Ember.computed.sort('things', 'sortParams'),
  includeChildren: false,
  thing: null,
  getThings: function() {
    var thing = this.get('thing.id');
    if (!thing) {return;}
    this.get('datt').getChildren(thing).then(function(children) {
      this.set('things', children);
    }.bind(this)).catch(function(error) {
      console.error(error.stack || error);
    });
  }.on('init').observes('thing'),

  listenForReplies: function() {
    var thing = this.get('thing.id');
    if (!thing) {return;}
    this.get('datt').on('newReply', function(parent, item) {
      if (parent !== thing) {return;}
      this.get('things').addObject(item);
    }.bind(this));
  }.on('init').observes('thing')
});
