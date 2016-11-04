NodeS7 Addressing


Format:
	`<data-type>,<address>`

	`<address> = <addr-type><offset>`

	`<offset> = <byte>.<bit>`
	OR
	`<offset> = <start>.<num-items>`

DB#,TYPE#.#
	DB	~	data-block
	#	~	the data-block number


Data Types
	4-byters
	"REAL"	~
	"DWORD"	~
	"DINT"	~

	2-byters
	"INT"	~
	"WORD"	~
	"TIMER"	~
	"COUNTER"	~

	1-byters
	"X"	~	bit
	"B"	~	bit
	"C"	~	char
	"BYTE"	~
	"CHAR"	~

	n-byters
	"S"	~	string
	"STRING"	~


Address Types
	"DB"	~	data-block
	"I"	~	input
	"Q"	~	output
	"M"	~	memory
	"P"	~	process-image
	"C"	~	counter
	"T"	~	timer
