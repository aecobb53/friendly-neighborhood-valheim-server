const gamesDiv = document.getElementById("games");

async function refresh() {
    const response = await fetch("/api/server-status");
    const data = await response.json();

    gamesDiv.innerHTML = "";

    for (const game of data.games) {

        const section = document.createElement("section");
        section.className = "game-section";

        section.innerHTML = `
            <h2 class="game-title">${game.name}</h2>
            <div class="server-grid"></div>
        `;

        const grid = section.querySelector(".server-grid");

        for (const server of game.servers) {

            const image = server.game ?? "unknown";

            const card = document.createElement("div");
            card.className = "server-card";

            card.innerHTML = `
                <div class="server-header">

                    <div class="server-info">
                        <img src="/static/images/${image}.png">

                        <div>
                            <div class="server-name">${server.name}</div>
                        </div>
                    </div>

                    <div class="status ${server.server_status.toLowerCase()}">
                        ${server.server_status}
                    </div>

                </div>

                <div class="server-message">
                    ${server.last_message}
                </div>

                <div class="server-updated">
                    ${new Date(server.updated).toLocaleString()}
                </div>
            `;

            grid.appendChild(card);
        }

        gamesDiv.appendChild(section);
    }
}

refresh();
setInterval(refresh, 2000);