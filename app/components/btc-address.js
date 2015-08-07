/* globals QRCode */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['btc-address'],
  showQrCode: false,

  actions: {
    toggleQrCode: function() {
      this.toggleProperty('showQrCode');
    }
  }
});
