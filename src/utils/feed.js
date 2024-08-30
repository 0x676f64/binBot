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
                    const awayPitcher = data.gameData.probablePitchers.away;
                    const homePitcher = data.gameData.probablePitchers.home;

                    // Ensure the probable pitchers exist before accessing their properties
                    const awayprobablePitchersId = awayPitcher ? awayPitcher.id : null;
                    const homeprobablePitchersId = homePitcher ? homePitcher.id : null;

                    const pitcherAwayKey = awayprobablePitchersId ? `ID${awayprobablePitchersId}` : null;
                    const pitcherHomeKey = homeprobablePitchersId ? `ID${homeprobablePitchersId}` : null;

                    gameStatus = gameTime;
                    preGameHTML = `
                        <div class="probable-pitchers">
                            <div class="prob-pitchers">
                                <div class="away-probs" mode="Scoreboard">
                                    <div class="pre-game-teams-away">${data.gameData.teams.away.franchiseName}</div>
                                    ${awayPitcher ? `
                                        <img class="away-pitcher-icon" srcset="https://midfield.mlbstatic.com/v1/people/${awayprobablePitchersId}/spots/60?zoom=1.2 1.5x">
                                        <div class="away-name">${awayPitcher.fullName}
                                        <span>(${data.gameData.players[pitcherAwayKey]?.pitchHand.code})</span>
                                        </div>
                                        <div class="pre-game-wins">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.wins}</div>
                                        <div class="pre-game-stats">-</div>
                                        <div class="pre-game-loss">${data.liveData.boxscore.teams.away.players[pitcherAwayKey]?.seasonStats?.pitching.losses}</div>
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
                                        <span>(${data.gameData.players[pitcherHomeKey]?.pitchHand.code})</span>
                                        </div>
                                        <div class="pre-game-wins">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.wins}</div>
                                        <div class="pre-game-stats">-</div>
                                        <div class="pre-game-loss">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.losses}</div>
                                        <div class="pre-game-era">${data.liveData.boxscore.teams.home.players[pitcherHomeKey]?.seasonStats?.pitching.era}</div>
                                    ` : `
                                        <div class="home-name">TBD</div>
                                    `}
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
                    inningBoxStyle = 'color: red';

                   // Define svgHeight and playerHeight
                    const svgHeight = 500; // Example height in pixels, adjust as needed
                    const playerHeight = 6.0; // Example player height in feet, adjust as needed

                    // Function to fetch real-time pitch data
                    function fetchRealTimePitchData() {
                        fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
                            .then(response => response.json())
                            .then(data => {
                                console.log('Full Data:', data); // Log the entire data structure

                                // Check if the expected data structure exists
                                if (data.liveData && data.liveData.plays && data.liveData.plays.currentPlay) {
                                    console.log('Current Play:', data.liveData.plays.currentPlay); // Log the current play data
                                    handleRealTimePitchData(data.liveData.plays.currentPlay.playEvents);
                                } else {
                                    console.error('Unexpected data format or live play data not available:', data);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching pitch data:', error);
                            });
                    }

                    // Function to handle and process the pitch data
                    function handleRealTimePitchData(playEvents) {
                        if (playEvents && playEvents.length > 0) {
                            playEvents.forEach(event => {
                                if (event.details && event.details.call && event.pitchData) {
                                    const { pX, pZ } = event.pitchData.coordinates;
                                    const description = event.details.call.description;
                                    console.log('Pitch Data:', { pX, pZ, description }); // Log the pitch data

                                    // Plot the pitch on the strike zone
                                    plotPitch(pX, pZ, description);
                                }
                            });
                        } else {
                            console.warn('No play events or pitch data available.');
                        }
                    }

                    function plotPitch(pX, pZ, description) {
                        // Calculate player height and SVG height based on pitch data
                        const playerHeight = ((pX + 0.5) * 0.8) + 0.1; // Adjust as needed
                        const svgHeight = (pZ - 1.5) / 3; // Adjust 'bottom' and 'height' accordingly
                    
                        // SVG dimensions and strike zone parameters
                        const svgWidth = 170; // Width of the strike zone (17 inches)
                        const centerX = svgWidth / 2; // X center of the strike zone
                        const strikeZoneTop = 50; // The top Y position for the strike zone
                        const strikeZoneHeight = 300; // The height of the strike zone in SVG units
                    
                        // Convert pX and pZ to fit within the SVG viewBox
                        const xPos = centerX + (pX * (svgWidth / 20)); // pX in inches from the center
                        const yPos = strikeZoneTop + (strikeZoneHeight - ((pZ - 1.5) / (4.5 - 1.5)) * strikeZoneHeight);
                    
                        console.log(`Plotting pitch at X: ${xPos}, Y: ${yPos}, Description: ${description}`);
                        console.log(`Player height: ${playerHeight}, SVG height: ${svgHeight}`);
                    
                        // Create a circle element for the pitch
                        const pitchCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                        pitchCircle.setAttribute("cx", xPos);
                        pitchCircle.setAttribute("cy", yPos);
                        pitchCircle.setAttribute("r", 10); // Adjusted radius to fit the SVG
                        pitchCircle.setAttribute("class", "pitch");
                    
                        // Assign color based on pitch description
                        switch (description) {
                            case 'Called Strike' || 'Foul':
                                pitchCircle.setAttribute("fill", "red");
                                break;
                            case 'Ball':
                                pitchCircle.setAttribute("fill", "green");
                                break;
                            case 'In play, out(s)' || 'In play, no out' || 'In play, run(s)':
                                pitchCircle.setAttribute("fill", "blue");
                                break;
                            // Add more cases as needed
                            default:
                                pitchCircle.setAttribute(null);
                        }
                    
                        // Find the SVG element and append the pitch circle
                        const svg = document.querySelector(".strike-zone-box");
                        if (svg) {
                            svg.appendChild(pitchCircle);
                            console.log(`Pitch circle added to SVG at ${xPos}, ${yPos}`);
                        } else {
                            console.error('SVG element not found.');
                        }
                    }
                    
                    // Call fetchRealTimePitchData to start fetching and plotting
                    setInterval(fetchRealTimePitchData, 10000);
                    

                    // Include SVG only if game is In Progress
                    svgFieldHTML = `
                            <svg id="field" width="100" height="100" viewBox="0 0 58 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path id="out-1" d="M19.5 61.5C19.5 64.7795 16.6254 67.5 13 67.5C9.37461 67.5 6.5 64.7795 6.5 61.5C6.5 58.2205 9.37461 55.5 13 55.5C16.6254 55.5 19.5 58.2205 19.5 61.5Z" fill="#D9D9D9" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <path id="out-2" d="M36.5 61.5C36.5 64.7795 33.6254 67.5 30 67.5C26.3746 67.5 23.5 64.7795 23.5 61.5C23.5 58.2205 26.3746 55.5 30 55.5C33.6254 55.5 36.5 58.2205 36.5 61.5Z" fill="#D9D9D9" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <path id="out-3" d="M53.5 61.5C53.5 64.7795 50.6254 67.5 47 67.5C43.3746 67.5 40.5 64.7795 40.5 61.5C40.5 58.2205 43.3746 55.5 47 55.5C50.6254 55.5 53.5 58.2205 53.5 61.5Z" fill="#D9D9D9" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <rect id="third-base" x="17.6066" y="29.7071" width="14" height="14" rx="0.5" transform="rotate(45 17.6066 29.7071)" fill="#FFDDDD" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <rect id="second-base" x="29.364" y="17.7071" width="14" height="14" rx="0.5" transform="rotate(45 29.364 17.7071)" fill="#FFDDDD" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                                <rect id="first-base" x="41.6066" y="29.7071" width="14" height="14" rx="0.5" transform="rotate(45 41.6066 29.7071)" fill="#FFDDDD" stroke="#006C54" stroke-width="1" opacity="0.8"/>
                            </svg>

                            <div class="balls-strikes" id="count" style="color: #2f4858;">${data.liveData.plays.currentPlay.count.balls} - ${data.liveData.plays.currentPlay.count.strikes}</div>

                           <svg class="strike-zone-wrapper" width="300" height="300" viewBox=" 0 0 352 352" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g class="strike-zone-box">
                            <rect class="strike-zone" width="300" height="330" fill="white"/>
                            <g class="strike-zone">
                            <rect class="strikes" x="100" y="88" width="123.19" height="176" stroke="black" stroke-width="2"/>
                            </g>
                            </g>
                            </svg>

                            `;

                } else if (detailedState === 'Suspended: Rain') {
                    gameStatus = 'Suspended';
                    inningBoxStyle = 'color: red';

                } else if (detailedState === 'Final' || detailedState === 'Game Over') {
                    // Show 'Final' when the game is finished and style it in red

                    const winningPitcher = data.liveData.decisions.winner;
                    const losingPitcher = data.liveData.decisions.loser;
                    const savesPitcher = data.liveData.decisions.save;

                    const winningPitcherId = winningPitcher ? winningPitcher.id : null;
                    const losingPitcherId = losingPitcher ? losingPitcher.id : null; 
                    const savesPitcherId = savesPitcher ? savesPitcher.id: null; 
                    
                    const winningPitcherKey = winningPitcherId ? `ID${data.liveData.decisions.winner.id}` : null;
                    const losingPitcherKey = losingPitcherId ? `ID${data.liveData.decisions.loser.id}` : null;
                    const savesPitcherKey = savesPitcherId ? `ID${data.liveData.decisions.save.id}` : null;

                    gameStatus = 'Final';
                    inningBoxStyle = 'color: red;';
                    svgFieldHTML = '';

                    finalStateHTML = `
                        <div class="end-result">
                            <div class="final-results">
                                <div class="winning-pitcher" mode="Scoreboard">
                                ${winningPitcherKey ? `
                                    <img class="win-icon" srcset="https://midfield.mlbstatic.com/v1/people/${winningPitcherId}/spots/60?zoom=1.2 1.5x">
                                <div style="margin-left: 1.7rem; font-size: 1.3rem; font-weight: 400; color: #2F4858; opacity: 0.8;">Win: </div>
                                    <div class="winning-pitcher-name">${data.liveData.decisions.winner.fullName} 
                                        <span>(${data.gameData.players[winningPitcherKey]?.pitchHand.code})</span>
                                    </div>
                                    <div class="win-final-game-wins">${data.liveData.boxscore.teams.home.players[winningPitcherKey]?.seasonStats?.pitching.wins ?? data.liveData.boxscore.teams.away.players[winningPitcherKey]?.seasonStats?.pitching.wins ?? 0}</div>
                                    <div class="win-final-game-stats">-</div>
                                    <div class="win-final-game-losses">${data.liveData.boxscore.teams.home.players[winningPitcherKey]?.seasonStats?.pitching.losses ?? data.liveData.boxscore.teams.away.players[winningPitcherKey]?.seasonStats?.pitching.losses ?? 0}</div>
                                    <div class="win-final-game-era">${data.liveData.boxscore.teams.home.players[winningPitcherKey]?.seasonStats?.pitching.era ?? data.liveData.boxscore.teams.away.players[winningPitcherKey]?.seasonStats?.pitching.era ?? 0}</div>
                                    </div>
                                </div>` : ''}
                                <div class="losing-pitcher" mode="Scoreboard">
                                ${losingPitcherKey ? `
                                    <img class="loss-icon" srcset="https://midfield.mlbstatic.com/v1/people/${losingPitcherId}/spots/60?zoom=1.2 1.5x">
                                    <div style="margin-left: 1.7rem; font-size: 1.3rem; font-weight: 400; color: #2F4858; opacity: 0.8;">Loss</div>
                                    <div class="losing-pitcher-name">${data.liveData.decisions.loser.fullName} 
                                        <span>(${data.gameData.players[losingPitcherKey]?.pitchHand.code})</span>
                                    </div>
                                    <div class="loss-final-game-wins">${data.liveData.boxscore.teams.home.players[losingPitcherKey]?.seasonStats?.pitching.wins ?? data.liveData.boxscore.teams.away.players[losingPitcherKey]?.seasonStats?.pitching.wins ?? 0}</div>
                                    <div class="loss-final-game-stats">-</div>              
                                    <div class="loss-final-game-losses">${data.liveData.boxscore.teams.home.players[losingPitcherKey]?.seasonStats?.pitching.losses ?? data.liveData.boxscore.teams.away.players[losingPitcherKey]?.seasonStats?.pitching.losses ?? 0}</div>
                                    <div class="loss-final-game-era">${data.liveData.boxscore.teams.home.players[losingPitcherKey]?.seasonStats?.pitching.era ?? data.liveData.boxscore.teams.away.players[losingPitcherKey]?.seasonStats?.pitching.era ?? 0}</div>
                                    </div>
                                </div>` : ''}
                                <div class="saves" mode="Scoreboard">
                                ${savesPitcherKey ? `
                                    <img class="saves-icon" srcset="https://midfield.mlbstatic.com/v1/people/${savesPitcherId}/spots/60?zoom=1.2 1.5x">
                                    <div style="margin-left: 5.3rem; font-size: 1.3rem; font-weight: 400; color: #2F4858; opacity: 0.8;">Save</div>
                                    <div class="saves-pitcher-name">${data.liveData.decisions.save.fullName} 
                                        <span>(${data.gameData.players[savesPitcherKey]?.pitchHand.code})</span>
                                    </div>
                                    <div class="final-game-saves">${data.liveData.boxscore.teams.home.players[savesPitcherKey]?.seasonStats?.pitching.saves ?? data.liveData.boxscore.teams.away.players[savesPitcherKey]?.seasonStats?.pitching.saves ?? 0}</div>
                                    </div>
                                </div>` : ''}
                            </div>
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
