// Based on http://alc.comuf.com/milambda.php
fs=require('fs');

var ITERS_PER_SEC = 100000;
var TIMEOUT_SECS = 30;
var ERROR_INTERRUPT = "ERROR_INTERRUPT";
var ERROR_TIMEOUT = "ERROR_TIMEOUT";
var ERROR_NOHALT = "ERROR_NOHALT";

var code, store, Pointer, ip_x, ip_y, dir, input_ptr, mem;
var input, timeout, width, iterations, running;

function stop() {
running = false;
}

function interrupt() {
error(ERROR_INTERRUPT);
}

function error(msg) {
process.stderr.write(msg);
stop();
}

function run() {

code = fs.readFileSync(process.argv[2],{encoding:'utf-8'});
input = fs.readFileSync('/dev/stdin',{encoding:'utf-8'});
timeout = 0;
	
code = code.split("\n");
width = 0;
for (var i = 0; i < code.length; ++i){
	if (code[i].length > width){ 
		width = code[i].length;
	}
}
	
running = true;
dir = 0;
ip_x = 0;
ip_y = 0;
input_ptr = 0;
Pointer = 0;
store = 0;
mem = [];
	
input = input.split("").map(function (s) {
		return s.charCodeAt(0);
	});
	
iterations = 0;

Pointer_iter();
}

function Pointer_iter() {
while (running) {
	var inst; 
	try {
		inst = code[ip_y][ip_x];
	}
	catch(err) {
		inst = "";
	}
	switch (inst) {
		case ">":
			dir = 0;
			break;
		case "<":
			dir = 1;
			break;
		case "^":
			dir = 2;
			break;
		case "v":
			dir = 3;
			break;
		case "Δ":
			if(++Pointer > 255)
				Pointer = 0;
			break;
		case "δ":
			if(--Pointer < 0)
				Pointer = 255;
			break;
        case "E":
			Pointer+=10;
            if(Pointer > 256)
				Pointer = 0;
			break;
        case "ε":
            Pointer-=10;
			if(Pointer < 0)
				Pointer = 0;
			break;
        case "ς":     
			Pointer = 0;
			break;
		case "Θ":
			process.stdout.write(String.fromCharCode(Pointer));
			break;
		case "θ":
			process.stdout.write(""+Pointer);
			break;
		case "Ι":
			dir ^= 2;
			break;
		case "ι":
			dir ^= 3;
			break;
		case "Ζ":
			if (Pointer != 0) {
				dir ^= 1;
			}
			break;
		case "ζ":
			if (Pointer == 0) {
				dir ^= 1;
			}
			break;
		case "_":
			switch (dir) {
			case 2:
				dir = 3;
				break;
			case 3:
				dir = 2;
				break;
			}
			break;
		case "|":
			switch (dir) {
			case 0:
				dir = 1;
				break;
			case 1:
				dir = 0;
				break;
			}
			break;
		case "λ":
			stop();
			break;
		case "Ξ":
			store = Pointer;
			break;
		case "ξ":
			Pointer = store;
			break;
		case "s":
			mem[Pointer] = store;
			break;
		case "g":
			store = mem[Pointer];
			break;
		case "P":
			mem[store] = Pointer;
			break;
		case "ρ":
			Pointer = mem[store];
			break;
		case "σ":
			if (Pointer != store) {
				dir = 2;
			}
			break;
		case "Σ":
			if (Pointer != store) {
				dir = 3;
			}
			break;
		case "`":
			--store;
			break;
		case "'":
			++store;
			break;
		case "Υ":
			if (store != 0) {
				dir = 1;
			}
			break;
		case "υ":
			if (store != 0) {
				dir = 0;
			}
			break;
		case "π":
			if (input_ptr >= input.length) {
				Pointer = 0;
			} else {
				Pointer = input[input_ptr];
				++input_ptr;
			}
			break;
		}
	switch (dir) {
		case 0:
			ip_x++;
			break;
		case 1:
			ip_x--;
			break;
		case 2:
			ip_y--;
			break;
		case 3:
			ip_y++;
			break;
	}
	if (running && (ip_x < 0 || ip_y < 0 || ip_x >= width || ip_y >= code.length)) {
		error(ERROR_NOHALT);
	}
	++iterations;
	if (iterations > ITERS_PER_SEC * TIMEOUT_SECS) {
		error(ERROR_TIMEOUT);
	}
}
}
run();
