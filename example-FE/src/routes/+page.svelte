<script lang="ts">
    import Client from "./Client.svelte";

	let name = $state('world');

	let clientID: string;

	// Check if we already have a client ID in localStorage
	if (!localStorage.getItem("clientID")) {
		// If no client ID, assign a new one and store it
		clientID = "client_" + Date.now();  // Unique ID based on the current timestamp
		localStorage.setItem("clientID", clientID); // Store it in localStorage
	} else {
		// If we have a client ID in localStorage, use it
		clientID = localStorage.getItem("clientID")!;
	}

	// This function is triggered when the button is clicked
	function connectToServer() {
		let socket = new WebSocket('ws://localhost:8080/ws');

		socket.onopen = () => {
			console.log('Connected to server as ' + clientID);
			// Send the client ID to the server
			socket.send(clientID);
		};

		socket.onmessage = (event) => {
			console.log("Message from server:", event.data);
		};

		socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

		socket.onclose = () => {
			console.log('Connection closed');
		};
	}

</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<button on:click={connectToServer}>Connect to WebSocket Server</button>
	
	<input bind:value={name}>

	<h1>Hello {name}!</h1>

	<Client />

</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}

	button {
		padding: 10px 20px;
		font-size: 16px;
		cursor: pointer;
	}

</style>
