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

    function initStationTrends(stations) {
        var stationId, result = {};
        for (stationId in stations) {
            result[stationId] = {
                trend : 0,
                capacity : 0,
                usage : 0
            };
        }
        return result;
    }

    /**
     * Resets the bike usage at each station
     * 
     * @param {Object.<number, Object>} stationTrends
     */
    function restock(stationTrends) {
        var stationId;
        for (stationId in stationTrends) {
            stationTrends[stationId].usage = 0;
        }
    }

    /**
     * Cools the trending score at each station
     * 
     * @param {Object.<number, Object>} stationTrends
     * @param {number} decay The decay rate (should be between 0 and 1)
     */
    function cool(stationTrends, decay) {
        var stationId;
        for (stationId in stationTrends) {
            stationTrends[stationId].trend *= decay;
        }
    }

    function timelapse(file, stations, trips, rate, period, decay) {
        var fs = require("fs");
        var util = require("util");
        var stream = fs.createWriteStream(file);
        stream.once("open", function() {
            var trends = initStationTrends(stations);
            var firstTrip = trips[0].startDate().getTime();
            // 1 day === 86400000 milliseconds
            var nextPeriod = new Date(firstTrip + period * 86400000);
            var nextFrame = new Date(firstTrip + rate * 1000);
            trips.forEach(function(trip) {
                var station, str, startTime = trip.startDate();
                if (startTime > nextPeriod) {
                    restock(trends);
                    nextPeriod = new Date(startTime + period * 86400000);
                } else {
                    trends[trip.endStationId()].usage -= 1;
                    station = trends[trip.startStationId()];
                    station.usage += 1;
                    if (station.usage > station.capacity) {
                        station.capacity = station.usage;
                    }
                }
                while (startTime > nextFrame) {
                    cool(trends, decay);
                    str = util.format("%s,%s\n", nextFrame.getTime(), JSON.stringify(trends));
                    stream.write(str);
                    nextFrame = new Date(nextFrame.getTime() + rate * 1000);
                }
                trends[trip.startStationId()].trend += 1;
            });
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
            defaultValue : "./data/stations.csv"
        });
        parser.addArgument([ "-t", "--trips" ], {
            help : "Hubway trips file (csv)",
            defaultValue : "./data/trips.csv"
        });
        parser.addArgument([ "-o", "--output" ], {
            help : "Station capacity analysis output",
            defaultValue : "./results/timelapse.txt"
        });
        parser.addArgument([ "-f", "--framerate" ], {
            help : "Number of seconds per frame",
            type : "float",
            defaultValue : 3600
        });
        parser.addArgument([ "-r", "--reset" ], {
            help : "Number of days after which all stations are restocked",
            type : "float",
            defaultValue : 1
        });
        parser.addArgument([ "-d", "--decay" ], {
            help : "Station trend decay rate",
            type : "float",
            defaultValue : 0.99995
        });

        var args = parser.parseArgs();
        var stations = readStations(args["stations"]);
        var trips = readTrips(args["trips"]);
        timelapse(args["output"], stations, trips, args["framerate"], args["reset"], args["decay"]);
    }

    main();
})();