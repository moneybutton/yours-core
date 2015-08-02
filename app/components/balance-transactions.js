import Ember from 'ember';

export default Ember.Component.extend({
  datt: Ember.inject.service(),
  classNames: ['table'],
  tagName: 'table',

  fetchTransactionData: function() {
    this.get('datt').getTransactions(this.get('user')).then(function(transactions) {
      this.set('transactions', transactions);
    }.bind(this));
  }.on('init')

});

