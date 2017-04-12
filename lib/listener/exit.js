'use strict';

const event = require('../event');

module.exports = function () {

  let failed = false;

  let failedTests = [];

  event.dispatcher.on(event.test.failed, function (testOrSuite) {
    // NOTE When an error happens in one of the hooks (BeforeAll/BeforeEach...) the event object
    // is a suite and not a test
    failedTests.push(testOrSuite.fullTitle());
  });

  // if test was successful after retries
  event.dispatcher.on(event.test.passed, function (testOrSuite) {
    // NOTE When an error happens in one of the hooks (BeforeAll/BeforeEach...) the event object
    // is a suite and not a test
    failedTests = failedTests.filter((failed) => testOrSuite.fullTitle() !== failed);
  });

  event.dispatcher.on(event.all.result, function () {
    if (failedTests.length) {
      process.exitCode = 1;
    }
  });
};
