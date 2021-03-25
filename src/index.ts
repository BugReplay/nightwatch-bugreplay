import BugReplayExtension from './BugReplayExtension'

const setup = async (apiKey:string, browser: any, done: any)  => {
  await BugReplayExtension.auth(browser, apiKey);
  done()
}

const startRecording= async (browser: any, done: any) => {
  await BugReplayExtension.startRecording(browser);
  done();
}

const stopRecording = async (browser: any, done: any) => {

  const time = (new Date()).toISOString() 
  const passed = browser.currentTest.results.failed === 0;
  const { project_id, assigned_user_id, status_id, tags, saveSuccessfulTests } = browser.globals;
  const hierarchy = browser.currentTest.module + ' > ' + browser.currentTest.name;
  await BugReplayExtension.stopRecording(browser)
  if(passed && !saveSuccessfulTests) {
    await BugReplayExtension.cancelReport(browser)
  } else {
    let reportAttributes: any = {
      test_hierarchy: hierarchy,
      test_passed: passed,
      test_run_id: browser.globals.test_run_id
    }
    
    reportAttributes = Object.assign(
      {...reportAttributes}, 
      project_id && {project_id},
      assigned_user_id && {assigned_user_id},
      status_id && {status_id},
      tags && {tags}
    )
    await BugReplayExtension.saveReport(browser, `Nightwatch - ${browser.currentTest.name} - ${time}`, reportAttributes)
  }
  done();
}

export default {
  setup,
  startRecording,
  stopRecording
}

module.exports = {
  setup,
  startRecording,
  stopRecording
}

