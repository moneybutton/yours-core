import Ember from 'ember';

export default Ember.Controller.extend({
  datt: Ember.inject.service(),

  thing: Ember.computed.alias('model'),
  minBtc: '0.005',
  voteBtc: '0.0005',

  showPass: false,

  passType: Ember.computed('showPass', {
    get() {
      if (this.get('showPass')) {
        return 'text';
      }
      return 'password';
    }
  }),

  matchingPassPhrase: function() {
    if (this.get('passPhrase') === this.get('passPhraseRepeat')) {
      return this.get('passPhrase');
    }
  }.property('passPhrase', 'passPhraseRepeat'),

  address: Ember.computed('matchingPassPhrase', 'datt.myId', {
    get() {
      if (!this.get('matchingPassPhrase')) {return;}
      return this.get('datt.myId');
    }
  }),

  actions: {
    receivedBtc() {
      this.set('balance', this.get('minBtc'));
    }
  }
});
