import Ember from 'ember';

export default Ember.Route.extend({
  actions: {
    up(thing) {
      var voteModal = this.controllerFor('voteModal');
      if (voteModal.get('balance')) {return;}
      voteModal.setProperties({
        model: thing,
        direction: 'up'
      });
      this.send('openModal', 'voteModal');
    },
    down(thing) {
      var voteModal = this.controllerFor('voteModal');
      if (voteModal.get('balance')) {return;}
      voteModal.setProperties({
        model: thing,
        direction: 'down'
      });
      this.send('openModal', 'voteModal');
    },

    openModal: function(modalName) {
      return this.render(modalName, {
        into: 'application',
        outlet: 'modal'
      });
    },

    closeModal() {
      return this.disconnectOutlet({
        outlet: 'modal',
        parentView: 'application'
      });
    }
  }
});
