/* globals QRCode */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['qr-code'],
  value: '',

  qrCode: Ember.computed({
    get() {
      return new QRCode(this.get('element'), this.get('value'));
    }
  }),

  drawCode: Ember.on('didInsertElement', function() {
    this.get('qrCode');
  })
});
