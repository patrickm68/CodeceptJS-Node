'use strict';
let TestHelper = require('../support/TestHelper');

let Nightmare = require('../../lib/helper/Nightmare');
let should = require('chai').should();
let I, browser;
let site_url = TestHelper.siteUrl();
let assert = require('assert');
let path = require('path');
let fs = require('fs');
let fileExists = require('../../lib/utils').fileExists;
let AssertionFailedError = require('../../lib/assert/error');
let formContents = require('../../lib/utils').test.submittedData(path.join(__dirname, '/../data/app/db'));
require('co-mocha')(require('mocha'));
let webApiTests = require('./webapi');

describe('Nightmare', function () {
  this.retries(4);
  this.timeout(35000);

  before(function() {
    global.codecept_dir = path.join(__dirname, '/../data');
    try {
      fs.unlinkSync(dataFile);
    } catch (err) {}

    I = new Nightmare({
      url: site_url,
      windowSize: '500x700',
      show: false
    });
    I._init();
    I._beforeSuite();
  });

  beforeEach(function() {
    webApiTests.init({ I, site_url});
    return I._before().then(() => browser = I.browser);
  });

  afterEach(() => {
    return I._after();
  });

  describe('open page : #amOnPage', () => {
    it('should open main page of configured site', function*() {
      I.amOnPage('/');
      let url = yield browser.url();
      return url.should.eql(site_url + '/');
    });

    it('should open any page of configured site', function*() {
      I.amOnPage('/info');
      let url = yield browser.url();
      return url.should.eql(site_url + '/info');
    });

    it('should open absolute url', function*() {
      I.amOnPage(site_url);
      let url = yield browser.url();
      return url.should.eql(site_url + '/');
    });
  });

  webApiTests.tests();


  // should work for webdriverio and seleniumwebdriver
  // but somehow fails on Travis CI :(
  describe('#moveCursorTo', () => {
    it('should trigger hover event', () => {
      return I.amOnPage('/form/hover')
        .then(() => I.moveCursorTo('#hover'))
        .then(() => I.see('Hovered', '#show'));
    });
  });

  describe('scripts Inject', () => {
    it('should reinject scripts after navigating to new page', () => {
      return I.amOnPage('/')
        .then(() => I.click("//div[@id='area1']/a"))
        .then(() => I.waitForVisible("//input[@id='avatar']"));
    });
  });

  describe('see text : #see', () => {
    it('should fail when text is not on site', () => {
      return I.amOnPage('/')
        .then(() => I.see('Something incredible!'))
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.include('web application');
        });
    });


    it('should fail when clickable element not found', () => {
      return I.amOnPage('/')
        .then(() => I.click('Welcome'))
        .catch((e) => {
          e.should.be.instanceOf(Error);
          e.message.should.include('Clickable');
        });
    });

    it('should fail when text on site', () => {
      return I.amOnPage('/')
        .then(() => I.dontSee('Welcome'))
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.include('web application');
        });
    });

    it('should fail when test is not in context', () => {
      return I.amOnPage('/')
        .then(() => I.see('debug', {css: 'a'}))
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.toString().should.not.include('web page');
          e.inspect().should.include("expected element {css: 'a'}");
        });
    });
  });

  describe('#locate', () => {
    it('should use locate to check element', () => {
      let attribute = 'qa-id';
      return I.amOnPage('/')
        .then(() => {
          return I._locate({css: '.notice'}).then(function(els) {
            // we received an array with IDs of matched elements
            // now let's execute client-side script to get attribute for the first element
            return browser.evaluate(function(el, attribute) {
              // this is executed inside a web page!
              return codeceptjs.fetchElement(el).getAttribute(attribute);
            }, els[0], attribute); // function + its params
          }).then(function(attributeValue) {
            // get attribute value and back to server side
            // execute an assertion
            assert.equal(attributeValue, 'test');
          });
        });
    });
  });

  describe('refresh page', () => {
    it('should refresh the current page', function*() {
      I.amOnPage(site_url);
      let url = yield browser.url();
      assert.equal(site_url + '/', url);
      yield I.refresh();
      let nextUrl = yield browser.url();
      //reloaded the page, check the url is the same
      assert.equal(url, nextUrl);
    });
  });

});
