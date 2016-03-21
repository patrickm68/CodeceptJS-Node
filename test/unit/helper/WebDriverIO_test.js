'use strict';

let WebDriverIO = require('../../../lib/helper/WebDriverIO');
let should = require('chai').should();
let wd;
let site_url = 'http://127.0.0.1:8000';
let assert = require('assert');
let path = require('path');
let fs = require('fs');
let fileExists = require('../../../lib/utils').fileExists;
let AssertionFailedError = require('../../../lib/assert/error');
let formContents = require('../../../lib/utils').test.submittedData(path.join(__dirname, '../../data/app/db'));
let expectError = require('../../../lib/utils').test.expectError;
let webApiTests = require('./webapi');


describe('WebDriverIO', function () {
  this.timeout(10000);

  before(() => {
    global.codecept_dir = path.join(__dirname, '../../data');
    try {
      fs.unlinkSync(dataFile);
    } catch (err) {}

    wd = new WebDriverIO({
      url: site_url,
      browser: 'firefox'
    });
  });

  beforeEach(() => {
    webApiTests.init({I: wd, site_url});
    return wd._before();
  });

  afterEach(() => {
    return wd._after();
  });

  // load common test suite
  webApiTests.tests();

  describe('open page : #amOnPage', () => {
    it('should open main page of configured site', () => {
      return wd.amOnPage('/').getUrl().then((url) => {
        return url.should.eql(site_url + '/');
      });
    });

    it('should open any page of configured site', () => {
      return wd.amOnPage('/info').getUrl().then((url) => {
        return url.should.eql(site_url + '/info');
      });
    });

    it('should open absolute url', () => {
      return wd.amOnPage(site_url).getUrl().then((url) => {
        return url.should.eql(site_url + '/');
      });
    });
  });

  describe('see text : #see', () => {
    it('should fail when text is not on site', () => {
      return wd.amOnPage('/')
        .then(() => wd.see('Something incredible!'))
        .then(expectError)
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.include('web page');
        })
        .then(() => wd.dontSee('Welcome'))
        .then(expectError)
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.include('web page');
      });
  });

  describe('see element : #seeElementInDOM, #dontSeeElementInDOM', () => {
    it('should check elements are in the DOM', () => {
      return wd.amOnPage('/form/field')
        .then(() => wd.seeElementInDOM('input[name=name]'))
        .then(() => wd.seeElementInDOM('//input[@id="name"]'))
        .then(() => wd.dontSeeElementInDOM('#something-beyond'))
        .then(() => wd.dontSeeElementInDOM('//input[@id="something-beyond"]'));
    });
  });

  describe('see element : #seeElement, #dontSeeElement', () => {
    it('should check elements are visible on the page', () => {
      return wd.amOnPage('/form/field')
        .then(() => wd.seeElementInDOM('input[name=email]'))
        .then(() => wd.dontSeeElement('input[name=email]'))
        .then(() => wd.dontSeeElement('#something-beyond'));
    });
  });

  describe('check fields: #seeInField, #seeCheckboxIsChecked, ...', () => {
    it('should throw error if field is not empty', () => {
      return wd.amOnPage('/form/empty')
        .then(() => wd.seeInField('#empty_input', 'Ayayay'))
        .then(expectError)
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.be.equal('expected fields by #empty_input to include Ayayay');
        });
    });

    it('should check values in checkboxes', function*() {
      yield wd.amOnPage('/form/field_values')
      yield wd.dontSeeInField('checkbox[]', 'not seen one');
      yield wd.seeInField('checkbox[]', 'see test one');
      yield wd.dontSeeInField('checkbox[]', 'not seen two');
      yield wd.seeInField('checkbox[]', 'see test two');
      yield wd.dontSeeInField('checkbox[]', 'not seen three');
      return wd.seeInField('checkbox[]', 'see test three');
    });

    it('should check values with boolean', function*() {
      yield wd.amOnPage('/form/field_values')
      yield wd.seeInField('checkbox1', true);
      yield wd.dontSeeInField('checkbox1', false);
      yield wd.seeInField('checkbox2', false);
      yield wd.dontSeeInField('checkbox2', true);
      yield wd.seeInField('radio2', true);
      yield wd.dontSeeInField('radio2', false);
      yield wd.seeInField('radio3', false);
      return wd.dontSeeInField('radio3', true);
    });

    it('should check values in radio', function*() {
      yield wd.amOnPage('/form/field_values')
      yield wd.seeInField('radio1', 'see test one');
      yield wd.dontSeeInField('radio1', 'not seen one');
      yield wd.dontSeeInField('radio1', 'not seen two');
      return wd.dontSeeInField('radio1', 'not seen three');
    });

    it('should check values in select', function*() {
      yield wd.amOnPage('/form/field_values')
      yield wd.seeInField('select1', 'see test one');
      yield wd.dontSeeInField('select1', 'not seen one');
      yield wd.dontSeeInField('select1', 'not seen two');
      return wd.dontSeeInField('select1', 'not seen three');
    });

    it('should check for empty select field', function*() {
      yield wd.amOnPage('/form/field_values')
      return wd.seeInField('select3', '');
    });

    it('should check for select multiple field', function*() {
      yield wd.amOnPage('/form/field_values')
      yield wd.dontSeeInField('select2', 'not seen one');
      yield wd.seeInField('select2', 'see test one');
      yield wd.dontSeeInField('select2', 'not seen two');
      yield wd.seeInField('select2', 'see test two');
      yield wd.dontSeeInField('select2', 'not seen three');
      return wd.seeInField('select2', 'see test three');
    });
  });

  describe('#clearField', () => {
    it('should clear a given element', () => {
      return wd.amOnPage('/form/field')
        .then(() => wd.fillField('#name', 'Nothing special'))
        .then(() => wd.seeInField('#name', 'Nothing special'))
        .then(() => wd.clearField('#name'))
        .then(() => wd.dontSeeInField('#name', 'Nothing special'));
    });
  });

  describe('#seeInSource', () => {
    it('should check for text to be in HTML source', () => {
      return wd.amOnPage('/')
        .then(() => wd.seeInSource('<title>TestEd Beta 2.0</title>'))
        .then(() => wd.dontSeeInSource('<meta'));
    });
  });

  describe('window size : #resizeWindow', () => {
    it('should change the active window size', () => {
      return wd.amOnPage('/')
        .then(() => wd.resizeWindow(640, 480))
        .then(function () { return this.windowHandleSize((err, size) => {
          assert.equal(size.value.width, 640);
          return assert.equal(size.value.height, 480);
        });
      });
    });
  });

  describe.only('popup : #acceptPopup, #seeInPopup, #cancelPopup', () => {
    it('should accept popup window', () => {
      return wd.amOnPage('/form/popup')
        .then(() => wd.click('Confirm'))
        .then(() => wd.acceptPopup())
        .then(() => wd.see('Yes', '#result'));
    });

    it('should cancel popup', () => {
      return wd.amOnPage('/form/popup')
        .then(() => wd.click('Confirm'))
        .then(() => wd.cancelPopup())
        .then(() => wd.see('No', '#result'));
    });

    it('should check text in popup', () => {
      return wd.amOnPage('/form/popup')
        .then(() => wd.click('Alert'))
        .then(() => wd.seeInPopup('Really?'))
        .then(() => wd.cancelPopup());
    });
  });

  describe('#waitForText', () => {
    it('should return error if not present', () => {
      return wd.amOnPage('/dynamic')
        .then(() => wd.waitForText('Nothing here', 0, '#text'))
        .then(expectError)
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.be.equal('expected element #text to include Nothing here');
        });
    });

    it('should return error if waiting is too small', () => {
      return wd.amOnPage('/dynamic')
        .then(() => wd.waitForText('Dynamic text', 0.5))
        .then(expectError)
        .catch((e) => {
          e.should.be.instanceOf(AssertionFailedError);
          e.inspect().should.be.equal('expected element body to include Dynamic text');
        });
    });
  });

  describe('#seeNumberOfElements', () => {
    it('should return 1 as count', () => {
      return wd.amOnPage('/')
        .then(() => wd.seeNumberOfElements('#area1', 1));
    });
  });

});
