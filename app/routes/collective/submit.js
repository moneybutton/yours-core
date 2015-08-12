import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    didSubmit(thing) {
      this.transitionTo('collective.thing', thing);
    }
  }
});
