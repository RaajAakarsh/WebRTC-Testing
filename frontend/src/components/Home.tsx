import { useState } from "react";

const Home = () => {
	const [hovered, setHovered] = useState(false);

	return (
		<div
			style={{
				margin: 0,
                padding: "100px",
				backgroundColor: "#0f0f0f",
				fontFamily: "'Segoe UI', sans-serif",
				color: "#f5f5f5",
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "90vh",
				textAlign: "center",
				flexDirection: "column",
			}}
		>
			<h1
				style={{ fontSize: "3rem", marginBottom: "0.5rem", color: "#61dafb" }}
			>
				Welcome to WebRTC Project
			</h1>
			<p style={{ fontSize: "1.2rem", color: "#bbbbbb" }}>
				Secure. Real-Time. Open Source.
			</p>
			<a
				href="/sender"
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
				style={{
					marginTop: "2rem",
					padding: "12px 24px",
					backgroundColor: hovered ? "#61dafb" : "#1e1e1e",
					color: hovered ? "#0f0f0f" : "#61dafb",
					border: "1px solid #61dafb",
					borderRadius: "8px",
					textDecoration: "none",
					transition: "0.3s ease",
				}}
			>
				Enter App →
			</a>
		</div>
	);
};

export default Home;
