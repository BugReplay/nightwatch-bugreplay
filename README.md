# BugReplay Nightwatch Service
The BugReplay Nightwatch service records screencasts of your automated tests including timesynced JavaScript Console and Network logs

## Installation
Install the package

    npm install nightwatch-bugreplay --save-dev

## Configuration
You will need to sign up for an account at https://bugreplay.com. After that you will need to login and get an API key by clicking the Hamburger Menu, click My Settings, and then Show API Key. You'll use this in the configuration file.    

In nightwatch.conf.js, you will need to setup a globals_path where you setup the BugReplay automation extension, a globals object where you specify the apiKey and your bugreplay report attributes as well as configure the BugReplay automation extension to be added to chrome:

    //nightwatch.conf.js
    module.exports = {
      src_folders : ["tests"],
      // ...
      globals_path : 'global.conf.js', // Specify a global config file
      // ...
      test_settings : {
        // ...
        default : {
          // ...
          globals: {
            apiKey: '73H/VQbjdwu8IRZTtF5AIxVQF8p+oUMKW2bg/hNnG40=',
            saveSuccessfulTests: true, // the default is false
            test_run_id : process.env.TEST_RUN_ID || new Date().toISOString(),  // Assign a unique test run ID for each run. Defaults to current timestamp.
            project_id: 875,  // OPTIONAL: Your BugReplay ProjectID you want your reports to save. Defaults to your active project ID.
            assigned_user_id: 915,  // OPTIONAL: UserID of your BugReplay team member you want the bugreport to assign. Default is unassigned.
            tags: 'automation, nightwatch, chrome',   // OPTIONAL: tags you want to assign to the bugreport. 
            status_id: 3209   // OPTIONAL: assign the status id by default. Default is New.
          },
          desiredCapabilities: {
            // ...
            browserName: 'chrome',
            'goog:chromeOptions': {
              args: [
                '--load-extension=node_modules/bugreplay-automation/extension/',
                '--auto-select-desktop-capture-source=Record This Window'
              ]
          }
          }
        }
      }
    };

In your global config file, setup the bugreplay automation extension using the apiKey 

    //global.conf.js
    const bugreplay = require('nightwatch-bugreplay'); // import nightwatch-bugreplay package

    module.exports = {
      // ...
      asyncHookTimeout : 60000, // minimum time it takes for bugreplay extension to capture bug report. Specify atleast 60 secs
      
      // ...
      
      // beforeEach hook which runs before each test suite
      beforeEach: async (browser, done) => {
        await bugreplay.setup(browser.globals.apiKey, browser, done);  //setup bugreplay using the apiKey specified under globals in nightwatch.conf.js
      },

      // ...
    };

And lastly, in each of your testsuite within your src_folders specify the beforeEach and afterEach test hooks to start and stop bugreplay recording respectively
    
    // search.e2e.js
    const bugreplay = require('nightwatch-bugreplay'); // Import nightwatch bugreplay package

    describe('Search ecosia.org', () => {

      // start bugreplay recording before each testcase
      beforeEach(async (browser, done) => {
        await bugreplay.startRecording(browser, done);   
      });

      // stop bugreplay recording after each testcase
      afterEach(async (browser, done) => {
        await bugreplay.stopRecording(browser, done)
        browser.end() // Make sure .end() is only called after you stop bugreplay recording.
      });

      test('Search nightwatch', (browser) => {
        browser
          .url('https://www.ecosia.org/')
          .pause(1000)
          .waitForElementVisible('body')
          .assert.titleContains('Ecosia')
          .assert.visible('input[type=search]')
          .setValue('input[type=search]', 'nightwatchjs')
          .assert.visible('button[type=submit]')
          .click('button[type=submit]')
          .assert.containsText('.mainline-results', 'Nightwatch.js')
      });

      test('Search BugReplay', (browser) => {
        browser
          .url('https://www.ecosia.org/')
          .pause(1000)
          .waitForElementVisible('body')
          .assert.titleContains('Ecosia')
          .assert.visible('input[type=search]')
          .setValue('input[type=search]', 'BugReplay')
          .assert.visible('button[type=submit]')
          .click('button[type=submit]')
          .assert.containsText('.mainline-results', 'BugReplay')
      });

      // ...

    });

After this configuration your tests will automatically be recorded to video, uploaded to BugReplay, and ready for playback alongside the timesynced JS console and network traffic logs.

## Limitations
This currently only works for chromedriver. We're looking to expand to other browsers in the future.