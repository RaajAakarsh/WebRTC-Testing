import { useEffect, useState } from "react";

export function Sender() {
	const [socket, setSocket] = useState<WebSocket | null>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		socket.onopen = () => {
			console.log("Connected to WebSocket server");
			socket.send(JSON.stringify({ type: "sender" }));
		};

		setSocket(socket);
	}, []);

	async function StartSendingVideo() {
		if (!socket) return;
		// first we have to create an offer
		// so basically the browser 1 creates an RTCPeerConnection instance(which is a WebRtC object in the frontend that gives you access to things like offer , answer)
		// it is a high level api to do high level api things
		const pc = new RTCPeerConnection();
		pc.onnegotiationneeded = async () => {
			console.log("negotiation needed - sender");
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			socket?.send(
				JSON.stringify({ type: "create-offer", sdp: pc.localDescription })
			);
		};

		pc.onicecandidate = (event) => {
			if (event.candidate) {
				console.log("New ICE candidate :", event.candidate);
				socket?.send(
					JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
				);
			}
		};

		socket.onmessage = async (event) => {
			const data = JSON.parse(event.data);
			if (data.type === "create-answer") {
				console.log("Received answer:", data.answer);
				await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
			} else if (data.type === "ice-candidate") {
				console.log("Received ICE candidate:", data.candidate);
				pc.addIceCandidate(data.candidate).catch((error) => {
					console.error("Error adding received ICE candidate:", error);
				});
			}
		};

		const stream = await navigator.mediaDevices.getUserMedia({
			video: true,
			audio: false,
		});
		stream.getTracks().forEach((track) => {
			pc.addTrack(track, stream); // ✅ this `stream` is critical
		});
		console.log("Video track added to RTCPeerConnection");

		console.log("Added video tracks:", stream.getVideoTracks());
		console.log("PeerConnection senders:", pc.getSenders());
	}

	return (
		<div>
			<h1>Sender Component</h1>
			<p>This is the sender component where you can send messages.</p>
			<button onClick={StartSendingVideo}>Send Video</button>
		</div>
	);
}
