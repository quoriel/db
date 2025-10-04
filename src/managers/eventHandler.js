const { BaseEventHandler } = require("@tryforge/forgescript");
const { QuorielDB } = require("../main");

class EventHandler extends BaseEventHandler {
    register(client) {
        client.getExtension(QuorielDB, true)["emitter"].on(this.name, this.listener.bind(client));
    }
}

module.exports = { EventHandler };