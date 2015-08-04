import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didSubmit: function(thing) {
      this.transitionTo('collective.thing', thing);
    }
  }
});
