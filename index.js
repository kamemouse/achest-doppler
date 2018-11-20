const http = require('http');
const fs = require("fs");
const url = require("url");
const path = require("path");
const ip = require('ip');
const STATIC_PORT = 8124;
const WS_PORT = 5001;

var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
let dopvalue = '(no signals)';

// ====================
// static server
// ====================
http.createServer((request, response) => {
		// 参考: node.jsでシンプルなwebサーバー
		// https://qiita.com/_shimizu/items/094c4beace9c7a36deb1
    var Response = {
        "200":function(file, filename){
            var extname = path.extname(filename);
            var header = {
                "Access-Control-Allow-Origin":"*",
                "Pragma": "no-cache",
                "Cache-Control" : "no-cache"
            }

            response.writeHead(200, header);
            response.write(file, "binary");
            response.end();
        },
        "404":function(){
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();

        },
        "500":function(err){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();

        }
    }


    var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

    fs.exists(filename, function(exists){
        // console.log(filename+" "+exists);
        if (!exists) { Response["404"](); return ; }
        if (fs.statSync(filename).isDirectory()) { filename += '/index.html'; }

        fs.readFile(filename, "binary", function(err, file){
        if (err) { Response["500"](err); return ; }
            Response["200"](file, filename);
        });

    });
	// response.writeHead(200, {'Content-Type': 'text/html'});
	// let text = '<html><head><meta http-equiv="refresh" content="1"; URL=""></head>';
	// response.end(text + 'Hello World!</html>\n');
}).listen(STATIC_PORT);




// ====================
// WebSocket server
// ====================
// 参考: 5分で動かせるwebsocketのサンプル3つ
// サンプル1
// https://qiita.com/okumurakengo/items/a8ccea065f5659d1a1de
var server = require('ws').Server;
var s = new server({port:WS_PORT});

s.on('connection',function(ws){
		console.log('Client connected');
		ws.send(dopvalue)

    // ws.on('message',function(message){
    //     console.log("Received: "+message);
    //
    //     s.clients.forEach(function(client){
    //         client.send(message+' : '+new Date());
    //     });
    // });

    ws.on('close',function(){
        console.log('Client disconnected');
    });

});


// ====================
// console
// ====================
// 参考: Node.jsの標準入力と
// https://qiita.com/hiroqn@github/items/c927bc97780c34eda562
reader.on('line', function (line) {
	s.clients.forEach(function(client){
		dopvalue = line;
	    client.send(dopvalue);
	});

	if(line == 'q'){
		process.exit(0);
	}
});
reader.on('close', function () {
	process.exit(0);
});




console.log(`Server running at http://${ip.address()}:${STATIC_PORT}/`);
console.log(`Server running at ws://${ip.address()}:${WS_PORT}/`);



