"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const events_1 = __importDefault(require("events"));
/**
 * Bull works with a Job wrapper around all messages that contains a lot more information about
 * the state of the message, this object constructor implements the same schema of Bull jobs
 * for the sake of maintaining API consistency.
 * @param {string} queue The name of the queue which the message will be carried on.
 * @param {object} message The JSON message which will be passed back to the consumer.
 * @returns {Object} A new job which can now be put onto the queue, this is mostly an
 * internal structure so that an in memory queue can be easily swapped for a Bull queue.
 */
function newJob(queue, message) {
    return {
        timestamp: Date.now(),
        queue: queue,
        data: message,
    };
}
/**
 * This is designed to replicate Bull (https://github.com/OptimalBits/bull) in memory as a sort of mock.
 * It is relatively simple, using an event emitter internally to register when messages are available
 * to the consumers - in can support many inputs and many consumers.
 */
class InMemoryQueue {
    /**
     * The constructor the queue, exactly the same as that of Bulls.
     * @param {string} name The name of the queue which is being configured.
     * @param {object|null} opts This is not used by the in memory queue as there is no real use
     * case when in memory, but is the same API as Bull
     */
    constructor(name, opts = null) {
        this._name = name;
        this._opts = opts;
        this._messages = [];
        this._emitter = new events_1.default.EventEmitter();
    }
    /**
     * Same callback API as Bull, each callback passed to this will consume messages as they are
     * available. Please note this is a queue service, not a notification service, so each
     * consumer will receive different messages.
     * @param {function<object>} func The callback function which will return a "Job", the same
     * as the Bull API, within this job the property "data" contains the JSON message. Please
     * note this is incredibly limited compared to Bull as in reality the Job would contain
     * a lot more information about the queue and current status of Bull cluster.
     */
    process(func) {
        this._emitter.on("message", () => __awaiter(this, void 0, void 0, function* () {
            if (this._messages.length <= 0) {
                return;
            }
            let msg = this._messages.shift();
            let resp = func(msg);
            if (resp.then != null) {
                yield resp;
            }
        }));
    }
    // simply puts a message to the queue and emits to the queue for processing
    /**
     * Simple function to replicate the add message functionality of Bull, putting
     * a new message on the queue. This then emits an event which will be used to
     * return the message to a consumer (if one is attached).
     * @param {object} msg A message to be transported over the queue, this should be
     * a JSON message as this is required by Bull.
     * @param {boolean} repeat serves no purpose for the import queue.
     */
    // eslint-disable-next-line no-unused-vars
    add(msg, repeat) {
        if (typeof msg !== "object") {
            throw "Queue only supports carrying JSON.";
        }
        this._messages.push(newJob(this._name, msg));
        this._emitter.emit("message");
    }
    /**
     * replicating the close function from bull, which waits for jobs to finish.
     */
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    /**
     * This removes a cron which has been implemented, this is part of Bull API.
     * @param {string} cronJobId The cron which is to be removed.
     */
    removeRepeatableByKey(cronJobId) {
        // TODO: implement for testing
        console.log(cronJobId);
    }
    /**
     * Implemented for tests
     */
    getRepeatableJobs() {
        return [];
    }
    // eslint-disable-next-line no-unused-vars
    removeJobs(pattern) {
        // no-op
    }
    /**
     * Implemented for tests
     */
    clean() {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    getJob() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    on() {
        // do nothing
    }
}
module.exports = InMemoryQueue;
//# sourceMappingURL=inMemoryQueue.js.map