document.addEventListener("DOMContentLoaded", () => {

    const teamMap = {
        108: 'laa', 109: 'az', 110: 'bal', 111: 'bos', 112: 'chc',
        113: 'cin', 114: 'cle', 115: 'col', 116: 'det', 117: 'hou',
        118: 'kc', 119: 'lad', 120: 'was', 121: 'nym', 133: 'oak',
        134: 'pit', 135: 'sd', 136: 'sea', 137: 'sf', 138: 'stl',
        139: 'tb', 140: 'tex', 141: 'tor', 142: 'minn', 143: 'phi',
        144: 'atl', 145: 'chw', 146: 'mia', 147: 'nyy', 158: 'mil',
    };

    // Function to get URL parameter
    function getGamePkFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('gamePk');
    }

    // Function to format the game time with AM/PM
    function formatTimeWithAmPm(dateString) {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
    }

    // Function to update SVG based on game state
    function updateSVG(gameData) {
        const outs = gameData.liveData.plays.currentPlay.count.outs || 0;
        const onBase = gameData.liveData.linescore.offense;

        console.log('Updating SVG:', outs, onBase);

        // Update outs
        for (let i = 1; i <= 3; i++) {
            const outCircle = document.getElementById(`out-${i}`);
            if (outCircle) {
                outCircle.style.fill = i <= outs ? '#006C54' : 'white';
            } else {
                console.error(`Element out-${i} not found`);
            }
        }

        // Update bases
        document.getElementById('first-base').style.fill = onBase.first ? '#006C54' : 'white';
        document.getElementById('second-base').style.fill = onBase.second ? '#006C54' : 'white';
        document.getElementById('third-base').style.fill = onBase.third ? '#006C54' : 'white';
    }

    // Fetch and display detailed game data
    function fetchAndDisplayGameData(gamePk) {
        fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
            .then(response => response.json())
            .then(data => {
                const gameDatabase = data.liveData;

                // Get the detailed game state
                const detailedState = data.gameData.status.detailedState;

                let gameStatus = '';
                let inningBoxStyle = '';
                let preGameHTML = '';
                let svgFieldHTML = '';
                let finalStateHTML = '';

                // Check the game status and set gameStatus accordingly
                if (detailedState === 'Scheduled' || detailedState === 'Pre-Game' || detailedState === 'Warmup') {
                    // Get the game time and format it with AM/PM
                    const gameTime = formatTimeWithAmPm(data.gameData.datetime.dateTime);
                    const awayprobablePitchersId = data.gameData.probablePitchers.away.id;
                    const homeprobablePitchersId = data.gameData.probablePitchers.home.id;

                    const pitcherAwayKey = `ID${awayprobablePitchersId}`;
                    const pitcherHomeKey = `ID${homeprobablePitchersId}`;

                    gameStatus = gameTime;
                    preGameHTML = `
                        <div class="probable-pitchers">
                            <div class="prob-pitchers">
                                        <div class="away-probs" mode="Scoreboard">
                                            <div class="pre-game-teams-away">${data.gameData.teams.away.franchiseName}</div>
                                            <img class="away-pitcher-icon" srcset="https://midfield.mlbstatic.com/v1/people/${awayprobablePitchersId}/spots/60?zoom=1.2 1x">
                                            <div class="away-name">${data.gameData.probablePitchers.away.fullName || 'TBD'}</div>
                                            <div class="pre-game-wins">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.wins}</div>
                                            <div class="pre-game-stats">-</div>
                                            <div class="pre-game-loss">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.losses}</div>
                                            <div class="pre-game-era">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.era}</div>
                                        </div>
                                        <div class="home-probs" mode="Scoreboard">
                                            <div class="pre-game-teams-home">${data.gameData.teams.home.franchiseName}</div>
                                            <img class="home-pitcher-icon" srcset="https://midfield.mlbstatic.com/v1/people/${homeprobablePitchersId}/spots/60?zoom=1.2 1x">
                                            <div class="home-name">${data.gameData.probablePitchers.home.fullName}</div>
                                            <div class="pre-game-wins">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.wins}</div>
                                            <div class="pre-game-stats">-</div>
                                            <div class="pre-game-loss">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.losses}</div>
                                            <div class="pre-game-era">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.era}</div>
                                        </div>
                            </div>
                        </div>
                    `;

                } else if (detailedState === 'Live' || detailedState === 'In Progress') {
                    // Get inning data
                    const inningHalf = gameDatabase.linescore.inningHalf;
                    const inningOrdinal = gameDatabase.linescore.currentInningOrdinal;

                    // Combine inningHalf and inningOrdinal
                    gameStatus = `${inningHalf} ${inningOrdinal}`;
                    
                    // Include SVG only if game is In Progress
                    svgFieldHTML = `
                            <svg id="field" width="100" height="140" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path id="out-1" d="M19.5 61.5C19.5 64.7795 16.6254 67.5 13 67.5C9.37461 67.5 6.5 64.7795 6.5 61.5C6.5 58.2205 9.37461 55.5 13 55.5C16.6254 55.5 19.5 58.2205 19.5 61.5Z" fill="#D9D9D9" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <path id="out-2" d="M36.5 61.5C36.5 64.7795 33.6254 67.5 30 67.5C26.3746 67.5 23.5 64.7795 23.5 61.5C23.5 58.2205 26.3746 55.5 30 55.5C33.6254 55.5 36.5 58.2205 36.5 61.5Z" fill="#D9D9D9" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <path id="out-3" d="M53.5 61.5C53.5 64.7795 50.6254 67.5 47 67.5C43.3746 67.5 40.5 64.7795 40.5 61.5C40.5 58.2205 43.3746 55.5 47 55.5C50.6254 55.5 53.5 58.2205 53.5 61.5Z" fill="#D9D9D9" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <rect id="third-base" x="17.6066" y="29.7071" width="14" height="14" rx="0.5" transform="rotate(45 17.6066 29.7071)" fill="#FFDDDD" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <rect id="second-base" x="29.364" y="17.7071" width="14" height="14" rx="0.5" transform="rotate(45 29.364 17.7071)" fill="#FFDDDD" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <rect id="first-base" x="41.6066" y="29.7071" width="14" height="14" rx="0.5" transform="rotate(45 41.6066 29.7071)" fill="#FFDDDD" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                            </svg>
                            <div class="balls-strikes" id="count" style="color: #2f4858;">${data.liveData.plays.currentPlay.count.balls} - ${data.liveData.plays.currentPlay.count.strikes}</div>
                            <div class="strike-zone-wrapper">
                            <svg class="strike-zone" width="125" height="178" viewBox="0 0 125 178" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g id="strikeZone">
                                <rect id="strike-zone" x="0.5" y="0.5" width="124" height="177" stroke="black"/>
                                </g>
                            </svg>
                            </div>
                            `;

                } else if (detailedState === 'Final' || detailedState === 'Game Over') {
                    // Show 'Final' when the game is finished and style it in red
                    gameStatus = 'Final';
                    inningBoxStyle = 'color: red;';
                    svgFieldHTML = '';

                    finalStateHTML = `
                        <div class="final-message">
                        <p>The game is over </p>
                        </div>
                    `;
                }

                // Get team data
                const homeTeam = gameDatabase.boxscore.teams.home;
                const awayTeam = gameDatabase.boxscore.teams.away;

                // Get team logos
                const homeTeamLogoURL = `https://www.mlbstatic.com/team-logos/${homeTeam.team.id}.svg`;
                const awayTeamLogoURL = `https://www.mlbstatic.com/team-logos/${awayTeam.team.id}.svg`;

                // Get team abbreviations from the map
                const homeTeamAbbreviation = teamMap[homeTeam.team.id];
                const awayTeamAbbreviation = teamMap[awayTeam.team.id];

                // Get team scores
                const homeTeamScore = gameDatabase.linescore.teams.home.runs;
                const awayTeamScore = gameDatabase.linescore.teams.away.runs;

                // Create the HTML structure
                const gameHTML = `
                    <div class="feed-container" style="width: 1256px; height: 95.58px; border: 2px solid #006c54; display: flex; align-items: center; justify-content: space-between;">
                        ${gameStatus ? `<div class="inning-box" style="width: 100px; height: 25px; text-align: center; margin-bottom: 50px; font-size: 20px; font-weight: 400; font-family: Roboto Condensed; ${inningBoxStyle}">
                            ${gameStatus}
                        </div>` : ''}
                        <div style="display: flex; align-items: center;">
                            <a href="/teams/${awayTeamAbbreviation}">
                                <img class="away-team-logo-feed" src="${awayTeamLogoURL}" style="height: 80px; margin-right: 10px;" alt="${awayTeam.team.name} Logo">
                            </a>
                            <div class="game-column away-team" style="display: flex; flex-direction: column;">
                                <div class="team-location">${data.gameData.teams.away.franchiseName}</div>
                                <div class="team-name">${data.gameData.teams.away.teamName}</div> 
                            </div>
                        </div>
                        <div class="score-bug-feed">
                            ${awayTeamScore !== undefined ? awayTeamScore : '0'} - ${homeTeamScore !== undefined ? homeTeamScore : '0'}
                        </div>
                        <div style="display: flex; align-items: center;">
                            <div class="game-column home-team" style="display: flex; flex-direction: column; margin-right: 10px;">
                                <div class="team-location">${data.gameData.teams.home.franchiseName}</div>
                                <div class="team-name">${data.gameData.teams.home.teamName}</div>
                            </div>
                            <a href="/teams/${homeTeamAbbreviation}">
                                <img class="home-team-logo-feed" src="${homeTeamLogoURL}" style="height: 80px; margin-right: 240px;" alt="${homeTeam.team.name} Logo">
                            </a>
                        </div>
                    </div>
                    <div id="scoreboard">
                        <div class="game">
                            <table>
                                <thead>
                                    <tr>
                                        <th style="text-align: left; font-size: 14px; padding-right: 150px;">${detailedState === 'Final' ? 'Final': `${detailedState} - ${gameStatus}`}</th>
                                        <th class="score">R</th>
                                        <th class="score">H</th>
                                        <th class="score">E</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="border-top">
                                        <td class="team-meta">
                                            <div>
                                                <div class="team-logo-scoreboard">
                                                    <img src="${awayTeamLogoURL}" style="height: 32px; width: 32px; margin-top: 10px; float: left;">
                                                </div>
                                                <div class="team" style="position: relative; top: 20px; left: 5px;">
                                                    ${data.gameData.teams.away.teamName} (${data.gameData.teams.away.record.wins}-${data.gameData.teams.away.record.losses})
                                                </div>
                                            </div>
                                        </td>
                                        <td class="score">
                                            <div>${data.liveData.boxscore.teams.away.teamStats.batting.runs}</div>
                                        </td>
                                        <td class="score">${data.liveData.boxscore.teams.away.teamStats.batting.hits}</td>
                                        <td class="score">${data.liveData.boxscore.teams.away.teamStats.fielding.errors}</td>
                                        <td rowspan="2"></td>
                                    </tr>
                                    <tr>
                                        <td class="team-meta">
                                            <div>
                                                <div class="team-logo-scoreboard">
                                                    <img src="${homeTeamLogoURL}" style="height: 32px; width: 32px; margin-top: 10px; float: left;">
                                                </div>
                                                <div class="team" style="position: relative; top: 20px; left: 5px;">
                                                    ${data.gameData.teams.home.teamName} (${data.gameData.teams.home.record.wins}-${data.gameData.teams.home.record.losses})
                                                </div>
                                            </div>
                                        </td>
                                        <td class="score">
                                            <div>${data.liveData.boxscore.teams.home.teamStats.batting.runs}</div>
                                        </td>
                                        <td class="score">${data.liveData.boxscore.teams.home.teamStats.batting.hits}</td>
                                        <td class="score">${data.liveData.boxscore.teams.home.teamStats.fielding.errors}</td>
                                    </tr>
                                    <tr style="border: 1px solid #006c54"></tr>
                                </tbody>
                            </table>
                            ${preGameHTML}
                            ${svgFieldHTML}
                            ${finalStateHTML}
                        </div>
                    </div>
                `;

                // Append the generated HTML to the existing element
                const existingElement = document.getElementById('feedContainer');
                existingElement.innerHTML = gameHTML;

                // Update the SVG with the current game state only if it's In Progress
                if (detailedState === 'In Progress') {
                    updateSVG(data);
                }

            })
            .catch(error => {
                console.error('Error fetching game data:', error);
            });
    }

    // Get the gamePk from the URL and fetch the game data
    const gamePk = getGamePkFromURL();
    if (gamePk) {
        fetchAndDisplayGameData(gamePk);
    }
    
});
