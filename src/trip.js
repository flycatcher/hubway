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
     * Data container representing a single Hubway ride
     * 
     * @constructor
     */
    function Trip() {
        this.startDate_ = null;
        this.endDate_ = null;
        this.startStationId_ = 0;
        this.endStationId_ = 0;
        this.riderBirthYear_ = 0;
        this.riderGender_ = "";
        this.hasMembership_ = false;
    }

    Trip.prototype = {
        constructor : Trip,
        startDate : function(v) {
            if (v !== undefined && v instanceof Date) {
                this.startDate_ = v;
                return this;
            }
            return this.startDate_;
        },
        endDate : function(v) {
            if (v !== undefined && v instanceof Date) {
                this.endDate_ = v;
                return this;
            }
            return this.endDate_;
        },
        startStationId : function(v) {
            if (v !== undefined && typeof v === "number") {
                this.startStationId_ = v;
                return this;
            }
            return this.startStationId_;
        },
        endStationId : function(v) {
            if (v !== undefined && typeof v === "number") {
                this.endStationId_ = v;
                return this;
            }
            return this.endStationId_;
        },
        riderBirthYear : function(v) {
            if (v !== undefined && typeof v === "number") {
                this.riderBirthYear_ = v;
                return this;
            }
            return this.riderBirthYear_;
        },
        riderGender : function(v) {
            if (v !== undefined && typeof v === "string") {
                this.riderGender_ = v;
                return this;
            }
            return this.riderGender_;
        },
        hasMembership : function(v) {
            if (v !== undefined && typeof v === "boolean") {
                this.hasMembership_ = v;
                return this;
            }
            return this.hasMembership_;
        }
    };

    module.exports = Trip;
})();