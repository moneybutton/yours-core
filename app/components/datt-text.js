import Ember from 'ember';

export default Ember.Component.extend({
  isReplying: false,
  class: 'media',
  actions: {
    reply() {
      this.set('isReplying', true);
    },
    cancelReply() {
      this.set('isReplying', false);
    }
  }
});
