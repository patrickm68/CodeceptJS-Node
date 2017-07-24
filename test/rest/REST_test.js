'use strict';
let REST = require('../../lib/helper/REST');
let should = require('chai').should();
let api_url = 'http://127.0.0.1:8010';
let assert = require('assert');
let path = require('path');
let fs = require('fs');
let fileExists = require('../../lib/utils').fileExists;
let AssertionFailedError = require('../../lib/assert/error');
let expectError = require('../../lib/utils').test.expectError;
let I;
let dbFile = path.join(__dirname, '/../data/rest/db.json');
require('co-mocha')(require('mocha'));

const data = {
  "posts": [
    {
      "id": 1,
      "title": "json-server",
      "author": "davert"
    }
  ],
  "user": {
    "name": "davert"
  }
}

describe('REST', function () {

  before(function() {
    I = new REST({
      endpoint: api_url,
      defaultHeaders: {
        'X-Test': 'test'
      }
    });
  });

  beforeEach((done) => {
    try {
      fs.writeFileSync(dbFile, JSON.stringify(data));
    } catch (err) {}
    setTimeout(done, 700);
  })

  describe('basic requests', function() {
    it('should send GET requests', () => {
      return I.sendGetRequest('/user').then((response) => {
        response.body.name.should.eql('davert');
      });
    });

    it('should send POST requests', () => {
      return I.sendPostRequest('/user', { name: 'john' }).then((response) => {
        response.body.name.should.eql('john');
      });
    });

    it('should send PUT requests', () => {
      return I.sendPutRequest('/posts/1', { author: 'john' }).then((response) => {
        response.body.author.should.eql('john');
        return I.sendGetRequest('/posts/1').then((response) => {
          response.body.author.should.eql('john');
        });
      });
    });

    it('should send DELETE requests', () => {
      return I.sendDeleteRequest('/posts/1').then((response) => {
        return I.sendGetRequest('/posts').then((response) => {
          response.body.should.be.empty;
        });
      });
    });

  });

  describe('headers', function() {
    it ('should send request headers', () => {
      return I.sendGetRequest('/headers', { 'Content-Type': 'application/json'}).then((resp) => {
        resp.body.should.have.property('content-type');
        resp.body['content-type'].should.eql('application/json');

        resp.body.should.have.property('x-test');
        resp.body['x-test'].should.eql('test');
      });
    });

    it ('should set request headers', function*() {
      I.haveRequestHeaders({HTTP_X_REQUESTED_WITH: 'xmlhttprequest'});
      yield I.sendGetRequest('/headers', { 'Content-Type': 'application/json'}).then((resp) => {
        resp.body.should.have.property('content-type');
        resp.body['content-type'].should.eql('application/json');

        resp.body.should.have.property('x-test');
        resp.body['x-test'].should.eql('test');

        resp.body.should.have.property('http_x_requested_with');
        resp.body['http_x_requested_with'].should.eql('xmlhttprequest');
      });


    });
  });

});