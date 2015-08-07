import Ember from 'ember';

export default Ember.Component.extend({
  isReplying: false,
  class: 'media',
  actions: {
    reply: function() {
      this.set('isReplying', true);
    },
    cancelReply: function() {
      this.set('isReplying', false);
    }
  }
});
