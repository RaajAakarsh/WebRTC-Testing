import { useEffect, useRef } from "react";

export function Receiver() {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const socket = new WebSocket("ws://localhost:8080");
		const pc = new RTCPeerConnection();

		const videoElement = videoRef.current;

		pc.onicecandidate = (event) => {
			if (event.candidate) {
				console.log("New ICE candidate:", event.candidate);
				socket.send(
					JSON.stringify({
						type: "ice-candidate",
						candidate: event.candidate,
					})
				);
			}
		};

		pc.ontrack = (event) => {
			console.log("-----------------------------------------------");
			console.log("Track received:", event);
			if (videoElement && event.streams[0]) {
				videoElement.srcObject = event.streams[0];
			}
		};

		socket.onopen = () => {
			console.log("Connected to WebSocket server");
			socket.send(JSON.stringify({ type: "receiver" }));
		};

		socket.onmessage = async (event) => {
			const message = JSON.parse(event.data);
			if (message.type === "create-offer") {
				await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				socket.send(
					JSON.stringify({
						type: "create-answer",
						sdp: pc.localDescription,
					})
				);
			} else if (message.type === "ice-candidate") {
				console.log("Received ICE candidate:", message.candidate);
				await pc.addIceCandidate(message.candidate).catch((error) => {
					console.error("Error adding ICE candidate:", error);
				});
			}
		};
	}, []);

	return (
		<div>
			<h1>Receiver Component</h1>
			<p>This is the receiver component where you can receive messages.</p>
			<video
				ref={videoRef}
				autoPlay
				playsInline
				muted
				style={{ width: "600px", border: "1px solid red" , transform: "scaleX(-1)"}}
			/>
		</div>
	);
}
