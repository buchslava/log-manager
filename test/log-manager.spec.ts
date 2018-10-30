import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { LogManager, LogLevel, StorageLogger } from '../src/index';

chai.use(chaiAsPromised);

const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('logging', () => {
  afterEach(() => {
    sandbox.restore();
  });

  it('with output to console', () => {
    const logStub = sandbox.stub(console, 'log');

    const firstLogger = new LogManager('@first', LogLevel.ALL);
    const secondLogger = new LogManager('@second', LogLevel.ALL);

    firstLogger.addOutputTo(secondLogger);
    secondLogger.addOutputTo(console);

    firstLogger.log('notice 1', LogLevel.ALL);
    secondLogger.log('notice 2', LogLevel.ALL);

    sinon.assert.calledTwice(logStub);

  });

  it('with output to array', () => {
    const firstLogger = new LogManager('@first', LogLevel.ALL);
    const secondLogger = new LogManager('@second', LogLevel.ALL);

    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    secondLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.ALL);
    secondLogger.log('notice 2', LogLevel.ALL);

    const result = storageLogger.getContent();
    const briefResult = result.map(record => {
      delete record.time;

      return record;
    });
    const expectedResult = [
      { message: 'notice 1', id: '@first' },
      { message: 'notice 2', id: '@second' }
    ];

    expect(briefResult).to.deep.equal(expectedResult);
  });

  it('with 3 loggers', () => {
    const firstLogger = new LogManager('@first', LogLevel.ALL);
    const secondLogger = new LogManager('@second', LogLevel.ALL);
    const thirdLogger = new LogManager('@third', LogLevel.ALL);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.ALL);
    secondLogger.log('notice 2', LogLevel.ALL);
    thirdLogger.log('notice 3', LogLevel.ALL);

    const result = storageLogger.getContent();
    const briefResult = result.map(record => {
      delete record.time;

      return record;
    });
    const expectedResult = [
      { message: 'notice 1', id: '@first' },
      { message: 'notice 2', id: '@second' },
      { message: 'notice 3', id: '@third' }
    ];

    expect(briefResult).to.deep.equal(expectedResult);
  });

  it('log list should be EMPTY if log levels DOES NOT matched', () => {
    const firstLogger = new LogManager('@first', LogLevel.ERROR);
    const secondLogger = new LogManager('@second', LogLevel.ERROR);
    const thirdLogger = new LogManager('@third', LogLevel.ERROR);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.DEBUG);
    secondLogger.log('notice 2', LogLevel.DEBUG);
    thirdLogger.log('notice 3', LogLevel.DEBUG);

    const result = storageLogger.getContent();

    expect(result.length).to.be.equal(0);
  });

  it('log list should be EMPTY if log levels DOES NOT matched case #2', () => {
    const firstLogger = new LogManager('@first', LogLevel.ERROR);
    const secondLogger = new LogManager('@second', LogLevel.DEBUG);
    const thirdLogger = new LogManager('@third', LogLevel.REPLICATION);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.REPLICATION);
    secondLogger.log('notice 2', LogLevel.ERROR);
    thirdLogger.log('notice 3', LogLevel.DEBUG);

    const result = storageLogger.getContent();

    expect(result.length).to.be.equal(0);
  });

  it('log list should be proper if log levels are matched EXACTLY', () => {
    const firstLogger = new LogManager('@first', LogLevel.ERROR);
    const secondLogger = new LogManager('@second', LogLevel.REPLICATION);
    const thirdLogger = new LogManager('@third', LogLevel.DEBUG);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.ERROR);
    secondLogger.log('notice 2', LogLevel.REPLICATION);
    thirdLogger.log('notice 3', LogLevel.DEBUG);


    const result = storageLogger.getContent();
    const briefResult = result.map(record => {
      delete record.time;

      return record;
    });
    const expectedResult = [
      { message: 'notice 1', id: '@first' },
      { message: 'notice 2', id: '@second' },
      { message: 'notice 3', id: '@third' }
    ];

    expect(briefResult).to.deep.equal(expectedResult);
  });

  it('log list should be proper if log levels are matched by the MASK', () => {
    const firstLogger = new LogManager('@first', LogLevel.ERROR);
    const secondLogger = new LogManager('@second', LogLevel.REPLICATION | LogLevel.DEBUG);
    const thirdLogger = new LogManager('@third', LogLevel.DEBUG | LogLevel.REPLICATION);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.REPLICATION);
    secondLogger.log('notice 2', LogLevel.DEBUG);
    thirdLogger.log('notice 3', LogLevel.REPLICATION);

    const result = storageLogger.getContent();
    const briefResult = result.map(record => {
      delete record.time;

      return record;
    });
    const expectedResult = [
      { message: 'notice 2', id: '@second' },
      { message: 'notice 3', id: '@third' }
    ];

    expect(briefResult).to.deep.equal(expectedResult);
  });

  it('log list should be proper if log levels are matched by the MASK case #2', () => {
    const firstLogger = new LogManager('@first', LogLevel.ERROR);
    const secondLogger = new LogManager('@second', LogLevel.REPLICATION | LogLevel.DEBUG);
    const thirdLogger = new LogManager('@third', LogLevel.DEBUG | LogLevel.REPLICATION);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.ERROR);
    secondLogger.log('notice 2', LogLevel.DEBUG);
    thirdLogger.log('notice 3', LogLevel.REPLICATION);

    const result = storageLogger.getContent();
    const briefResult = result.map(record => {
      delete record.time;

      return record;
    });
    const expectedResult = [
      { message: 'notice 1', id: '@first' },
      { message: 'notice 2', id: '@second' },
      { message: 'notice 3', id: '@third' }
    ];

    expect(briefResult).to.deep.equal(expectedResult);
  });

  it('log list should be proper if log levels are matched by the MASK with namy messages per the logger', () => {
    const firstLogger = new LogManager('@first', LogLevel.ERROR);
    const secondLogger = new LogManager('@second', LogLevel.REPLICATION | LogLevel.DEBUG);
    const thirdLogger = new LogManager('@third', LogLevel.DEBUG | LogLevel.REPLICATION);

    secondLogger.addOutputTo(thirdLogger);
    firstLogger.addOutputTo(secondLogger);

    const storageLogger = new StorageLogger();

    thirdLogger.addOutputTo(storageLogger);

    firstLogger.log('notice 1', LogLevel.ERROR);
    firstLogger.log('notice 11', LogLevel.ERROR);
    firstLogger.log('notice 111', LogLevel.ERROR);
    secondLogger.log('notice 2', LogLevel.DEBUG);
    secondLogger.log('notice 22', LogLevel.DEBUG);
    secondLogger.log('notice 222', LogLevel.DEBUG);
    thirdLogger.log('notice 3', LogLevel.REPLICATION);
    thirdLogger.log('notice 33', LogLevel.REPLICATION);
    thirdLogger.log('notice 333', LogLevel.REPLICATION);

    const result = storageLogger.getContent();
    const briefResult = result.map(record => {
      delete record.time;

      return record;
    });
    const expectedResult = [
      { message: 'notice 1', id: '@first' },
      { message: 'notice 11', id: '@first' },
      { message: 'notice 111', id: '@first' },
      { message: 'notice 2', id: '@second' },
      { message: 'notice 22', id: '@second' },
      { message: 'notice 222', id: '@second' },
      { message: 'notice 3', id: '@third' },
      { message: 'notice 33', id: '@third' },
      { message: 'notice 333', id: '@third' }
    ];

    expect(briefResult).to.deep.equal(expectedResult);
  });
});
