import Ember from 'ember';

export default Ember.Mixin.create({
  up: 'up',
  down: 'down',

  actions: {
    up(thing) {
      this.sendAction('up', thing || this.get('thing'));
    },
    down(thing) {
      this.sendAction('down', thing || this.get('thing'));
    }
  }
});
