<script lang="ts">
    import { onMount } from 'svelte';
    import { faUser, faUserSlash } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

    let name = 'world';
    let clientID: string;
    let clients: { id: string, icon: any }[] = [];
    let socket: WebSocket;

    if (!localStorage.getItem("clientID")) {
        clientID = "client_" + Date.now();
        localStorage.setItem("clientID", clientID);
    } else {
        clientID = localStorage.getItem("clientID")!;
    }

    function connectToServer() {
        socket = new WebSocket('ws://localhost:8080/ws');

        socket.onopen = () => {
            console.log('Connected to server as ' + clientID);
            socket.send(clientID);
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === 'new-client') {
                // Check if the client already exists in the list
                if (!clients.some(client => client.id === message.id)) {
                    clients = [...clients, { id: message.id, icon: faUser }];
                }
            } else if (message.type === 'client-left') {
                // Remove client from the list
                clients = clients.filter(client => client.id !== message.id);
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log('Connection closed');
        };
    }

    onMount(() => {
        connectToServer();
    });
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
    <button on:click={connectToServer}>Connect to WebSocket Server</button>
    
    <input bind:value={name}>

    <h1>Hello {name}!</h1>

    <div class="user-icons">
        {#each clients as client (client.id)}
            <div class="user-icon">
                <FontAwesomeIcon icon={client.icon} />
            </div>
        {/each}
    </div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    h1 {
        width: 100%;
        text-align: center;
    }

    .user-icons {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .user-icon {
        font-size: 24px;
    }

    button {
        padding: 10px 20px;
        font-size: 16px;
        cursor: pointer;
    }
</style>
