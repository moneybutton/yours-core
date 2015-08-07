/* globals QRCode */
import Ember from 'ember';

export default Ember.Component.extend({
  datt: Ember.inject.service(),
  tagName: 'fieldset',
  classNames: ['submission-form'],
  isText: false,

  actions: {
    submit: function() {
      var data = {
        title: this.get('title')
      };
      if (this.get('isText')) {
        data.type = 'datt-text';
        data.body = this.get('text');
      } else {
        data.type = 'datt-link';
        data.body = this.get('link');
      }
      this.get('datt').submit(this.get('collective'), data).then(function(item) {
        this.sendAction('success', item);
      }.bind(this)).catch(function(error) {
        this.sendAction('error', error);
        console.error(error);
      });
    }
  }
});
