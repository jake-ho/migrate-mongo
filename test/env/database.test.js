'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('database', function () {

  let database; // module under test
  let configFile, mongodb, client; // mocked dependencies

  beforeEach(function () {
    client = mockClient();
    configFile = mockConfigFile();
    mongodb = mockMongodb();

    database = proxyquire('../../lib/env/database', {
      './configFile': configFile,
      'mongodb': mongodb,
    });
  });

  describe('connect()', function () {
    it('should connect MongoClient to the configured mongodb url with the configured options', function (done) {
      database.connect((err, db) => {
        expect(mongodb.MongoClient.connect.called).to.equal(true);
        expect(mongodb.MongoClient.connect.getCall(0).args[0])
          .to.equal('mongodb://someserver:27017');

        expect(mongodb.MongoClient.connect.getCall(0).args[1])
          .to.deep.equal({
          connectTimeoutMS: 3600000, // 1 hour
          socketTimeoutMS: 3600000, // 1 hour
        });

        expect(client.db.getCall(0).args[0]).to.equal('testDb');
        expect(db).to.deep.equal({ the: 'db' });
        done();
      });
    });
  });

  function mockClient() {
    return {
      db: sinon.stub().returns({ the: 'db' }),
    };
  }

  function mockConfigFile() {
    return {
      read: sinon.stub().returns({
        mongodb: {
          url: 'mongodb://someserver:27017',
          databaseName: 'testDb',
          options: {
            connectTimeoutMS: 3600000, // 1 hour
            socketTimeoutMS: 3600000, // 1 hour
          }
        }
      })
    };
  }

  function mockMongodb() {
    return {
      MongoClient: {
        connect: sinon.stub().yields(null, client),
      }
    };
  }

});