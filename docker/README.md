# Codeceptjs Docker

CodeceptJS packed into container with the Playwright, Puppeteer, and WebDriverIO drivers.

## How to Use

This image comes with the necessary dependencies and packages to execute CodeceptJS tests.
Mount in your CodeceptJS config directory into the `/tests` directory in the docker container.

Sample mount: `-v path/to/codecept.conf.js:/tests`

CodeceptJS runner is available inside container as `codeceptjs`.

### Locally

You can execute CodeceptJS with either Playwright or Puppeteer locally with no extra configuration.

```sh
docker run --net=host -v $PWD:/tests codeception/codeceptjs
```

To customize execution call `codeceptjs` command:

```sh
# run tests with steps
docker run --net=host -v $PWD:/tests codeception/codeceptjs codeceptjs run --steps

# run tests with @user in a name
docker run --net=host -v $PWD:/tests codeception/codeceptjs codeceptjs run --grep "@user"
```


### Docker Compose

```yaml
version: '2'
services:
  codeceptjs:
    image: codeception/codeceptjs
    depends_on:
      - firefox
      - web
    volumes:
      - .:/tests
  web:
    image: node
    command: node app/server.js
    volumes:
      - .:/app
  firefox:
    image: selenium/standalone-firefox-debug:2.53.0
    ports:
      - '4444'
      - '5900'
```

### Linking Containers

If using the WebDriverIO driver, link the container with a Selenium Standalone docker container with an alias of `selenium`. Additionally, make sure your `codeceptjs.conf.js` contains the following to allow CodeceptJS to identify where Selenium is running.

```javascript
  ...
  helpers: {
    WebDriver: {
      ...
      host: process.env.HOST
      ...
    }
  }
  ...
```

```sh
$ docker run -d -P --name selenium-chrome selenium/standalone-chrome

# Alternatively, selenium/standalone-firefox can be used

$ docker run -it --rm -v /<path_to_codeceptjs_test_dir>/:/tests/ --link selenium-chrome:selenium codeception/codeceptjs
```

You may run use `-v $(pwd)/:tests/` if running this from the root of your CodeceptJS tests directory.
_Note: The output of your test run will appear in your local directory if your output path is `./output` in the CodeceptJS config_

### Build

To build this image:

```sh
docker build -t codeception/codeceptjs .
```

* this directory will be added as `/codecept` insde container
* tests directory is expected to be mounted as `/tests`
* `codeceptjs` is a synlink to `/codecept/bin/codecept.js`

To build this image with your desired Node version:

```sh
docker build -t codeception/codeceptjs . --build-arg NODE_VERSION=12.10.0
```

### Passing Options

Options can be passed by calling `codeceptjs`:

```
docker run -v $PWD:/tests codeception/codeceptjs codeceptjs run --debug
```

Alternatively arguments to `codecept run` command can be passed via `CODECEPT_ARGS` environment variable. For example to run your tests with debug
output:

```yaml
version: '2'
services:
  codeceptjs:
    image: codeception/codeceptjs
    environment:
      - CODECEPT_ARGS=--debug
    volumes:
      - .:/tests
```

You can also use `run-workers`to run tests by passing `NO_OF_WORKERS`, additionally, you can pass more params like showing the debug info as the following example:

```yaml
version: '2'
services:
  codeceptjs:
    image: codeception/codeceptjs
    environment:
      - NO_OF_WORKERS=3
      - CODECEPT_ARGS=--debug
    volumes:
      - .:/tests
```
