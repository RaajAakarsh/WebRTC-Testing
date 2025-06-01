"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
console.log("Connected to WebSocket server");
const wss = new ws_1.WebSocketServer({ port: 8080 });
console.log("Connected to WebSocket server !!!!!!!!!!");
let senderSocket = null; // hey whenever you connect let me know whether you are the sender or receiver, and if you are the sender, then i will cache the socket instance corresponding to you in the senderSocket variable, and if you are the receiver, then i will cache the socket instance corresponding to you in the receiverSocket variable. this is done so that in the future, when you send a message to the server, i can forward that message to the correct socket instance.
// this however is a crude way to do this, and in a production environment, you would want a better state management system, like using a database or an in-memory store to keep track of connected clients and their roles.
let receiverSocket = null;
wss.on("connection", function connection(ws) {
    console.log("New client connected");
    ws.on("message", function message(data) {
        const message = JSON.parse(data);
        // identify as sender
        // indentify as receiver
        // create offer
        // create answer
        // add ice candidate
        if (message.type === "sender") {
            console.log("Sender connected");
            if (senderSocket) {
                console.log("A sender is already connected, disconnecting previous sender");
                senderSocket.close(); // close the previous sender socket if it exists
            }
            senderSocket = ws;
        }
        else if (message.type === "receiver") {
            console.log("Receiver connected");
            if (receiverSocket) {
                console.log("A receiver is already connected, disconnecting previous receiver");
                receiverSocket.close(); // close the previous receiver socket if it exists
            }
            receiverSocket = ws;
        }
        else if (message.type === "create-offer") {
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: "create-offer", offer: message.sdp }));
            console.log("///////////", message.sdp);
            console.log("Offer sent to receiver");
        }
        else if (message.type === "create-answer") {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: "create-answer", answer: message.sdp }));
            console.log("Answer sent to sender");
        }
        else if (message.type === "ice-candidate") {
            if (senderSocket) {
                senderSocket.send(JSON.stringify({
                    type: "ice-candidate",
                    candidate: message.candidate,
                }));
                console.log("ICE candidate sent to sender");
            }
            if (receiverSocket) {
                receiverSocket.send(JSON.stringify({
                    type: "ice-candidate",
                    candidate: message.candidate,
                }));
                console.log("ICE candidate sent to receiver");
            }
        }
        else {
            console.log("Unknown message type:", message.type);
        }
    });
    ws.on("error", console.error);
    ws.send("Initial message");
});
