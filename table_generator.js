var players;

function TableLoaded(initValue, onChange)
{
    this.value = initValue;
    this.onChange = onChange;

    this.get = function() {
        return this.value;
    }

    this.set = function(newValue) {
        this.value = newValue;
        this.onChange();
    }
}

var tableLoaded = new TableLoaded(false, appendCallback);

function loadPlayerJSONCallback(callback)
{
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'players.json', true);
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText);
        }
    };
    xobj.send(null);  
}

function computeScore()
{
    for (var i = 0; i < players.length; ++i) {
        var player = players[i];
        player.games = player.wins + player.losses;
        var quotient = player.wins / player.games;
        player.ranking = Math.pow((1.0 + quotient), 2.0) + Math.pow(0.5 + quotient, 0.5 + player.games / (player.games + 1.0));
    }
}

function sortPlayers()
{
    players.sort(function(a, b) {
        return b.ranking - a.ranking;
    });
}

function getPlayers()
{
    loadPlayerJSONCallback(function(response) {
        players = JSON.parse(response);
        computeScore();
        sortPlayers();
        generateTable();
    });
}

function updateTable()
{
   var table = document.getElementById('Leaderboard');

    var lastRank = 1;
    var runningTieTotal = 0;
    for (var i = 0; i < players.length; ++i) {
        var row = table.rows[i + 1];
        var index = 0;
        var cell;

        players.leaderboardEntry = i;

        cell = row.cells[index++];

        if (i == 0) {
            cell.innerHTML = "#" + lastRank;
        }
        else {
            if (players[i].ranking == players[i - 1].ranking) {
                cell.innerHTML = "#" + lastRank;
                ++runningTieTotal;
            }
            else {
                lastRank += 1 + runningTieTotal;
                runningTieTotal = 0;
                cell.innerHTML = "#" + lastRank;
            }
        }

        cell = row.cells[index++];
        cell.innerHTML = '<img src="images/' + players[i].steamID + '.jpg"></img>';

        cell = row.cells[index++];
        cell.innerHTML = players[i].name;

        cell = row.cells[index++];
        cell.innerHTML = players[i].wins;

        cell = row.cells[index++];
        cell.innerHTML = players[i].losses;

        cell = row.cells[index++];
        cell.innerHTML = players[i].games;
    }
}

function generateTable()
{
    var table = document.getElementById('Leaderboard');

    for (var i = 0; i < players.length; ++i) {
        var row = table.insertRow(i + 1);
        var index = 0;
        var cell;
        cell = row.insertCell(index++);
        cell.id = "cell-rank";

        cell = row.insertCell(index++);
        cell.id = 'cell-img';

        cell = row.insertCell(index++);
        cell.id = 'cell-name';

        cell = row.insertCell(index++);
        cell.id = 'cell-wins';

        cell = row.insertCell(index++);
        cell.id = 'cell-losses';

        cell = row.insertCell(index++);
        cell.id = 'cell-games';

        cell = row.insertCell(index++);
        // this cell is where buttons go in admin mode.
    }
    tableLoaded.set(true);
    updateTable();
}

getPlayers();