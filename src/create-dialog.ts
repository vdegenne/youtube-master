import { Dialog } from '@material/mwc-dialog';
import { css, html, LitElement, nothing } from 'lit';
import { live } from 'lit/directives/live.js';
import { customElement, query, state } from 'lit/decorators.js';
import { Video } from './types';

@customElement('create-dialog')
export class CreateDialog extends LitElement {
  @query('mwc-dialog') dialog!: Dialog;

  @state() private video!: Video;

  private _resolve?: (value: Video) => void;
  private _reject;

  static styles = css`
  p {
    margin-bottom: 4px;
  }
  mwc-textfield {
    width: 100%;
    margin-top: 36px
  }
  mwc-textfield:first-of-type {
    margin-top:12px;
  }
  `

  protected render() {
    return html`
    <mwc-dialog heading="Create" escapeKeyAction="" scrimClickAction="">
      ${this.video ? html`
      <mwc-textfield outlined label="title" value=${this.video.title} dialogInitialFocus
        @keyup=${e => {this.video.title = e.target.value; this.requestUpdate()}}></mwc-textfield>

      <!-- <p>YouTube id</p> -->
      <mwc-textfield outlined label="YouTube id" value=${this.video.id} disabled></mwc-textfield>

      <mwc-button outlined slot="secondaryAction" dialogAction="close"
        @click=${() => { this._reject!(); this.dialog.close() }}>cancel</mwc-button>
      <mwc-button unelevated slot="primaryAction"
        ?disabled=${this.video.title === ''}
        @click=${() => this.submit()}>save</mwc-button>
      ` : nothing}
    </mwc-dialog>
    `
  }

  open(video: Video) {
    this.video = video
    this.requestUpdate()
    this.dialog.show()
    return new Promise<Video>((resolve, reject) => {
      this._resolve = resolve
      this._reject = reject
    })
  }

  submit() {
    if (this.video.title !== '') {
      this._resolve!(this.video)
      this.dialog.close()
    }
  }
}