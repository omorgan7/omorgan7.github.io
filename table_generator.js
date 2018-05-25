var players;

function loadPlayerJSONCallback(callback)
{
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'players.json', true);
    xobj.onreadystatechange = function(){
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

function buttonClick(obj)
{
    console.log(obj.innerHTML);
}

function generateTable()
{
    var table = document.getElementById('Leaderboard');

    var lastRank = 1;
    var runningTieTotal = 0;
    for (var i = 0; i < players.length; ++i) {
        var row = table.insertRow(i + 1);
        var index = 0;
        var cell;
        cell = row.insertCell(index++);
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
        cell.id = "cell-rank";
        cell = row.insertCell(index++);
        cell.innerHTML = '<img src="images/' + players[i].steamID + '.jpg"></img>';
        cell.id = 'cell-img';
        cell = row.insertCell(index++);
        cell.innerHTML = players[i].name;
        cell.id = 'cell-name';
        cell = row.insertCell(index++);
        cell.innerHTML = players[i].wins;
        cell.id = 'cell-wins';
        cell = row.insertCell(index++);
        cell.innerHTML = players[i].losses;
        cell.id = 'cell-losses';
        cell = row.insertCell(index++);
        cell.innerHTML = players[i].games;
        cell.id = 'cell-games';
        cell = row.insertCell(index++);
        var plusButton = document.createElement('BUTTON');
        plusButton.innerHTML = "+";
        plusButton.onclick = function() { buttonClick(plusButton) };
        cell.appendChild(plusButton);
        var minusButton = document.createElement('BUTTON');
        minusButton.innerHTML = "-";
        minusButton.onclick = function() { buttonClick(minusButton) };
        cell.appendChild(minusButton);

    }
}

getPlayers();