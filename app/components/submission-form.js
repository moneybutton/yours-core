import Ember from 'ember';

export default Ember.Component.extend({
  datt: Ember.inject.service(),
  tagName: 'fieldset',
  classNames: ['submission-form'],
  isText: false,

  actions: {
    submit() {
      let data = {
        title: this.get('title')
      };
      if (this.get('isText')) {
        data.type = 'datt-text';
        data.body = this.get('text');
      } else {
        data.type = 'datt-link';
        data.body = this.get('link');
      }
      this.get('datt').submit(this.get('collective'), data)
        .then(item =>this.sendAction('success', item))
        .catch(error => {
          this.sendAction('error', error);
          console.error(error);
        });
    }
  }
});
