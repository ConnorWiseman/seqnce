/**
 * @file Tests for lib/index.js
 */
'use strict';


const chai           = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon          = require('sinon');
const sinonChai      = require('sinon-chai');
chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);


const sequence = require('../lib/');


describe('sequence', function() {
  it('should export a function', function() {
    sequence.should.be.a('function');
  });

  it('should iterate over an array', function(done) {
    var arr = [ 1, 2, 3, 4, 5 ],
        i   = 0;

    sequence(arr, function(results, current, next) {
      current.should.equal(arr[i++]);
      next();
    }, function(results) {
      i.should.equal(arr.length);
      done();
    });
  });

  it('should execute function on each array element', function(done) {
    var arr = [ 1, 2, 3, 4, 5 ];

    var fnStub = sinon.stub().callsFake(function(results, current, next) {
      next();
    });

    sequence(arr, fnStub, function(results) {
      fnStub.callCount.should.equal(arr.length);
      done();
    });
  });

  it('should accumulate results in array', function(done) {
    var arr = [ 1, 2, 3, 4, 5 ];

    sequence(arr, function(results, current, next) {
      results.push(current * 2);
      next();
    }, function(results) {
      results.should.be.an('array');
      done();
    });
  });

  it('should correctly accumulate results', function(done) {
    var arr = [ 1, 2, 3, 4, 5 ];

    sequence(arr, function(results, current, next) {
      results.push(current * 2);
      next();
    }, function(results) {
      results.should.deep.equal([2, 4, 6, 8, 10]);
      done();
    });
  });

  it('should work when used with Promises', function(done) {
    var arr = [ 1, 2, 3, 4, 5 ];

    var p = new Promise(function(resolve, reject) {
      sequence(arr, function(results, current, next) {
        results.push(current * 2);
        next();
      }, resolve);
    });

    p.then(function(results) {
      results.should.deep.equal([2, 4, 6, 8, 10]);
    }).should.be.fulfilled.notify(done);
  });

  it('should work when used with Promises that reject', function(done) {
    var arr = [ 1, 2, 3, 4, 5 ];

    var p = new Promise(function(resolve, reject) {
      sequence(nums, function(results, num, next) {
        var result = num * 2;

        if (result >= 10) {
          reject(new RangeError('Result value larger than ten'));
        }

        results.push(result);
        next();
      }, resolve);
    });

    p.then(function(results) {
      results.should.deep.equal([2, 4, 6, 8, 10])
    }).should.be.rejected.notify(done);
  });
});
