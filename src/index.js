'use strict'

const protobuf = require('protons')
const assert = require('assert')
const PeerRequest = require('peer-request')
const validate = require('./zero/verify')

function protoparse (def, isout) {
  let r = 'message PeerCmd {'
  if (def._) {
    r += def._
    delete def._
  }
  if (isout) {
    Object.keys(def).map(i => parseInt(i, 10)).reverse().forEach(i => {
      def[i + 1] = def[i]
    })
    def['1'] = ['string', 'error']
  }
  for (var i in def) {
    const v = def[i]
    r += v[0] + ' ' + v[1] + ' = ' + i + ' ;'
  }
  r += '}'
  return r
}

function PeerMSG (def, isout) {
  const self = this
  self.proto = {}
  self.proto.def = protoparse(def.protobuf, isout)
  self.proto.msg = protobuf(self.proto.def).PeerCmd
  self.strict = def.strict
}

function Protocol () {
  const self = this
  const protos = self.protos = {}
  let lp2p, zero
  self.handle = (name, opt, handler) => {
    assert(opt.in, 'input definition missing')
    if (!opt.out) opt.out = opt.in

    const p = protos[name] = {
      _opt: opt,
      in: new PeerMSG(opt.in),
      out: new PeerMSG(opt.out, true),
      handler
    }

    p.peerRequest = new PeerRequest(name, p.in.strict, p.out.strict, validate)

    if (lp2p && !opt.zero_only) {
      lp2p.protocol.handle(name, p)
    }
    if (zero && !opt.lp2p_only) {
      zero.protocol.handle(name, p.out.strict, p.in.strict, handler)
    }
  }

  self.setLp2p = l => (lp2p = l)
  self.setZero = z => (zero = z)
}

module.exports = Protocol
module.exports.PeerMSG = PeerMSG
module.exports.Zero = require('./zero')
module.exports.Lp2p = require('./lp2p')
module.exports.Validate = validate
