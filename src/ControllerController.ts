import gameControl from 'gamecontroller.js/src/gamecontrol.js'
import { AppContainer } from './main';

export class ControllerController {
  private app: AppContainer;
  // private controllerEventsLoopHandle
  // private controllerEventsLoopBind = this.controllerEventsLoop.bind(this)
  // private gamepad!: Gamepad
  // private pressed: number[] = []

  private secondary =false
  private leftArrowPressed = false
  private rightArrowPressed = false

  /**
   * Constructor
   */
  constructor (appInstance: AppContainer) {
    this.app = appInstance
    gameControl.on('connect', gamepad=>{
      gamepad
      .before('button0', () => { this.app.playButton.click() })
      .before('button14', ()=>{ this.app.backButton.click() })
      .before('button15', ()=>{ this.app.forwardButton.click() })


      .before('button8', () => { this.app.flagButton.click() })
      .before('button7', () => { this.app.fastForwardButton.click() })

      .before('button4', () => { this.app.slowRateButton.click() })
      .before('button5', () => { this.app.speedRateButton.click() })
    })
  }
}

// const tick1 = new Audio('./audio/tick1.mp3')
// function playTick1 () { return tick1.play(); }
// const tick2 = new Audio('./audio/tick2.mp3')
// function playTick2 () { return tick2.play(); }
// const shuffle = new Audio('./audio/cancel.mp3')
// function playShuffle () { return shuffle.play(); }