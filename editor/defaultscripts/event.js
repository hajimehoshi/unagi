'use strict';

class Event {
    constructor(data) {
        this.data_ = data;
        this.isProcessing_ = true;
        console.log('start!');
    }

    get isProcessing() {
        return this.isProcessing_;
    }

    update() {
        this.isProcessing_ = false;
    }
}
