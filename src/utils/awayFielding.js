document.addEventListener("DOMContentLoaded", () => {

    const teamMap = {
        108: 'laa', 109: 'az', 110: 'bal', 111: 'bos', 112: 'chc',
        113: 'cin', 114: 'cle', 115: 'col', 116: 'det', 117: 'hou',
        118: 'kc', 119: 'lad', 120: 'was', 121: 'nym', 133: 'oak',
        134: 'pit', 135: 'sd', 136: 'sea', 137: 'sf', 138: 'stl',
        139: 'tb', 140: 'tex', 141: 'tor', 142: 'min', 143: 'phi',
        144: 'atl', 145: 'chw', 146: 'mia', 147: 'nyy', 158: 'mil'
    };

    const colorCode = {
        108: '#BA0021', 109: '#A71930', 110: '#DF4601', 111: '#C62033',
        112: '#0E3386', 113: '#c6011f', 114: '#0C2340', 115: '#33006F',
        116: '#0C2340', 117: '#EB6E1F', 118: '#004687', 119: '#005A9C',
        120: '#AB0003', 121: '#FF5910', 133: '#003831', 134: '#FDB827',
        135: '#2F241D', 136: '#005C5C', 137: '#8b6f4e', 138: '#c41e3a',
        139: '#092c5c', 140: '#003278', 141: '#134A8E', 142: '#002B5C',
        143: '#E81828', 144: '#13274f', 145: '#000000', 146: '#00A3E0',
        147: '#132448', 158: '#12284b'
    };

    function getGamePkFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('gamePk');
    }

    function formatTimeWithAmPm(dateString) {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const date = new Date(dateString);
        return date.toLocaleString('en-US', options);
    }

    function fetchAndDisplayGameData(gamePk) {
        fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
            .then(response => response.json())
            .then(data => {
                const detailedState = data.gameData.status.detailedState;
                let gameStatus = '';
                let inningBoxStyle = '';
                let preGameHTML = '';
                let finalStateHTML = ''; 

                const awayTeamId = Number(data.gameData.teams.away.id);
                const homeTeamId = Number(data.gameData.teams.home.id);
                const awayTeamColor = colorCode[awayTeamId] || '#cccccc';
                const homeTeamColor = colorCode[homeTeamId] || '#cccccc';
                const teamLogosPath = 'images/svg-spots/';
                const awayTeamLogo = `${teamLogosPath}${teamMap[awayTeamId]}.svg`;
                const homeTeamLogo = `${teamLogosPath}${teamMap[homeTeamId]}.svg`;

                if (detailedState === 'Scheduled' || detailedState === 'Pre-Game' || detailedState === 'Warmup' || detailedState === 'Delayed Start: Rain') {
                    const gameTime = formatTimeWithAmPm(data.gameData.datetime.dateTime);
                    const awayPitcher = data.gameData.probablePitchers.away;
                    const homePitcher = data.gameData.probablePitchers.home;

                    gameStatus = gameTime;
                    preGameHTML = `
                        <div class="probable-pitchers">
                            <div class="prob-pitchers">
                                <div class="away-probs" mode="Scoreboard">
                                <div class="pre-game-teams-away">${data.gameData.teams.away.franchiseName}</div>
                                    ${awayPitcher ? `
                                        <img class="away-pitcher-icon" srcset="https://midfield.mlbstatic.com/v1/people/${awayprobablePitchersId}/spots/60?zoom=1.2 1.5x">
                                        <div class="away-name">${awayPitcher.fullName}
                                            <span style="font-weight: 500;">(${data.gameData.players[pitcherAwayKey]?.pitchHand.code})</span>
                                        </div>
                                        <div class="pre-game-wins-loss">
                                            <div class="pre-game-wins">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.wins}</div>
                                            <div class="pre-game-stats">-</div>
                                            <div class="pre-game-loss">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.losses}</div>
                                        </div>
                                        <div class="pre-game-era">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.era}</div>
                                    ` : `
                                        <div class="away-name">TBD</div>
                                    `}
                                </div>
                                <div class="home-probs" mode="Scoreboard">
                                    <div class="pre-game-teams-home">${data.gameData.teams.home.franchiseName}</div>
                                    ${homePitcher ? `
                                        <img class="home-pitcher-icon" srcset="https://midfield.mlbstatic.com/v1/people/${homeprobablePitchersId}/spots/60?zoom=1.2 1.5x">
                                        <div class="home-name">${homePitcher.fullName}
                                            <span style="font-weight: 500;">(${data.gameData.players[pitcherHomeKey]?.pitchHand.code})</span>
                                        </div>
                                        <div class="pre-game-wins-loss">
                                            <div class="pre-game-wins">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.wins}</div>
                                            <div class="pre-game-stats">-</div>
                                            <div class="pre-game-loss">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.losses}</div>
                                        </div>
                                        <div class="pre-game-era">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.era}</div>
                                    ` : `
                                        <div class="home-name">TBD</div>
                                    `}
                                </div>
                            </div>
                        </div>
                        <div class="pregame-misc-table"></div>
                        `;

                     // Insert HTML and call fetch/render
                    document.getElementById('feedContainer').innerHTML = preGameHTML;
                    fetchDataAndRender();


                } else if (detailedState === 'Suspended: Rain') {
                    gameStatus = 'Suspended';
                    inningBoxStyle = 'color:red'; 


                } else if (detailedState === 'Final' || detailedState === 'Game Over') {
                    
                    const winningPitcher = data.liveData.decisions.winner;
                    const losingPitcher = data.liveData.decisions.loser;
                    const savesPitcher = data.liveData.decisions.save;

                    const winningPitcherId = winningPitcher ? winningPitcher.id : null;
                    const losingPitcherId = losingPitcher ? losingPitcher.id : null; 
                    const savesPitcherId = savesPitcher ? savesPitcher.id: null; 
                    
                    const winningPitcherKey = winningPitcherId ? `ID${data.liveData.decisions.winner.id}` : null;
                    const losingPitcherKey = losingPitcherId ? `ID${data.liveData.decisions.loser.id}` : null;
                    const savesPitcherKey = savesPitcherId ? `ID${data.liveData.decisions.save.id}` : null;

                     // Get Team Id
                     const awayTeamId = Number(data.gameData.teams.away.id); // Fetch away team ID
                     const homeTeamId = Number(data.gameData.teams.home.id); // Fetch home team ID
 
                     const awayTeamColor = colorCode[awayTeamId] || '#cccccc';
                     const homeTeamColor = colorCode[homeTeamId] || '#cccccc'; 
 
                     const teamLogosPath = 'images/svg-spots/'; // Define your logos folder path 
 
                     // Get team logo file names dynamically
                     const awayTeamLogo = `${teamLogosPath}${teamMap[awayTeamId]}.svg`;
                     const homeTeamLogo = `${teamLogosPath}${teamMap[homeTeamId]}.svg`;
 

                    gameStatus = 'Final';
                    inningBoxStyle = 'color:red';

                    finalStateHTML = `
                        <div class="end-result">
                        <div class="final-results">
                            <!-- Winning Pitcher -->
                            <div class="winning-pitcher" mode="Scoreboard">
                                ${winningPitcherKey ? `
                                    <img class="win-icon" srcset="https://midfield.mlbstatic.com/v1/people/${winningPitcherId}/spots/60?zoom=1.2 1.5x">
                                    <div style="margin-left: 6rem; font-size: 1.3rem; font-weight: 400; color: #2F4858; opacity: 0.8;">Win</div>
                                    <div style="margin-left: 4rem;" class="winning-pitcher-name">${data.liveData.decisions.winner.fullName} 
                                        <span>(${data.gameData.players[winningPitcherKey]?.pitchHand.code})</span>
                                    </div>
                                    <div class="final-game-wins-loss">
                                        <div class="win-final-game-wins">${data.liveData.boxscore.teams.home.players[winningPitcherKey]?.seasonStats?.pitching.wins ?? data.liveData.boxscore.teams.away.players[winningPitcherKey]?.seasonStats?.pitching.wins ?? 0}</div>
                                        <div class="win-final-game-stats">-</div>
                                        <div class="win-final-game-losses">${data.liveData.boxscore.teams.home.players[winningPitcherKey]?.seasonStats?.pitching.losses ?? data.liveData.boxscore.teams.away.players[winningPitcherKey]?.seasonStats?.pitching.losses ?? 0}</div>
                                    </div>
                                    <div style="margin-left: 5.5rem;" class="win-final-game-era">ERA: ${data.liveData.boxscore.teams.home.players[winningPitcherKey]?.seasonStats?.pitching.era ?? data.liveData.boxscore.teams.away.players[winningPitcherKey]?.seasonStats?.pitching.era ?? 0}</div>
                                ` : ''}
                            </div>

                            <!-- Losing Pitcher -->
                            <div class="losing-pitcher" mode="Scoreboard">
                                ${losingPitcherKey ? `
                                    <img class="loss-icon" srcset="https://midfield.mlbstatic.com/v1/people/${losingPitcherId}/spots/60?zoom=1.2 1.5x">
                                    <div style="margin-left: 4rem; font-size: 1.3rem; font-weight: 400; color: #2F4858; opacity: 0.8;">Loss</div>
                                    <div class="losing-pitcher-name">${data.liveData.decisions.loser.fullName} 
                                        <span>(${data.gameData.players[losingPitcherKey]?.pitchHand.code})</span>
                                    </div>
                                    <div class="final-game-wins-loss">
                                        <div class="loss-final-game-wins">${data.liveData.boxscore.teams.home.players[losingPitcherKey]?.seasonStats?.pitching.wins ?? data.liveData.boxscore.teams.away.players[losingPitcherKey]?.seasonStats?.pitching.wins ?? 0}</div>
                                        <div class="loss-final-game-stats">-</div>
                                        <div class="loss-final-game-losses">${data.liveData.boxscore.teams.home.players[losingPitcherKey]?.seasonStats?.pitching.losses ?? data.liveData.boxscore.teams.away.players[losingPitcherKey]?.seasonStats?.pitching.losses ?? 0}</div>
                                    </div>
                                    <div class="loss-final-game-era">ERA: ${data.liveData.boxscore.teams.home.players[losingPitcherKey]?.seasonStats?.pitching.era ?? data.liveData.boxscore.teams.away.players[losingPitcherKey]?.seasonStats?.pitching.era ?? 0}</div>
                                ` : ''}
                            </div>

                            <!-- Save Pitcher (below winning pitcher) -->
                            <div class="saves" mode="Scoreboard">
                                ${savesPitcherKey ? `
                                    <img class="saves-icon" srcset="https://midfield.mlbstatic.com/v1/people/${savesPitcherId}/spots/60?zoom=1.2 1.5x">
                                    <div style="margin-left: 5.5rem; font-size: 1.3rem; font-weight: 400; color: #2F4858; opacity: 0.8;">Save</div>
                                    <div class="saves-pitcher-name">${data.liveData.decisions.save.fullName} 
                                        <span>(${data.gameData.players[savesPitcherKey]?.pitchHand.code})</span>
                                    </div>
                                    <div class="final-game-saves">${data.liveData.boxscore.teams.home.players[savesPitcherKey]?.seasonStats?.pitching.saves ?? data.liveData.boxscore.teams.away.players[savesPitcherKey]?.seasonStats?.pitching.saves ?? 0}</div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="pregame-misc-table"></div>
                    `;

                     // Insert HTML and call fetch/render
                     document.getElementById('feedContainer').innerHTML = finalStateHTML;
                     fetchDataAndRender();
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
                                <span style="font-size: 1.2rem; display:flex;padding-top:1rem;">${data.gameData.venue.name} &#8226 ${data.gameData.venue.location.city}, ${data.gameData.venue.location.stateAbbrev}</span>
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
                            ${finalStateHTML}
                        </div>               
                `;

                 // Append the generated HTML to the existing element
                 const existingElement = document.getElementById('feedContainer');
                 existingElement.innerHTML = gameHTML;
            })
            .catch(error => {
                console.error('Error fetching game data:', error);
            });
    }

    const gamePk = getGamePkFromURL();
    if (gamePk) {
        fetchAndDisplayGameData(gamePk);
    }
});
