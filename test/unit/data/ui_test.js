const Mocha = require('mocha/lib/mocha');
const makeUI = require('../../../lib/ui');
const addData = require('../../../lib/data/context');
const DataTable = require('../../../lib/data/table');
const Suite = require('mocha/lib/suite');
const should = require('chai').should();

describe('ui', () => {
  let suite;
  let context;
  let dataTable;

  beforeEach(() => {
    context = {};
    suite = new Suite('empty');
    makeUI(suite);
    suite.emit('pre-require', context, {}, new Mocha());
    addData(context);

    dataTable = new DataTable(['login', 'password']);
    dataTable.add(['jon', 'snow']);
    dataTable.xadd(['tyrion', 'lannister']);
    dataTable.add(['jaime', 'lannister']);
  });

  describe('Data', () => {
    it('can add a tag to all scenarios', () => {
      dataScenarioConfig = context.Data(dataTable).Scenario('scenario', () => {});

      dataScenarioConfig.tag('@user');

      dataScenarioConfig.scenarios.forEach((scenario) => {
        scenario.test.tags.should.include('@user');
      });
    });

    it('can add a timout to all scenarios', () => {
      dataScenarioConfig = context.Data(dataTable).Scenario('scenario', () => {});

      dataScenarioConfig.timeout(3);

      dataScenarioConfig.scenarios.forEach(scenario => should.equal(3, scenario.test._timeout));
    });

    it('can add retries to all scenarios', () => {
      dataScenarioConfig = context.Data(dataTable).Scenario('scenario', () => {});

      dataScenarioConfig.retry(3);

      dataScenarioConfig.scenarios.forEach(scenario => should.equal(3, scenario.test._retries));
    });

    it('can expect failure for all scenarios', () => {
      dataScenarioConfig = context.Data(dataTable).Scenario('scenario', () => {});

      dataScenarioConfig.fails();

      dataScenarioConfig.scenarios.forEach(scenario => should.exist(scenario.test.throws));
    });

    it('can expect a specific error for all scenarios', () => {
      const err = new Error();

      dataScenarioConfig = context.Data(dataTable).Scenario('scenario', () => {});

      dataScenarioConfig.throws(err);

      dataScenarioConfig.scenarios.forEach(scenario => should.equal(err, scenario.test.throws));
    });

    it('can configure a helper for all scenarios', () => {
      const helperName = 'myHelper';
      const helper = {};

      dataScenarioConfig = context.Data(dataTable).Scenario('scenario', () => {});

      dataScenarioConfig.config(helperName, helper);

      dataScenarioConfig.scenarios.forEach(scenario => should.equal(helper, scenario.test.config[helperName]));
    });
  });
});
