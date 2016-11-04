function stringToS7Addr(addr, useraddr) {
	"use strict";
	var theItem, tagAddress, tagOffset;

	if (useraddr === '_COMMERR') { return undefined; } // Special-case for communication error status - this variable returns true when there is a communications error

	theItem = new S7Item();
	tagAddress = addr.split(',');

	if (tagAddress.length === 0 || tagAddress.length > 2) {
		outputLog("Error - String Couldn't Split Properly.");
		return undefined;
	}

	if (tagAddress.length > 1) {
		// Must be DB type
		theItem.addrtype = 'DB';
		tagOffset = tagAddress[1].split('.');
		theItem.datatype = tagOffset[0].replace(/[0-9]/gi, '').toUpperCase(); // Clear the numbers

		if (theItem.datatype === 'X' && tagOffset.length === 3) {
			theItem.arrayLength = parseInt(tagOffset[2], 10);
		} else if (theItem.datatype !== 'X' && tagOffset.length === 2) {
			theItem.arrayLength = parseInt(tagOffset[1], 10);
		} else {
			theItem.arrayLength = 1;
		}
		
		if (theItem.arrayLength <= 0) {
			outputLog('Zero length arrays not allowed, returning undefined');
			return undefined;
		}

		// Get the data block number from the first part.
		theItem.dbNumber = parseInt(tagAddress[0].replace(/[A-z]/gi, ''), 10);

		// Get the data block byte offset from the second part, eliminating characters.
		// Note that at this point, we may miss some info, like a "T" at the end indicating TIME data type or DATE data type or DT data type.  We ignore these.
		// This is on the TODO list.
		theItem.offset = parseInt(tagOffset[0].replace(/[A-z]/gi, ''), 10);  // Get rid of characters

		// Get the bit offset
		if (tagOffset.length > 1 && theItem.datatype === 'X') {
			theItem.bitOffset = parseInt(tagOffset[1], 10);
			if (theItem.bitOffset > 7) {
				outputLog("Invalid bit offset specified for address " + addr);
				return undefined;
			}
		}
	} else { // Must not be DB.  We know there's no comma.
		tagOffset = addr.split('.');

		switch (tagOffset[0].replace(/[0-9]/gi, '')) {
			case "PAW":
			case "PIW":
			case "PEW":
			case "PQW":
				theItem.addrtype = "P";
				theItem.datatype = "INT";
				break;
			case "PAD":
			case "PID":
			case "PED":
			case "PQD":
				theItem.addrtype = "P";
				theItem.datatype = "DINT";
				break;
			case "PAB":
			case "PIB":
			case "PEB":
			case "PQB":
				theItem.addrtype = "P";
				theItem.datatype = "BYTE";
				break;
			case "IB":
			case "IC":
			case "EB":
			case "EC":
				theItem.addrtype = "I";
				theItem.datatype = "BYTE";
				break;
			case "IW":
			case "EW":
			case "II":
			case "EI":
				theItem.addrtype = "I";
				theItem.datatype = "INT";
				break;
			case "QW":
			case "AW":
			case "QI":
			case "AI":
				theItem.addrtype = "Q";
				theItem.datatype = "INT";
				break;
			case "MB":
			case "MC":
				theItem.addrtype = "M";
				theItem.datatype = "BYTE";
				break;
			case "M":
				theItem.addrtype = "M";
				theItem.datatype = "X";
				break;
			case "I":
			case "E":
				theItem.addrtype = "I";
				theItem.datatype = "X";
				break;
			case "Q":
			case "A":
				theItem.addrtype = "Q";
				theItem.datatype = "X";
				break;
			case "MW":
			case "MI":
				theItem.addrtype = "M";
				theItem.datatype = "INT";
				break;
			case "MDW":
			case "MDI":
			case "MD":
				theItem.addrtype = "M";
				theItem.datatype = "DINT";
				break;
			case "MR":
				theItem.addrtype = "M";
				theItem.datatype = "REAL";
				break;
			case "T":
				theItem.addrtype = "T";
				theItem.datatype = "TIMER";
				break;
			case "C":
				theItem.addrtype = "C";
				theItem.datatype = "COUNTER";
				break;
			default:
				outputLog('Failed to find a match for ' + tagOffset[0]);
				return undefined;
		}

		theItem.bitOffset = 0;
		
		if (tagOffset.length > 1 && theItem.datatype === 'X') { // Bit and bit array
			theItem.bitOffset = parseInt(tagOffset[1].replace(/[A-z]/gi, ''), 10);

			if (tagOffset.length > 2) {  // Bit array only
				theItem.arrayLength = parseInt(tagOffset[2].replace(/[A-z]/gi, ''), 10);
			} else {
				theItem.arrayLength = 1;
			}
		}

		if (tagOffset.length > 1 && theItem.datatype !== 'X') { // Bit and bit array
			theItem.arrayLength = parseInt(tagOffset[1].replace(/[A-z]/gi, ''), 10);
		} else {
			theItem.arrayLength = 1;
		}
		
		theItem.dbNumber = 0;
		theItem.offset = parseInt(tagOffset[0].replace(/[A-z]/gi, ''), 10);
	}

	if (theItem.datatype === 'DI') {
		theItem.datatype = 'DINT';
	}

	if (theItem.datatype === 'I') {
		theItem.datatype = 'INT';
	}
	
	if (theItem.datatype === 'DW') {
		theItem.datatype = 'DWORD';
	}
	
	if (theItem.datatype === 'R') {
		theItem.datatype = 'REAL';
	}

	switch (theItem.datatype) {
		case "REAL":
		case "DWORD":
		case "DINT":
			theItem.dtypelen = 4;
			break;
		case "INT":
		case "WORD":
		case "TIMER":
		case "COUNTER":
			theItem.dtypelen = 2;
			break;
		case "X":
		case "B":
		case "C":
		case "BYTE":
		case "CHAR":
			theItem.dtypelen = 1;
			break;
		case "S":
		case "STRING":
			theItem.arrayLength += 2;
			theItem.dtypelen = 1;
			break;
		default:
			outputLog("Unknown data type " + theItem.datatype);
			return undefined;
	}

	// Default
	theItem.readTransportCode = 0x04;

	switch (theItem.addrtype) {
		case "DB":
		case "DI":
			theItem.areaS7Code = 0x84;
			break;
		case "I":
		case "E":
			theItem.areaS7Code = 0x81;
			break;
		case "Q":
		case "A":
			theItem.areaS7Code = 0x82;
			break;
		case "M":
			theItem.areaS7Code = 0x83;
			break;
		case "P":
			theItem.areaS7Code = 0x80;
			break;
		case "C":
			theItem.areaS7Code = 0x1c;
			theItem.readTransportCode = 0x09;
			break;
		case "T":
			theItem.areaS7Code = 0x1d;
			theItem.readTransportCode = 0x09;
			break;
		default:
			outputLog("Unknown memory area entered - " + theItem.addrtype);
			return undefined;
	}

	if (theItem.datatype === 'X' && theItem.arrayLength === 1) {
		theItem.writeTransportCode = 0x03;
	} else {
		theItem.writeTransportCode = theItem.readTransportCode;
	}

	// Save the address from the argument for later use and reference
	theItem.addr = addr;
	
	if (useraddr === undefined) {
		theItem.useraddr = addr;
	} else {
		theItem.useraddr = useraddr;
	}

	if (theItem.datatype === 'X') {
		theItem.byteLength = Math.ceil((theItem.bitOffset + theItem.arrayLength) / 8);
	} else {
		theItem.byteLength = theItem.arrayLength * theItem.dtypelen;
	}

	//	outputLog(' Arr length is ' + theItem.arrayLength + ' and DTL is ' + theItem.dtypelen);

	theItem.byteLengthWithFill = theItem.byteLength;

	if (theItem.byteLengthWithFill % 2) {
		// S7 will add a filler byte.  Use this expected reply length for PDU calculations.
		theItem.byteLengthWithFill += 1;
	}

	return theItem;
}
