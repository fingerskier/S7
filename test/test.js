var chai = require('chai')

var assert = chai.assert
var expect = chai.expect


var S7 = require('../S7')()
var PLC = S7.emitter


describe('S7', ()=>{
	describe('features', ()=>{
		it('emitter exists', ()=>{
			assert.isNotNull(S7.PLCevents)
		})
	
		describe('.options()', ()=>{
			it('should accept new config parameters', ()=>{
				var testID = 'test_'+randomInteger(1, 43)

				S7.options({connectionID:testID})

				var config = S7.options()

				assert.equal(config.connectionID, testID)
			})

			it('options() returns the options structure', ()=>{
				var config = S7.options()

				assert.isNotNull(config.connectionID)
			})		
		})
	})

	describe('S7 events', ()=>{
		expect('emitter should exist', ()=>{
			assert.isNotNull(S7.emitter)
		})

		it('after initialize it should be initialized', (done)=>{
			PLC.on('initialized', ()=>{
				done()
			})

			PLC.emit('initialize')
		})

		it('after connect it should be connected', (done)=>{
			PLC.on('connected', ()=>{
				done()
			})

			PLC.emit('connect')
		}).timeout(5000)
	})
})


function randomInteger(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min)) + min;
}
