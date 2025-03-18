<script lang="ts">
    import { onMount } from 'svelte';
    import { faUser, faUserSlash } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    let clientID: string;
    let clients: { id: string, icon: any }[] = [];
    let socket: WebSocket | null = null;
    let inGame = false;  // Whether the user has "joined"

    // Generate unique client ID
    if (!localStorage.getItem("clientID")) {
        clientID = "client_" + Date.now();
        localStorage.setItem("clientID", clientID);
    } else {
        clientID = localStorage.getItem("clientID")!;
    }

    // Connect WebSocket on mount
    function connectToServer() {
        socket = new WebSocket('ws://localhost:8080/ws');

        socket.onopen = () => {
            console.log('Connected to server.');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'update-users') {
                // Update client list dynamically
                clients = message.ids.map(id => ({ id, icon: faUser }));
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log('Connection closed');
        };
    }

    function joinGame() {
        if (!inGame && socket) {
            socket.send(JSON.stringify({ type: "join", id: clientID }));
            inGame = true;
        }
    }

    function leaveGame() {
        if (inGame && socket) {
            socket.send(JSON.stringify({ type: "leave", id: clientID }));
            inGame = false;
        }
    }

    onMount(() => {
        connectToServer();
    });
</script>

<svelte:head>
    <title>Jackbox-Style WebSocket</title>
</svelte:head>

<section>
    <h1>Join the Game</h1>
    <button on:click={joinGame} disabled={inGame}>Join</button>
    <button on:click={leaveGame} disabled={!inGame}>Leave</button>

    <div class="client-icons">
        {#each clients as client (client.id)}
            <div class="user-icon">
                <FontAwesomeIcon icon={client.icon} />
                <span>{client.id}</span>
            </div>
        {/each}
    </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .client-icons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 20px;
    }
    .user-icon {
        margin: 10px;
        display: flex;
        align-items: center;
    }
    button {
        margin: 5px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
    }
</style>
