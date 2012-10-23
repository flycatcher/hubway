/**
 * @license Copyright (C) 2012, Jun Mei
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function() {
    function handler(req, res) {
        var fs = require("fs");
        fs.readFile(__dirname + '/index.html', function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
    }

    function readTimelapse(file) {
        var fs = require("fs");
        var result = [];
        fs.readFileSync(file).toString().split("\n").forEach(function(line) {
            if (line && line.length) {
                var idx = line.indexOf(",");
                result.push({
                    time : new Date(parseInt(line.substring(0, idx))),
                    stations : JSON.parse(line.substr(idx + 1))
                });
            }
        });
        return result;
    }

    function main() {
        var ArgumentParser = require("argparse").ArgumentParser;

        var parser = new ArgumentParser({
            version : "0.0.1",
            addHelp : true,
            description : "Hubway data challenge: Time lapse data server"
        });

        parser.addArgument([ "-d", "--data" ], {
            help : "Hubway stations time lapse data file",
            defaultValue : "./results/timelapse.txt"
        });

        var args = parser.parseArgs();
        var data = readTimelapse(args["data"]);

        var app = require("http").createServer(handler);
        var io = require("socket.io").listen(app);
        io.set("log level", 1);

        app.listen(8080);

        io.sockets.on("connection", function(socket) {
            var idx = 0;
            socket.emit("ready", {});
            socket.on("next", function() {
                if (idx < data.length) {
                    socket.emit("data", data[idx]);
                    idx += 1;
                }
            });
        });
    }

    main();
})();