/* globals QRCode */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['qr-code'],
  value: '',

  qrCode: Ember.computed({
    get: function() {
      return new QRCode(this.get('element'), this.get('value'));
    }
  }),

  drawCode: function() {
    this.get('qrCode');
  }.on('didInsertElement')
});
