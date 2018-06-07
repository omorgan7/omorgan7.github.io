// this script is only loaded if you have logged in.
var winCounter = 0;
var lossCounter = 0;

// change the login text to logout
var loginText = document.getElementById("login");
loginText.innerHTML = "Logout";
loginText.href = "/logout";

// add an additional element that lets someone create access the /create page
let navbar = document.getElementById("navbar");
var createPage = document.createElement("SPAN");
var link = document.createElement("A");
link.innerHTML = "Add new player";
link.href = "/create";
createPage.appendChild(link);
navbar.insertBefore(createPage, navbar.childNodes[1]);

class LeaderboardEntry {
    constructor(row, index)
    {
        this.row = row;
        this.index = index;
        this.incrementCounter = 0;
    }

    incrementScore()
    {
        if (this.incrementCounter < 0) {
            this.incrementCounter = 0;
            this.row.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            this.row.cells[4].style.fontWeight = "normal";
            this.row.cells[4].innerHTML = parseInt(this.row.cells[4].innerHTML) - 1;
            --lossCounter;
        }
        else if (this.incrementCounter == 0) {
            this.incrementCounter = 1;
            this.row.style.backgroundColor = "rgba(0, 255, 0, 0.4)";
            this.row.cells[3].style.fontWeight = "bold";
            this.row.cells[3].innerHTML = parseInt(this.row.cells[3].innerHTML) + 1;
            ++winCounter;
        }
        validateWinLoss();
    }
    decrementScore()
    {
        if (this.incrementCounter > 0) {
            this.incrementCounter = 0;
            this.row.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
            this.row.cells[3].style.fontWeight = "normal";
            this.row.cells[3].innerHTML = parseInt(this.row.cells[3].innerHTML) - 1;
            --winCounter;
        }
        else if (this.incrementCounter == 0) {
            this.incrementCounter = -1;
            this.row.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
            this.row.cells[4].style.fontWeight = "bold";
            this.row.cells[4].innerHTML = parseInt(this.row.cells[4].innerHTML) + 1;
            ++lossCounter;
        }
        validateWinLoss();     
    }
}

var leaderboardEntries = [];

function appendCallback()
{
    var table = document.getElementById('Leaderboard');

    for (var i = 1; i < table.rows.length; ++i) {
        
        var row = table.rows[i];
        var entry = new LeaderboardEntry(row, i - 1);
        leaderboardEntries.push(entry);
        var cell = row.cells[row.cells.length - 1];
        var plusButton = document.createElement('BUTTON');
        plusButton.id = (i - 1).toString();
        plusButton.innerHTML = "+";
        plusButton.onclick = function() {
            leaderboardEntries[this.id].incrementScore()
        };
        cell.appendChild(plusButton);
        var minusButton = document.createElement('BUTTON');
        minusButton.id = (i - 1).toString();
        minusButton.innerHTML = "-";
        minusButton.onclick = function() {
            leaderboardEntries[this.id].decrementScore()
        };
        cell.appendChild(minusButton);
    }
}

var submitButton;
function createSubmitForm()
{
    submitButton = document.createElement("BUTTON");
    submitButton.type = "submit";
    submitButton.id = "submit-score";
    submitButton.innerHTML = "Submit";
    submitButton.disabled = true;
    submitButton.onclick = submitNewScores;
    document.body.appendChild(submitButton);
}

createSubmitForm();

function validateWinLoss()
{
    if (winCounter == 5 && lossCounter == 5) {
        submitButton.disabled = false;
    }
    else {
        submitButton.disabled = true;
    }
}

function submitNewScores()
{
    var xobj = new XMLHttpRequest();
    xobj.open('POST', '/');
    xobj.setRequestHeader("Content-Type", "application/json");

    for (var i = 0; i < players.length; ++i) {
        if (leaderboardEntries[i].incrementCounter >= 1) {
            players[i]["wins"] = parseInt(players[i]["wins"]) + 1; 
        }
        else if (leaderboardEntries[i].incrementCounter <= 1) {
            players[i]["losses"] = parseInt(players[i]["losses"]) + 1; 
        }
    } 
    xobj.send(JSON.stringify(players));  
    xobj.onreadystatechange = function() {
        if (xobj.readyState == 4 && xobj.status == "200") {
            window.location = xobj.responseURL;
        }
    };
}