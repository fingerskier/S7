const EventEmitter = require('events')

class Emitter extends EventEmitter{}

const emitter = new Emitter()


module.exports = emitter

setInterval(()=>{
	emitter.emit('flarn', 'a', 'b')
}, 1000)