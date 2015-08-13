import Ember from 'ember';
import DattThing from 'datt-ui/mixins/datt-thing';

export default Ember.Component.extend(DattThing, {
  datt: Ember.inject.service(),
  things: [],
  sortParams: ['created:desc'],
  sortedThings: Ember.computed.sort('things', 'sortParams'),
  includeChildren: false,
  thing: null,
  getThings: Ember.on('init', function() {
    let thing = this.get('thing.id');
    if (!thing) {return;}
    this.get('datt').getChildren(thing).then(children => {
      this.set('things', children);
    }).catch(error => console.error(error.stack || error));
  }).observes('thing'),

  listenForReplies: Ember.on('init', function() {
    let thing = this.get('thing.id');
    if (!thing) {return;}
    this.get('datt').on('newReply', (parent, item) => {
      if (parent !== thing) {return;}
      this.get('things').addObject(item);
    });
  }).observes('thing')
});
