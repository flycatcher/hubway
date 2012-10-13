'''
Created on Oct 13, 2012

Copyright (C) 2012, Jun Mei

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
'''
import getopt
import sys
import collections

def load_stations(stations_file):
    result = {}
    for line in open(stations_file):
        if line.startswith('id'):
            continue
        tokens = line.split(',')
        if len(tokens) > 2:
            result.setdefault(tokens[0], tokens[2])
    return result

def compute_station_trending(trips_file, reduction):
    result = collections.defaultdict(float)
    trends = collections.defaultdict(float)
    for line in open(trips_file):
        if line.startswith('"id"'):
            continue
        tokens = line.split(',')
        if len(tokens) < 5:
            continue
        for k, v in trends:
            trends[k] = v * reduction
        station_id = tokens[4]
        trends[station_id] += 1
        if trends[station_id] > result[station_id]:
            result[station_id] = trends[station_id]
    return result

def print_results(trending_scores, stations_map):
    for station_id, score in trending_scores:
        station_name = stations_map.get(station_id, station_id)
        print('{0} {1}'.format(station_name, score))

if __name__ == '__main__':
    options, remainder = getopt.getopt(sys.argv[1:], 's:t:r:', ['stations=', 'trips=', 'reduction='])
    stations_file, trips_file, reduction = '', '', 1
    for o, a in options:
        if o in ("-s", "--stations"):
            stations_file = a
        elif o in ("-t", "--trips"):
            trips_file = a
        elif o in ("-r", "--reduction"):
            reduction = float(a)
    stations_map = load_stations(stations_file)
    trending_scores = compute_station_trending(trips_file, reduction)
    print_results(trending_scores, stations_map)
