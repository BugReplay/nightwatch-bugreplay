import {NightwatchBrowser} from "nightwatch";

const BugReplayExtension = {
  dispatch(browser: NightwatchBrowser, payload: any) {
    browser.execute(function(payload: any) {
      window.postMessage({
        type: 'REDUX_DISPATCH',
        payload: payload
      }, '*');
      return true;
    }, [payload])
  },

  async auth(browser: NightwatchBrowser, apiKey: string) {
    // For now the extension requires that you are on a real page before it can initialize
    browser.url('https://bugreplay.com/')
    this.dispatch(browser, {
      type: 'SET_API_KEY',
      payload: apiKey,
    })
  },
  
  async startRecording(browser: NightwatchBrowser) {
    this.dispatch(browser, {
      type: 'POPUP_CONNECT'
    })
    await browser.execute(function() {
      document.title = "Record This Window"
      return true;
    })
    this.dispatch(browser, { type: 'CLICK_START_RECORDING_SCREEN' })
  },

  async stopRecording(browser: NightwatchBrowser) {
    await browser.executeAsync(function(done: any) {
      window.addEventListener("message", (event: any) => {
        if(event?.data?.payload?.nextState?.recording?.stopped) {
          // Don't finish until the browser has stopped recording
          done(true)
        }
      })
      window.postMessage({
        type: 'REDUX_DISPATCH',
        payload: { type: 'CLICK_STOP_RECORDING' }
      }, '*');
    })
  },

  async saveReport(browser: NightwatchBrowser, title = "Automated Bug Report", options = {}) {
    await browser.executeAsync(function(title: string, options: any, done: any){
      window.addEventListener("message", (event) => {
        console.log(event)
        if(!event?.data?.payload?.nextState?.report?.started &&
           event?.data?.payload?.nextState?.reports?.processing?.length === 0
          ) {
          // Don't finish until the report is submitted and processed
          done(true)
        }
      })
      window.postMessage({
        type: 'REDUX_DISPATCH',
        payload: { 
          type: 'UPDATE_REPORT', 
          payload: {
            updates: {
              title,
              ...options,
            }
          },
        }
      }, '*');
      window.postMessage({
        type: 'REDUX_DISPATCH',
        payload: { 
          type: 'CLICK_SUBMIT_REPORT', 
        }
      }, '*');

      window.postMessage({
        type: 'REDUX_DISPATCH',
        payload: { type: 'POPUP_DISCONNECT' }
      }, '*');
    }, [title, options])
  },
  
  async cancelReport(browser: NightwatchBrowser) {
    this.dispatch(browser, { type: 'CANCEL_REPORT' })
    this.dispatch(browser, { type: 'POPUP_DISCONNECT' })
  }
}

export default BugReplayExtension
