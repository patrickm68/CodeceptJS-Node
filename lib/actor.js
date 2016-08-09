'use strict';
let Step = require('./step');
let container = require('./container');
let methodsOfObject = require('./utils').methodsOfObject;
let recorder = require('./recorder');

/**
 * Fetches all methods from all enabled helpers,
 * and makes them available to use from I. object
 * Wraps helper methods into promises.
 */
module.exports = function (obj) {
  obj = obj || {};

  let helpers = container.helpers();
  Object.keys(helpers)
    .map(function (key) { return helpers[key];})
    .forEach((helper) => {
      methodsOfObject(helper, 'Helper')
      .filter((method) => {
        return method !== 'constructor' && method[0] !== '_';})
      .forEach((action) => {
        let actionAlias = container.translation().actionAliasFor(action);

        obj[action] = obj[actionAlias] = function () {
          let args = arguments;
          let step = new Step(helper, action);
          if (container.translation().loaded) {
            step.name = actionAlias;
            step.actor = container.translation().I;
          }
          recorder.addStep(step, args);
          return recorder.promise();
        };
      });
    });

  return obj;
};
