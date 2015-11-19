import Ember from 'ember';

export default Ember.Component.extend({
  datt: Ember.inject.service(),
  tagName: 'fieldset',
  classNames: 'comment-form',

  actions: {
    cancel() {
      this.set('body', '');
      this.sendAction('cancel');
    },
    save() {
      if (!this.get('body')) {
        alert('A body is required');
      }
      this.get('datt').submitComment(this.get('parent'), {
        body: this.get('body')
      }).then(() => {
        this.set('body', '');
        this.sendAction('saved');
      });
    }
  }
});
