# Advanced Usage

## Debug

CodeceptJS provides a debug mode in which additional information is printed.
It can be turned on with `--debug` flag.

```
codeceptjs run --debug
```

While running in debug mode you can pause execution and enter interactive console mode by using `pause()` function.

NodeJS debugger can also be enabled so you could use debug by using breakpoints:

```
node $NODE_DEBUG_OPTION ./node_modules/.bin/codeceptjs run
```

## Multiple Execution

CodeceptJS can execute multiple suites in parallel. This is useful if you want to execute same tests but on different browsers and with different configurations. Before using this feature you need to add `multiple` option to the config:


```js
"multiple": {
  "basic": {
    // run all tests in chrome and firefox
    "browsers": ["chrome", "firefox"]
  },

"smoke": {
  // run only tests containing "@smoke" in name
  "grep": '@smoke',

  // use firefox and different chrome configurations
  "browsers": [
    'firefox',
    {browser: 'chrome', windowSize: 'maximize'},
    // replace any config values from WebDriverIO helper
    {browser: 'chrome', windowSize: '1200x840'}
    ]
  }
}
```
Then tests can be executed using `run-multiple` command.

Run `basic` suite for all browsers

```
codeceptjs run-multiple basic
```

Run `basic` suite for chrome only:

```
codeceptjs run-multiple basic:chrome
```

Run `basic` suite for chrome and `smoke` for firefox

```
codeceptjs run-multiple basic:chrome somke:firefox
```

Run basic tests with grep and junit reporter

```
codeceptjs run-multiple basic --grep signin --reporter mocha-junit-reporter
```

Run regression tests specifying different config path:

```
codeceptjs run-multiple regression -c path/to/config
```

Run all suites for all browsers:

```
codeceptjs run-multiple --all
```

Each executed process uses custom folder for reports and output. It is stored in subfolder inside an output directory. Subfolders will be named in `suite_browser` format.

Output is printed for all running processes. Each line is tagged with a suite and browser name:

```
[basic:firefox] GitHub --
[basic:chrome] GitHub --
[basic:chrome]    it should not enter
[basic:chrome]  ✓ signin in 2869ms

[basic:chrome]   OK  | 1 passed   // 30s
[basic:firefox]    it should not enter
[basic:firefox]  ✖ signin in 2743ms

[basic:firefox] -- FAILURES:

```

## done()