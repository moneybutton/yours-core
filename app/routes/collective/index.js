import Ember from 'ember';

export default Ember.Route.extend({
  datt: Ember.inject.service(),

  model() {
    let collective = this.modelFor('collective');
    return this.get('datt').getCollectiveThings(collective.id);
  }
});
