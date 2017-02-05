# Codeceptjs Docker

CodeceptJS with the Nightmare, Protractor, and WebDriverIO drivers.

## How to use this image

This image comes with the necessary dependencies and packages to execute CodeceptJS tests.  
Mount in your CodeceptJS tests directory into the `/tests/` directory in the docker container.  

If using the Protractor or WebDriverIO drivers, link the container with a Selenium Standalone docker container with an alias of `selenium`. Additionally, make sure your `codeceptjs.conf.js` contains the following to allow CodeceptJS to identify where Selenium is running. 

```javascript
  ...
  helpers: {
    WebDriverIO: {
      ...
      host: process.env.HOST
      ...
    }
  }
  ...
``` 

### Run

```sh
$ docker run -d -P --name selenium-chrome selenium/standalone-chrome 
# Alternativly, selenium/standalone-firefox can be used

$ docker run -it --rm -v /<path_to_codeceptjs_test_dir>/:/tests/ --link selenium-chrome:selenium codeception/codeceptjs
```

You may run use `-v $(pwd)/:tests/` if running this from the root of your CodeceptJS tests directory.  
_Note: The output of your test run will appear in your local directory if your output path is `./output` in the CodeceptJS config_ 
_Note: If running with the Nightmare driver, it is not necessary to run a selenium docker container and link it. So `--link selenium-chrome:selenium` may be omitted_

### Build

To build this image:

```sh
$ docker build -t codeception/codeceptjs docker/
```

## What is CodeceptJS?

CodeceptJS is a new testing framework for end-to-end testing with WebDriver (or others). It abstracts browser interaction to simple steps which is written from a user perspective. 

Codeception tests are:

- **Synchronous**. You don't need to care about callbacks, or promises, test scenarios are linear, your test should be too.
- Written from **user's perspective**. Every action is a method of `I`. That makes test easy to read, write and maintain even for non-tech persons.
- Backend **API agnostic**. We don't know which WebDriver implementation is running this test. We can easily switch from WebDriverIO to Protractor or PhantomJS.

See the [CodeceptJS site](http://codecept.io/) for documentation and usage.

## License

MIT © [DavertMik](http://codegyre.com/)

## Contributing

CodeceptJS is in its early days. Any feedback, issues, and pull requests are welcome. Try it, and if you like it - help us make it better!