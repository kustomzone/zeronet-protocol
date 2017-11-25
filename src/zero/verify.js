'use strict'

function debugDef (d_, ar) {
  let def = {}
  if (ar) {
    d_ = {
      _: ar
    }
  }
  for (var key in d_) {
    def[key] = Array.isArray(d_[key]) ? d_[key] : [d_[key]]
    def[key] = def[key].map(e => typeof e === 'function' ? '[function] ' + e.toString().split('\n')[0] : e)
    if (def[key].length === 1) def[key] = def[key][0]
  }
  return ar ? def._ : def
}

function verifyProtocol (def, param) {
  // validate if "param" matches "def"
  if (!param || typeof param !== 'object') throw new Error('Param is false')
  try {
    for (var p in def) {
      let dd
      if (!Array.isArray(def[p])) dd = [def[p]]
      else dd = def[p]
      let v = false
      let le // last error
      /* jshint ignore: start */
      dd.forEach(d => { // eslint-disable-line
        if (v) return
        switch (typeof d) {
          case 'function':
            if (!d(param[p])) le = new Error('Invalid value for key ' + p + ' (validation function)')
            v = true
            break
          case 'string':
            if (typeof param[p] !== d) le = new Error('Invalid value for key ' + p + ' (type missmatch expected=' + debugDef(dd, true) + ', got=' + typeof param[p] + ')') // eslint-disable-line
            v = true
            break
          default:
            break
        }
      })
      /* jshint ignore: end */
      if (!v) throw le
    }
  } catch (e) {
    e.stack +=
      '\n\n    --- Definition ---\n    ' + JSON.stringify(debugDef(def), null, 2).split('\n').join('\n    ') +
      '\n\n    --- Object ---\n    ' + JSON.stringify(param, null, 2).split('\n').join('\n    ')
    throw e
  }
}

module.exports = verifyProtocol