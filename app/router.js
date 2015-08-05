import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('collectives', {path: '/c'}, function() {
    this.resource('collective', {path: '/:collective_id'}, function() {
      this.route('thing', {path: '/t/:thing_id'});
      this.route('submit');
    });
  });
  this.resource('balance');
});

export default Router;
