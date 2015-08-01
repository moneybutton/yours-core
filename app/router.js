import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('collectives', {path: '/c'}, function() {
    this.resource('collective', {path: '/:address'}, function() {
      this.route('thing', {path: '/t/:address'});
    });
  });
  this.resource('balance');
});

export default Router;
