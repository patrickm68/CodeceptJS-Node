'use strict';

let Assertion = require('../../../lib/assert/include').Assertion;
let AssertionError = require('../../../lib/assert/error');
let chai = require('chai');
let should = require('chai').should();
let equal;

describe('equal assertion', () => {

  beforeEach(() => {
    equal = new Assertion({jar: 'contents of webpage'});
  });

  it('should check for inclusion', () => {
    equal.assert('h', 'hello');
    chai.expect(() => equal.negate('h', 'hello')).to.throw(AssertionError);
  });

  it('should check !include', () => {
    equal.negate('x', 'hello');
    chai.expect(() => equal.assert('x', 'hello')).to.throw(AssertionError);
  });

  it('should provide nice assert error message', () => {
    equal.params.needle = 'hello';
    equal.params.haystack = 'x';
    let err = equal.getFailedAssertion();
    err.inspect().should.equal('expected contents of webpage to include "hello"');
  });

  it('should provide nice negate error message', () => {
    equal.params.needle = 'hello';
    equal.params.haystack = 'h';
    let err = equal.getFailedNegation();
    err.inspect().should.equal('expected contents of webpage not to include "hello"');
  });
});
