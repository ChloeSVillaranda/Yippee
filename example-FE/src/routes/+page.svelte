<script lang="ts">
    import { onMount } from 'svelte';
    import { faUser } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    let clientID: string;
    let username: string = "";
    let chatmessage: string = "";
    let clients: { id: string, username: string, chatmessage: string, icon: any }[] = [];
    let socket: WebSocket | null = null;
    let inGame = false;

    // Generate unique client ID or retrieve from local storage
    if (!localStorage.getItem("clientID")) {
        clientID = "client_" + Date.now();
        localStorage.setItem("clientID", clientID);
    } else {
        clientID = localStorage.getItem("clientID")!;
    }

    function connectToServer() {
        socket = new WebSocket('ws://localhost:8080/ws');

        socket.onopen = () => {
            console.log('Connected to server.');
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'update-users' || message.type === 'send-message') {
                clients = message.users.map(user => ({
                    id: user.id,
                    username: user.username,
                    chatmessage: user.chatmessage || "",
                    icon: faUser
                }));
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
        if (!inGame && socket && username.trim() !== "") {
            socket.send(JSON.stringify({ type: "join", id: clientID, username }));
            inGame = true;
        }
    }

    function leaveGame() {
        if (inGame && socket) {
            socket.send(JSON.stringify({ type: "leave", id: clientID }));
            inGame = false;
        }
    }

    function sendMessage() {
        if (inGame && socket && chatmessage.trim() !== "") {
            socket.send(JSON.stringify({ type: "chat-message", id: clientID, chatmessage }));
            chatmessage = ""; // Clear the input field after sending
        }
    }

    onMount(() => {
        connectToServer();
    });
</script>

<svelte:head>
    <title>WebSocket Chat</title>
</svelte:head>

<section>
    <h1>Join the Game</h1>
    {#if !inGame}
        <input type="text" bind:value={username} placeholder="Enter username" />
        <button on:click={joinGame} disabled={inGame || username.trim() === ""}>Join</button>
    {:else}
        <button on:click={leaveGame} disabled={!inGame}>Leave</button>
    {/if}
    
    <div class="client-icons">
        {#each clients as client (client.id)}
            <div class="user-icon">
                <FontAwesomeIcon icon={client.icon} />
                <span>{client.username}</span>
                {#if client.chatmessage}
                    <p class="chat-message">{client.chatmessage}</p>
                {/if}
            </div>
        {/each}
    </div>

    {#if inGame} 
        <input type="text" bind:value={chatmessage} placeholder="Enter message" />
        <button on:click={sendMessage}>Send</button>
    {/if}
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    input {
        padding: 8px;
        margin: 10px;
        font-size: 16px;
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
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    .chat-message {
        margin-top: 5px;
        font-size: 14px;
        color: gray;
    }
    button {
        margin: 5px;
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
    }
</style>