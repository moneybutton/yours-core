import Ember from 'ember';

export default Ember.Route.extend({
  datt: Ember.inject.service(),

  redirect: function() {
    this.transitionTo('collective', this.get('datt.defaultCollective'));
  }
});
