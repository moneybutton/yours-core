import Ember from 'ember';

let on = Ember.on;

export default Ember.Component.extend({
  datt: Ember.inject.service(),
  classNames: ['table'],
  tagName: 'table',

  fetchTransactionData: on('init', function() {
    this.get('datt').getTransactions(this.get('user')).then(transactions => {
      this.set('transactions', transactions);
    });
  })
});
