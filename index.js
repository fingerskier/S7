var S7 = require('./S7')()

var PLC = S7.emitter


PLC.on('periodic', (msg)=>{
	console.dir(S7.options())
})

PLC.on('initialized', ()=>{
	console.log('initialization successful')
})

S7.initialize()