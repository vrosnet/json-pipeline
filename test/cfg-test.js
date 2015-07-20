var assert = require('assert');

var pipeline = require('../');

var fixtures = require('./fixtures');

describe('JSON CFG Builder', function() {
  var p;
  beforeEach(function() {
    p = pipeline.create('cfg');
  });

  it('should generate CFG', function() {
    var start = p.block('start');
    var one = p.add('literal').addLiteral(1);
    var two = p.add('literal').addLiteral(2);
    var add = p.add('add', [ one, two ]);
    var branch = p.addControl('if', [ add ]);

    var left = p.jumpFrom(start);

    var x0 = p.add('literal').addLiteral('ok');
    var leftEnd = p.addControl('jump');

    var right = p.jumpFrom(start);

    var x1 = p.add('literal').addLiteral('not-ok');
    var rightEnd = p.addControl('jump');

    var merge = p.merge(left, right);
    var phi = p.addControl('phi', [ x0, x1 ]);
    p.addControl('return', [ phi ]);

    // Normal export
    assert.deepEqual(p.render('json'), fixtures.json.p1);

    // CFG export
    assert.deepEqual(p.render({ cfg: true }, 'json'), fixtures.json.p1cfg);
  });
});
