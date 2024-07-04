document.addEventListener('DOMContentLoaded', function () {
    var dateInput = document.querySelector('.date-input');
    var gameGrid = document.getElementById('gameBoxes');

    var teamAbbreviations = {
        "Arizona Diamondbacks": "ARI",
        "Atlanta Braves": "ATL",
        "Baltimore Orioles": "BAL",
        "Boston Red Sox": "BOS",
        "Chicago White Sox": "CWS",
        "Chicago Cubs": "CHC",
        "Cincinnati Reds": "CIN",
        "Cleveland Guardians": "CLE",
        "Colorado Rockies": "COL",
        "Detroit Tigers": "DET",
        "Houston Astros": "HOU",
        "Kansas City Royals": "KC",
        "Los Angeles Angels": "LAA",
        "Los Angeles Dodgers": "LAD",
        "Miami Marlins": "MIA",
        "Milwaukee Brewers": "MIL",
        "Minnesota Twins": "MIN",
        "New York Yankees": "NYY",
        "New York Mets": "NYM",
        "Oakland Athletics": "OAK",
        "Philadelphia Phillies": "PHI",
        "Pittsburgh Pirates": "PIT",
        "San Diego Padres": "SD",
        "San Francisco Giants": "SF",
        "Seattle Mariners": "SEA",
        "St. Louis Cardinals": "STL",
        "Tampa Bay Rays": "TB",
        "Texas Rangers": "TEX",
        "Toronto Blue Jays": "TOR",
        "Washington Nationals": "WSH"
    };
  
    function fetchGameData(date) {
        fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1`)
            .then(response => response.json())
            .then(data => {
                // Hide initial content
                var initialContents = document.querySelectorAll('.initial-content');
                initialContents.forEach(content => content.style.display = 'none');

                // Clear new content inside game boxes
                var gameBoxes = document.querySelectorAll('.game-box');
                gameBoxes.forEach(box => box.innerHTML = '');

                // Check if data and dates array exist
                if (data && data.dates && data.dates.length > 0) {
                    const totalGames = data.dates[0].totalGames;

                    // Show or hide game boxes based on totalGames
                    gameBoxes.forEach((box, index) => {
                        if (index < totalGames) {
                            box.style.display = 'inline-block';
                            renderGameBox(data.dates[0].games[index], index);
                        } else {
                            box.style.display = 'none';
                        }
                    });
                } else {
                    gameGrid.innerHTML = '<p>No games found for this date.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching game data:', error);
                gameGrid.innerHTML = '<p>Error fetching game data. Please try again later.</p>';
            });
    }

    function fetchGameDetails(gamePk, callback) {
        fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
            .then(response => response.json())
            .then(data => {
                if (data && data.liveData) {
                    const linescore = data.liveData.linescore;
                    const inningHalf = linescore.inningHalf ? (linescore.inningHalf === "Top" ? "TOP" : "BOT") : '';
                    const currentInning = linescore.currentInning || '';
                    const inningInfo = `${inningHalf} ${currentInning}`;
                    const awayRecord = `${data.gameData.teams.away.record.wins}-${data.gameData.teams.away.record.losses}`;
                    const homeRecord = `${data.gameData.teams.home.record.wins}-${data.gameData.teams.home.record.losses}`;

                    const basesStatus = linescore.offense;
                    const outsCount = linescore.outs || 0;

                    callback({ inningInfo, awayRecord, homeRecord, basesStatus, outsCount });
                } else {
                    callback({ inningInfo: 'In Progress', awayRecord: '', homeRecord: '', basesStatus: null, outsCount: 0 });
                }
            })
            .catch(error => {
                console.error('Error fetching game details:', error);
                callback({ inningInfo: 'In Progress', awayRecord: '', homeRecord: '', basesStatus: null, outsCount: 0 });
            });
    }

    function updateBasesOutsSVG(svg, basesStatus, outsCount) {
        const bases = {
            first: svg.querySelector('#first-base'),
            second: svg.querySelector('#second-base'),
            third: svg.querySelector('#third-base')
        };

        // Clear previous base fill colors
        for (let base in bases) {
            bases[base].style.fill = '#FFDDDD'; // Default fill color
        }

        // Update bases status
        if (basesStatus) {
            if (basesStatus.first) bases.first.style.fill = '#D7827E';
            if (basesStatus.second) bases.second.style.fill = '#D7827E';
            if (basesStatus.third) bases.third.style.fill = '#D7827E';
        }

        // Update outs status
        const outs = svg.querySelectorAll('.out-circle');
        outs.forEach((out, index) => {
            out.style.fill = index < outsCount ? '#D7827E' : '#D9D9D9';
        });
    }

    function formatGameTime(game) {
        const dateTime = new Date(game.gameDate);
        const hours = dateTime.getHours();
        const minutes = dateTime.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${(hours % 12) || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        return formattedTime;
    }

    function renderGameBox(game, index) {
        var gameBoxes = document.querySelectorAll('.game-box');
        if (index >= gameBoxes.length) return;

        var gameBox = gameBoxes[index];

        var awayTeamName = game.teams.away.team.name;
        var homeTeamName = game.teams.home.team.name;
        var awayTeamAbbr = teamAbbreviations[awayTeamName] || awayTeamName;
        var homeTeamAbbr = teamAbbreviations[homeTeamName] || homeTeamName;

        var inningInfo = '';
        var inningClass = '';

        if (game.status.detailedState === "Final") {
            inningInfo = "Final";
            inningClass = "status";
            var awayRecord = `${game.teams.away.leagueRecord.wins}-${game.teams.away.leagueRecord.losses}`;
            var homeRecord = `${game.teams.home.leagueRecord.wins}-${game.teams.home.leagueRecord.losses}`;
            updateGameBox(gameBox, game, awayTeamAbbr, homeTeamAbbr, inningInfo, inningClass, awayRecord, homeRecord);
        } else if (game.status.detailedState === "In Progress") {
            fetchGameDetails(game.gamePk, function (gameDetails) {
                if (gameDetails) {
                    inningInfo = gameDetails.inningInfo;
                    inningClass = "inning";
                    var awayRecord = gameDetails.awayRecord;
                    var homeRecord = gameDetails.homeRecord;
                    updateGameBox(gameBox, game, awayTeamAbbr, homeTeamAbbr, inningInfo, inningClass, awayRecord, homeRecord, gameDetails.basesStatus, gameDetails.outsCount);
                } else {
                    inningInfo = 'In Progress';
                    inningClass = "inning";
                    updateGameBox(gameBox, game, awayTeamAbbr, homeTeamAbbr, inningInfo, inningClass);
                }
            });
        } else {
            inningInfo = formatGameTime(game);
            inningClass = "time-ampm";
            var awayRecord = `${game.teams.away.leagueRecord.wins}-${game.teams.away.leagueRecord.losses}`;
            var homeRecord = `${game.teams.home.leagueRecord.wins}-${game.teams.home.leagueRecord.losses}`;
            updateGameBox(gameBox, game, awayTeamAbbr, homeTeamAbbr, inningInfo, inningClass, awayRecord, homeRecord);
        }
    }

    function updateGameBox(gameBox, game, awayTeamAbbr, homeTeamAbbr, inningInfo, inningClass, awayRecord = '', homeRecord = '', basesStatus = null, outsCount = 0) {
        // SVG for bases and outs
        var basesOutsSVG = `
        <svg class="bases-outs-svg" width="108" height="99" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path class="out-circle" d="M19.5 61.5C19.5 64.7795 16.6254 67.5 13 67.5C9.37461 67.5 6.5 64.7795 6.5 61.5C6.5 58.2205 9.37461 55.5 13 55.5C16.6254 55.5 19.5 58.2205 19.5 61.5Z" fill="#D9D9D9" stroke="#D7827E"/>
            <path class="out-circle" d="M36.5 61.5C36.5 64.7795 33.6254 67.5 30 67.5C26.3746 67.5 23.5 64.7795 23.5 61.5C23.5 58.2205 26.3746 55.5 30 55.5C33.6254 55.5 36.5 58.2205 36.5 61.5Z" fill="#D9D9D9" stroke="#D7827E"/>
            <path class="out-circle" d="M53.5 61.5C53.5 64.7795 50.6254 67.5 47 67.5C43.3746 67.5 40.5 64.7795 40.5 61.5C40.5 58.2205 43.3746 55.5 47 55.5C50.6254 55.5 53.5 58.2205 53.5 61.5Z" fill="#D9D9D9" stroke="#D7827E"/>
            <rect id="third-base" x="17.6066" y="29.7071" width="14" height="14" rx="0.5" transform="rotate(45 17.6066 29.7071)" fill="#FFDDDD" stroke="#B9A2A2"/>
            <rect id="second-base" x="29.364" y="17.7071" width="14" height="14" rx="0.5" transform="rotate(45 29.364 17.7071)" fill="#FFDDDD" stroke="#B9A2A2"/>
            <rect id="first-base" x="41.6066" y="29.7071" width="14" height="14" rx="0.5" transform="rotate(45 41.6066 29.7071)" fill="#FFDDDD" stroke="#B9A2A2"/>
        </svg>
    `;

    var newContent = `
        <div class="new-content">
            <a href="/gamefeed?gamePk=${game.gamePk}">
                <div class="schedule game-schedule">
                    <table>
                        <tbody>
                            <tr>
                                <td class="team-logo"><img src="https://www.mlbstatic.com/team-logos/${game.teams.away.team.id}.svg" alt="${game.teams.away.team.name}"></td>
                                <td class="team">${awayTeamAbbr}</td>
                                <td class="record">${awayRecord}</td>
                                <td class="score">${game.teams.away.score !== undefined ? game.teams.away.score : ''}</td>
                                <td rowspan="2" class="${inningClass}">${inningInfo}</td>
                            </tr>
                            <tr>
                                <td class="team-logo"><img src="https://www.mlbstatic.com/team-logos/${game.teams.home.team.id}.svg" alt="${game.teams.home.team.name}"></td>
                                <td class="team">${homeTeamAbbr}</td>
                                <td class="record">${homeRecord}</td>
                                <td class="score">${game.teams.home.score !== undefined ? game.teams.home.score : ''}</td>
                            </tr>
                            ${inningClass === 'inning' ? `<tr><td colspan="5">${basesOutsSVG}</td></tr>` : ''}
                        </tbody>
                    </table>
                </div>
            </a>
        </div>
    `;
    gameBox.innerHTML = newContent;

    if (inningClass === 'inning') {
        const svg = gameBox.querySelector('.bases-outs-svg');
        updateBasesOutsSVG(svg, basesStatus, outsCount);
    }
}

    // Initial fetch for the current date
    var today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    fetchGameData(today);

    // Handle date change and apply button click
    document.querySelector('.apply').addEventListener('click', () => {
        var selectedDate = dateInput.value;
        fetchGameData(selectedDate);
        document.querySelector('.datepicker').hidden = true;
    });
});