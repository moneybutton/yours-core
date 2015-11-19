import Ember from 'ember';

export default Ember.Route.extend({
  datt: Ember.inject.service(),

  model(args) {
    return this.get('datt').getCollective(args.collective_id);
  },

  afterModel(model) {
    return Ember.RSVP.hash({
      include: this.get('datt').getThings(model.include),
      exclude: this.get('datt').getThings(model.exclude)
    }).then(hash => {
      Ember.set(model, 'listings', hash);
    });
  }
});
