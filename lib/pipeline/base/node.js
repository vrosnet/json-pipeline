'use strict';

function Node(opcode) {
  this.index = null;
  this.control = [];
  this.opcode = opcode;
  this.inputs = [];
  this.literals = [];
  this.uses = [];
  this.controlUses = [];
}
module.exports = Node;

Node.create = function create(opcode) {
  return new Node(opcode);
};

Node.prototype._use = function _use(other, index, control) {
  if (control)
    this.controlUses.push(other, index);
  else
    this.uses.push(other, index);
};

Node.prototype._unuse = function _unuse(node, index, control) {
  var uses = control ? this.controlUses : this.uses;

  for (var i = uses.length - 2; i >= 0; i -= 2)
    if (uses[i] === node && uses[i + 1] === index)
      break;

  // No such use found
  if (i < 0)
    return;

  var lastIndex = uses.pop();
  var lastNode = uses.pop();

  // Removed last use
  if (i === uses.length)
    return;

  // Replace with the last one
  uses[i] = lastNode;
  uses[i + 1] = lastIndex;
};

Node.prototype.addInput = function addInput(other) {
  other._use(this, this.inputs.length, false);
  this.inputs.push(other);
  return this;
};

Node.prototype.addLiteral = function addLiteral(literal) {
  this.literals.push(literal);
  return this;
};

Node.prototype.setControl = function setControl(left, right) {
  if (right) {
    this.control = [ left, right ];
    left._use(this, 0, true);
    right._use(this, 1, true);
  } else {
    this.control = [ left ];
    left._use(this, 0, true);
  }
  return this;
};

Node.prototype.replace = function replace(other) {
  for (var i = 0; i < this.uses.length; i += 2) {
    var node = this.uses[i];
    var index = this.uses[i + 1];

    node.inputs[index] = other;
  }
  this.uses = [];
};
