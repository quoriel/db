module.exports = {
    enums: {
        global: "global",
        user: "user",
        guild: "guild",
        member: "member",
        channel: "channel",
        role: "role",
        message: "message"
    },
    types: {
        global: {
            type: null,
            guild: false,
            json: false
        },
        user: {
            type: "user",
            guild: false,
            json: true
        },
        member: {
            type: "member",
            guild: true,
            json: true
        },
        guild: {
            type: "guild",
            guild: false,
            json: true
        },
        channel: {
            type: "channel",
            guild: true,
            json: true
        },
        role: {
            type: "role",
            guild: true,
            json: true
        },
        message: {
            type: "message",
            guild: true,
            json: true
        }
    }
}