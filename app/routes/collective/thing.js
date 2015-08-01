import Ember from 'ember';

export default Ember.Route.extend({
  datt: Ember.inject.service(),

  model: function(args) {
    return this.get('datt').getThing(args.address);
  },

  afterModel: function(model) {
    if (model.type === 'datt-listing') {
      this.get('datt').getThings(model.ids).then(function(things) {
        Ember.set(model, 'children', things);
      });
    }
  }
});
