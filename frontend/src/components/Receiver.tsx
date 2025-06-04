import { useEffect, useRef } from "react";
import bgImage from "../assets/mesh-140.png";

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
		<div
			style={{
				height: "100vh",
				width: "100vw",
				padding: "20px",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				backgroundImage: `url(${bgImage})`,
				backgroundRepeat: "no-repeat",
				backgroundSize: "cover",
				backgroundPosition: "top left",
			}}
		>
			<h1 style={{ color: "black" }}>Receiver Component</h1>
			<p>This is the receiver component where you can receive messages.</p>
			<div
				style={{
					flex: 1,
					width: "max-content",
					position: "relative",
					marginTop: "20px",
					display: "flex",
					justifyContent: "center",
				}}
			>
				<video
					// senders vid
					ref={videoRef}
					autoPlay
					playsInline
					style={{
						height: "100%",
						maxWidth: "calc(100vw - 40px)",
						border: "1px solid rgb(0, 0, 0)",
						borderRadius: "10px",
						transform: "scaleX(-1)",
						display: "block",
					}}
				/>

				<video
					// receivers vid
					ref={videoRefSrc}
					autoPlay
					playsInline
					muted
					style={{
						position: "absolute",
						bottom: "10px",
						left: "10px",
						width: "35%",
						border: "1px solid rgb(0, 0, 0)",
						borderRadius: "10px",
						transform: "scaleX(-1)",
						display: "block",
					}}
				/>
			</div>
		</div>
	);
}
