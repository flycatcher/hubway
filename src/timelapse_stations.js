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
    function readStations(file) {
        var fs = require("fs");
        var Station = require("./station");
        var result = {};
        fs.readFileSync(file).toString().split("\n").forEach(function(line) {
            var tokens, id, name, lat, lng;
            if (line && line.length) {
                tokens = line.split(",");
                if (tokens.length >= 8 && !isNaN(parseInt(tokens[0]))) {
                    id = parseInt(tokens[0]), name = tokens[2];
                    lat = parseFloat(tokens[6]), lng = parseFloat(tokens[7]);
                    result[id] = new Station(id, name, lat, lng);
                }
            }
        });
        return result;
    }

    function readTrips(file) {
        var fs = require("fs");
        var Trip = require("./trip");
        var result = [];
        fs.readFileSync(file).toString().split("\n").forEach(function(line) {
            var tokens, trip;
            if (line && line.length) {
                tokens = line.split(",");
                if (tokens.length < 12 || isNaN(parseInt(tokens[0]))) {
                    return;
                } else if (isNaN(parseInt(tokens[4]))) {
                    return;
                } else if (isNaN(parseInt(tokens[6]))) {
                    return;
                }
                trip = new Trip();
                trip.startDate(new Date(tokens[3]));
                trip.startStationId(parseInt(tokens[4]));
                trip.endDate(new Date(tokens[5]));
                trip.endStationId(parseInt(tokens[6]));
                result.push(trip);
            }
        });
        result.sort(function(x, y) {
            return x.startDate() - y.startDate();
        });
        return result;
    }

    function restock(stations) {
        var stationId;
        for (stationId in stations) {
            stations[stationId].usage = 0;
        }
    }

    function initStationTrends(stations) {
        var result = {}, stationId, station;
        for (stationId in stations) {
            station = stations[stationId];
            result[stationId] = {
                id : station.id(),
                trend : 0,
                capacity : 0,
                usage : 0
            };
        }
        return result;
    }

    function cool(trends, decay) {
        var stationId, station;
        for (stationId in trends) {
            station = trends[stationId];
            sation.trend *= decay;
        }
    }

    function generateTimeLapseData(file, stations, trips, rate, period, decay) {
        var fs = require("fs");
        var util = require("util");
        var stream = fs.createWriteStream(file);
        stream.once("open", function() {
            var trip, str, station;
            var trends = initStationTrends(stations);
            var startTime = trips[0].startDate().getTime();
            // 1 day === 86400000 milliseconds
            var nextPeriod = new Date(startTime + reset * 86400000);
            var nextFrame = new Date(startTime + rate * 1000);
            for (trip in trips) {
                startTime = trip.startDate();
                if (startTime > nextPeriod) {
                    restock(trends);
                    nextPeriod = new Date(startTime + reset * 86400000);
                } else {
                    trends[trip.endStationId()].usage -= 1;
                    station = trends[trip.startStationId()];
                    station.usage += 1;
                    if (station.usage > station.capacity) {
                        station.capacity = station.usage;
                    }
                }
                while (startTime > nextFrame) {
                    cool(trends);
                    str = util.format("%s,%s\n", nextFrame.getTime(), JSON.stringify(trends));
                    stream.write(str);
                    nextFrame = new Date(nextFrame.getTime() + rate * 1000);
                }
                trends[trip.startStationId()].trend += 1;
            }
        });
    }

    function main() {
        var ArgumentParser = require("argparse").ArgumentParser;
        var parser = new ArgumentParser({
            version : "0.0.1",
            addHelp : true,
            description : "Hubway data challenge: Time lapse data generator"
        });

        parser.addArgument([ "-s", "--stations" ], {
            help : "Hubway stations file (csv)",
            required : true
        });
        parser.addArgument([ "-t", "--trips" ], {
            help : "Hubway trips file (csv)",
            required : true
        });
        parser.addArgument([ "-o", "--output" ], {
            help : "Station capacity analysis output",
            required : true
        });
        parser.addArgument([ "-f", "--rate" ], {
            help : "Number of seconds per frame",
            type : "float",
            defaultValue : 3600
        });
        parser.addArgument([ "-r", "--reset" ], {
            help : "Number of days after which all stations are restocked",
            type : "float",
            defaultValue : 1
        });

        var args = parser.parseArgs();
        var stations = readStations(args["stations"]);
        var trips = readTrips(args["trips"]);
        generateTimeLapseData(args["output"], stations, trips, args["rate"], args["reset"]);
    }

    main();
})();