import Ember from 'ember';

export default Ember.Route.extend({
  datt: Ember.inject.service(),

  model: function() {
    var collective = this.modelFor('collective');
    return this.get('datt').getCollectiveThings(collective.id).then(function(model) {
      return model;
    });
  }
});
