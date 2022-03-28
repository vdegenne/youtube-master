import { LitElement, html, css, PropertyValueMap, nothing } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import '@material/mwc-snackbar'
import '@material/mwc-button'
import '@material/mwc-icon'
import '@material/mwc-icon-button'
import '@material/mwc-dialog'
import '@material/mwc-textfield'
// import '@material/mwc-checkbox'
import './create-dialog'
import { CreateDialog } from './create-dialog'
import { Data, Video } from './types'

declare global {
  interface Window {
    app: AppContainer;
    toast: (labelText: string, timeoutMs?: number) => void;
    createDialog: CreateDialog;
    YT: any;
    YTScriptLoad: Promise<void>;
  }
}

@customElement('app-container')
export class AppContainer extends LitElement {
  @state() data: Data = [
    { title: '貧乏なんて気にしない', speed: 1, id: 'yNTKufmhBVo', flag: 0}
  ];
  @state() page: ''|'video' = ''
  @state() public player;

  private video!: Video;
  @state() loaded = false;

  @query('#player') playerContainer!: HTMLDivElement;
  @query('#IFrame') playerTest!: HTMLIFrameElement;
  @query('#homeButton') homeButton!: HTMLAnchorElement;

  get isVideoSaved () {
    // const params = new URLSearchParams(window.location.search)
    return this.data.find(V => V.id === this.video.id)
  }

  constructor () {
    super()
    if (localStorage.getItem('youtube-master:data')) {
      this.data = JSON.parse(localStorage.getItem('youtube-master:data')!.toString())
    }

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search)
      if (!params.has('id')) { // Not a valid url
        // Going back to main page
        window.location.search = ''
      }
      this.page = 'video'
      // Get the id
      const id = params.get('id')!;
      // Create a default object
      this.video = {
        id,
        title: 'Untitled Video',
        speed: 1,
        flag: 0
      }
      if (this.isVideoSaved) {
        // If the video is saved we load the data
        this.video = this.data.find(V => V.id === this.video.id)!
      }

