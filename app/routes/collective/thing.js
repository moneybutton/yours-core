import Ember from 'ember';

export default Ember.Route.extend({
  datt: Ember.inject.service(),

  model: function(args) {
    return this.get('datt').getThing(args.thing_id);
  }
});
