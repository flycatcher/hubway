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
    var util = require("util");

    /**
     * Data container representing a Hubway station
     * 
     * @constructor
     * @param {!number} id Unique identifier for the station
     * @param {!string} name The display name and/or address of the station
     * @param {!number} lat The latitude of the station
     * @param {!number} long The longitude of the station
     */
    function Station(id, name, lat, long) {
        this.id_ = id;
        this.name_ = name;
        this.latitude_ = lat;
        this.longitude_ = long;
        this.capacity_ = 0;
        this.inUse_ = 0;
    }

    Station.prototype = {
        constructor : Station,
        id : function() {
            return this.id_;
        },
        name : function() {
            return this.name_;
        },
        latitude : function() {
            return this.latitude_;
        },
        longitude : function() {
            return this.longitude_;
        },
        capacity : function(v) {
            if (v !== undefined && typeof v === "number") {
                this.capacity_ = v;
                return this;
            }
            return this.capacity_;
        },
        inUse : function(v) {
            if (v !== undefined && typeof v === "number") {
                this.inUse_ = v;
                return this;
            }
            return this.inUse_;
        },
        toString : function() {
            var result = util.format("(%d) %s [%d, %d] %d/%d", this.id_, this.name_,
                    this.latitude_, this.longitude_, this.inUse_, this.capacity_);
            return result;
        }
    };

    module.exports = Station;
})();