      // Load the video as soon as the YTScript is fully loaded
      window.YTScriptLoad.then(() => {
        setTimeout(() => this.loadVideo(), 1000)
      })
    }

    window.addEventListener('resize', () => {
      this.requestUpdate()
    })
  }

  static styles = css`
  .video {
    display: block;
    padding: 12px;
    margin: 4px;
    cursor: pointer;
    text-decoration: none;
  }
  .video:hover {
    background-color: #eeeeee;
  }

  iframe {
    display: block;
    width: 100%;
  }

  [hide] {
    display: none !important;
  }

  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #3f51b5;
    color: white;
    user-select: none;
    cursor: pointer;
    width: 200px;
    height: 200px;
    --mdc-icon-size: 48px;
    border: 1px solid white;
    border-bottom: 0;
  }

  #controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 5px;
    /* padding: 12px; */
  }
  `
  render () {
    return html`

    ${this.page === '' ? html`
      ${this.data.map(V => {
        return html`<a class="video" title="${V.id}" href="./?id=${V.id}">${V.title}</a>`
      })}
      <mwc-button raised style="--mdc-theme-primary:red"
        @click=${_=>this.navigateTo()}>open</mwc-button>
    ` : nothing}


    ${this.page === 'video' ? html`
      <div id=controls style="text-align:right">
        <mwc-icon-button icon="arrow_backward"
          @click=${() => window.location.search = '' }></mwc-icon-button>
        ${this.isVideoSaved ?
          html`<mwc-button icon="delete" style="--mdc-theme-primary:red">delete</mwc-button>`
          :
          html`<mwc-button icon="add" @click=${() => { this.onAddVideoClick() }}>add</mwc-button>`
        }
      </div>

      <!-- Container used for the YouTube iframe -->
      <div id="player"></div>

      ${this.loaded ? html`
      <div class="flex">
        <div class="button" style="width:80px;height:80px;--mdc-icon-size:24px"
          @click=${() => this.setSpeed(this.video.speed - .25)}><mwc-icon>slow_motion_video</mwc-icon></div>
        <div style="font-size:28px;font-weight:bold">${this.video && this.video.speed}</div>
        <div class="button" style="width:80px;height:80px;--mdc-icon-size:24px"
          @click=${() => this.setSpeed(this.video.speed + .25)}><mwc-icon>speed</mwc-icon></div>
      </div>

      <div class="flex" ?hide=${!this.loaded} style="--mdc-icon-button-size:${~~(window.visualViewport.width / 3)}px;--mdc-icon-size:54px">
        <mwc-icon-button icon=restore style="background-color:rgb(63, 81, 181);color:white;border-radius:50%"
            @click=${() => this.player.seekTo(this.player.getCurrentTime() - 3)}></mwc-icon-button>
        <mwc-icon-button icon=${this.player.getPlayerState() !== 1 ? 'play_arrow' : 'pause' } style="color:white;background-color:#424242;border-radius:50%;"
          @click=${() => this.player.getPlayerState() === 1 ? this.player.pauseVideo() : this.player.playVideo()}></mwc-icon-button>
        <mwc-icon-button icon=update style="background-color:rgb(63, 81, 181);color:white;border-radius:50%"
            @click=${() => this.player.seekTo(this.player.getCurrentTime() + 3)}></mwc-icon-button>
      </div>

      <div style="display:flex;align-items:center;justify-content:space-between;--mdc-icon-button-size:60px;--mdc-icon-size:30px">
        <mwc-icon-button icon=flag style="background-color:rgb(63, 81, 181);color:white;border-radius:50%"
          @click=${_=>{this.video.flag=this.player.getCurrentTime();this.requestUpdate();this.saveData()}}></mwc-icon-button>
        <div>${~~this.video.flag}</div>
        <mwc-icon-button icon=fast_rewind
          @click=${_=>{this.player.seekTo(this.video.flag)}}></mwc-icon-button>
      </div>
      ` : nothing}

    ` : nothing}
    `
  }

  navigateTo () {
    const input = prompt('YouTube link or id')
    if (input === null) {
      return
    }
    if (input.includes('/')) {
      // link ?
      if (!input.startsWith('https')) {
        window.toast('invalid link')
      }
      const parts = input.split('?')
      if (parts.length === 1) {
        // it's a share link
        const crumbs = input.split('/')
        window.location.href = `./?id=${crumbs[crumbs.length - 1]}`
        return
      }
      if (parts.length === 2) {
        // there is a query string
        const params = new URLSearchParams(parts[1])
        if (!params.has('v')) {
          window.toast('invalid YouTube link')
          return
        }
        window.location.href = `./?id=${params.get('v')}`;
        return
      }
      else {
        window.toast('couldn\'t process the url')
      }
    }

  }

  // Use setSpeed instead
  changeSpeed (increment) {
    this.video!.speed += increment;
    if (this.video!.speed < 0.25) {
      this.video!.speed = 0.25
    }
    if (this.video!.speed > 2) {
      this.video!.speed = 2
    }
    this.setSpeed(this.video.speed)
  }

  setSpeed (speed) {
    this.video.speed = speed
    this.requestUpdate()
    this.player.setPlaybackRate(this.video.speed)
    this.saveData()
  }


  async loadVideo () {
    this.player = await new Promise((resolve) => {
      const player = new window.YT.Player(this.playerContainer, {
        // height: '360',
        // width: '640',
        videoId: this.video!.id,
        playerVars: {
          // 'controls': 0,
          // 'rel': 0
        },
        events: {
          'onReady': () => {
            resolve(player)
          },
          'onStateChange': this.onPlayerStateChange.bind(this)
        }
      })
    })
    this.loaded = true
    if (!this.isVideoSaved) {
      this.video.title = this.player.getVideoData().title;
    }
    this.setSpeed(this.video.speed)
    // console.log(this.player)
  }

  onPlayerStateChange (e) {
    const state = e.data
    if ([-1, 0, 1, 2].includes(state) && this.loaded) {
      this.requestUpdate()
    }
  }

  async onAddVideoClick() {
    try {
      const result = await window.createDialog.open(JSON.parse(JSON.stringify(this.video)))
      this.video = result
      this.data.push(this.video)
      this.saveData()
      window.toast('video saved')
      this.requestUpdate()
    } catch (e) {
      window.toast('cancelled')
    }
  }

  async createNewEntry () {
    try {
      // await window.createDialog.open()
    } catch (e) {
      // cancelled
      return
    }
  }

  saveData () {
    localStorage.setItem('youtube-master:data', JSON.stringify(this.data))
  }
}