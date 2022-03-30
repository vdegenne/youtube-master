import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('share-interface')
export class ShareInterface extends LitElement {
  render () {

    return html`

    Share this page on your devices where you want to load this device data.

    <textarea disabled>${this.data}</textarea>

    <div style="color:red">You're about to load this page data. Your local data on this device will be replace with the above content !</div>

    <mwc-button unelevated>load the data</mwc-button>
    `
  }

  get data() {
    const query = new URLSearchParams(window.location.search)
    return JSON.parse(decodeURIComponent(query.get('d')!))
  }
}