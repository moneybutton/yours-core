/* globals Ember */
import DattThing from 'datt-ui/mixins/datt-thing';

export default Ember.Component.extend(DattThing, {
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
