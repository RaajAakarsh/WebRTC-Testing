import { useEffect, useRef } from "react";

export function Receiver() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const videoRefSrc = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const socket = new WebSocket("https://webrtc-testing-u170.onrender.com/");
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

				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true,
				});
				if (videoRefSrc.current) {
					videoRefSrc.current.srcObject = stream;
					console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
				}
				stream.getTracks().forEach((track) => {
					pc.addTrack(track, stream);
				});

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
			<p
				style={{
					textAlign: "left",
					fontWeight: "bold",
					color: "blue",
				}}
			>
				Sender
			</p>
			<video
				// senders vid
				ref={videoRef}
				autoPlay
				playsInline
				style={{
					width: "600px",
					border: "1px solid red",
					transform: "scaleX(-1)",
					display: "block",
				}}
			/>
			<p
				style={{
					textAlign: "left",
					fontWeight: "bold",
					color: "blue",
				}}
			>
				Receiver
			</p>
			<video
				// receivers vid
				ref={videoRefSrc}
				autoPlay
				playsInline
				muted
				style={{
					width: "200px",
					border: "1px solid red",
					transform: "scaleX(-1)",
					display: "block",
				}}
			/>
		</div>
	);
}
