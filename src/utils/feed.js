
document.addEventListener("DOMContentLoaded", () => {

    const teamMap = {
        108: 'laa', // Los Angeles Angels
        109: 'az', // Arizona Diamondbacks
        110: 'bal', // Baltimore Orioles
        111: 'bos', // Boston Red Sox
        112: 'chc', // Chicago Cubs
        113: 'cin', // Cincinnati Reds
        114: 'cle', // Cleveland Guardians
        115: 'col', // Colorado Rockies
        116: 'det', // Detroit Tigers
        117: 'hou', // Houston Astros
        118: 'kc', // Kansas City Royals
        119: 'lad', // Los Angeles Dodgers
        120: 'was', // Washington Nationals
        121: 'nym', // New York Mets
        133: 'oak', // Oakland Athletics 
        134: 'pit', // Pittburgh Pirates
        135: 'sd', // San Diego Padres
        136: 'sea', // Seattle Mariners
        137: 'sf', // San Francisco Giants
        138: 'stl', // St Louis Cardinals
        139: 'tb', // Tampa Bay Rays
        140: 'tex', // Texas Rangers 
        141: 'tor', // Toronto Blue Jays
        142: 'min', // Minesota Twins
        143: 'phi', // Philadelphia Phillies 
        144: 'atl', // Atlanta Braves 
        145: 'chw', // Chicago White Sox
        146: 'mia', // Miami Marlins
        147: 'nyy', // New York Yankees 
        158: 'mil', // Milwaukee Brewers 

    };

    const colorCode = {
        108: '#BA0021',  // LAA
        109: '#A71930',  // AZ
        110: '#DF4601',  // BAL
        111: '#C62033',  // BOS
        112: '#0E3386',  // CHC
        113: '#c6011f',  // CIN
        114: '#0C2340',  // CLE
        115: '#33006F',  // COL
        116: '#0C2340',  // DET
        117: '#EB6E1F',  // HOU
        118: '#004687',  // KC
        119: '#005A9C',  // LAD
        120: '#AB0003',  // WAS
        121: '#FF5910',  // NYM
        133: '#003831',  // OAK
        134: '#FDB827',  // PIT
        135: '#2F241D',  // SD
        136: '#005C5C',  // SEA
        137: '#8b6f4e',  // SF
        138: '#c41e3a',  // STL
        139: '#092c5c',  // TB
        140: '#003278',  // TEX
        141: '#134A8E',  // TOR
        142: '#002B5C',  // MINN
        143: '#E81828',  // PHI
        144: '#13274f',  // ATL
        145: '#000000',  // CHW
        146: '#00A3E0',  // MIA
        147: '#132448',  // NYY
        158: '#12284b',  // MIL
    }

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
                if (detailedState === 'Scheduled' || detailedState === 'Pre-Game' || detailedState === 'Warmup' || detailedState === 'Delayed Start: Rain') {
                    // Get the game time and format it with AM/PM
                    const gameTime = formatTimeWithAmPm(data.gameData.datetime.dateTime);
                    const awayPitcher = data.gameData.probablePitchers.away;
                    const homePitcher = data.gameData.probablePitchers.home;

                    // Ensure the probable pitchers exist before accessing their properties
                    const awayprobablePitchersId = awayPitcher ? awayPitcher.id : null;
                    const homeprobablePitchersId = homePitcher ? homePitcher.id : null;

                    const pitcherAwayKey = awayprobablePitchersId ? `ID${awayprobablePitchersId}` : null;
                    const pitcherHomeKey = homeprobablePitchersId ? `ID${homeprobablePitchersId}` : null;

                    // Get Team Id
                    const awayTeamId = Number(data.gameData.teams.away.id); // Fetch away team ID
                    const homeTeamId = Number(data.gameData.teams.home.id); // Fetch home team ID

                    const awayTeamColor = colorCode[awayTeamId] || '#cccccc';
                    const homeTeamColor = colorCode[homeTeamId] || '#cccccc'; 

                    const teamLogosPath = 'images/svg-spots/'; // Define your logos folder path 

                    // Get team logo file names dynamically
                    const awayTeamLogo = `${teamLogosPath}${teamMap[awayTeamId]}.svg`;
                    const homeTeamLogo = `${teamLogosPath}${teamMap[homeTeamId]}.svg`;

                    // Render Batting Order from Pre-Games
                    const awayBattingOrder = data.liveData.boxscore.teams.away.battingOrder; // Array of player IDs for the away team
                    const homeBattingOrder = data.liveData.boxscore.teams.home.battingOrder; // Array of player IDs for the home team

                    // Manually input all 9 batters so they are dynamically rendered - Away Batters
                    const playerOne = awayBattingOrder[0] ? data.gameData.players[`ID${awayBattingOrder[0]}`]?.boxscoreName || '' : '';
                    const playerTwo = awayBattingOrder[1] ? data.gameData.players[`ID${awayBattingOrder[1]}`]?.boxscoreName || '' : '';
                    const playerThree = awayBattingOrder[2] ? data.gameData.players[`ID${awayBattingOrder[2]}`]?.boxscoreName || '' : '';
                    const playerFour = awayBattingOrder[3] ? data.gameData.players[`ID${awayBattingOrder[3]}`]?.boxscoreName || '' : '';
                    const playerFive = awayBattingOrder[4] ? data.gameData.players[`ID${awayBattingOrder[4]}`]?.boxscoreName || '' : '';
                    const playerSix = awayBattingOrder[5] ? data.gameData.players[`ID${awayBattingOrder[5]}`]?.boxscoreName || '' : '';
                    const playerSeven = awayBattingOrder[6] ? data.gameData.players[`ID${awayBattingOrder[6]}`]?.boxscoreName || '' : '';
                    const playerEight = awayBattingOrder[7] ? data.gameData.players[`ID${awayBattingOrder[7]}`]?.boxscoreName || '' : '';
                    const playerNine = awayBattingOrder[8] ? data.gameData.players[`ID${awayBattingOrder[8]}`]?.boxscoreName || '' : '';

                    // Now do the same for the Home Team Batting Order
                    const homeOne = homeBattingOrder[0] ? data.gameData.players[`ID${homeBattingOrder[0]}`]?.boxscoreName || '' : '';
                    const homeTwo = homeBattingOrder[1] ? data.gameData.players[`ID${homeBattingOrder[1]}`]?.boxscoreName || '' : '';
                    const homeThree = homeBattingOrder[2] ? data.gameData.players[`ID${homeBattingOrder[2]}`]?.boxscoreName || '' : '';
                    const homeFour = homeBattingOrder[3] ? data.gameData.players[`ID${homeBattingOrder[3]}`]?.boxscoreName || '' : '';
                    const homeFive = homeBattingOrder[4] ? data.gameData.players[`ID${homeBattingOrder[4]}`]?.boxscoreName || '' : '';
                    const homeSix = homeBattingOrder[5] ? data.gameData.players[`ID${homeBattingOrder[5]}`]?.boxscoreName || '' : '';
                    const homeSeven = homeBattingOrder[6] ? data.gameData.players[`ID${homeBattingOrder[6]}`]?.boxscoreName || '' : '';
                    const homeEight = homeBattingOrder[7] ? data.gameData.players[`ID${homeBattingOrder[7]}`]?.boxscoreName || '' : '';
                    const homeNine = homeBattingOrder[8] ? data.gameData.players[`ID${homeBattingOrder[8]}`]?.boxscoreName || '' : '';

                    // Example async/await fetch function and render
                    async function fetchDataAndRender() {
                        const data = await fetchData(); // Assuming fetchData is defined elsewhere
                        renderBattingOrders(data);
                    }

                    // Bat Side for the Away Team
                    const awayHandOne = playerOne ? data.gameData.players[`ID${awayBattingOrder[0]}`]?.batSide?.code : '';
                    const awayHandTwo = playerTwo ? data.gameData.players[`ID${awayBattingOrder[1]}`]?.batSide?.code : '';
                    const awayHandThree = playerThree ? data.gameData.players[`ID${awayBattingOrder[2]}`]?.batSide?.code : '';
                    const awayHandFour = playerFour ? data.gameData.players[`ID${awayBattingOrder[3]}`]?.batSide?.code : '';
                    const awayHandFive = playerFive ? data.gameData.players[`ID${awayBattingOrder[4]}`]?.batSide?.code : '';
                    const awayHandSix = playerSix ? data.gameData.players[`ID${awayBattingOrder[5]}`]?.batSide?.code : '';
                    const awayHandSeven = playerSeven ? data.gameData.players[`ID${awayBattingOrder[6]}`]?.batSide?.code : '';
                    const awayHandEight = playerEight ? data.gameData.players[`ID${awayBattingOrder[7]}`]?.batSide?.code : '';
                    const awayHandNine = playerNine ? data.gameData.players[`ID${awayBattingOrder[8]}`]?.batSide?.code : '';

                    // Bat Side for the Home Team 
                    const homeHandOne = homeOne ? data.gameData.players[`ID${homeBattingOrder[0]}`]?.batSide?.code : '';
                    const homeHandTwo = homeTwo ? data.gameData.players[`ID${homeBattingOrder[1]}`]?.batSide?.code : '';
                    const homeHandThree = homeThree ? data.gameData.players[`ID${homeBattingOrder[2]}`]?.batSide?.code : '';
                    const homeHandFour = homeFour ? data.gameData.players[`ID${homeBattingOrder[3]}`]?.batSide?.code : '';
                    const homeHandFive = homeFive ? data.gameData.players[`ID${homeBattingOrder[4]}`]?.batSide?.code : '';
                    const homeHandSix = homeSix ? data.gameData.players[`ID${homeBattingOrder[5]}`]?.batSide?.code : '';
                    const homeHandSeven = homeSeven ? data.gameData.players[`ID${homeBattingOrder[6]}`]?.batSide?.code : '';
                    const homeHandEight = homeEight ? data.gameData.players[`ID${homeBattingOrder[7]}`]?.batSide?.code : '';
                    const homeHandNine = homeNine ? data.gameData.players[`ID${homeBattingOrder[8]}`]?.batSide?.code : '';

                    // Position abbreviation for Away Lineup 
                    const awayFieldOne = playerOne ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[0]}`]?.position.abbreviation : '';
                    const awayFieldTwo = playerTwo ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[1]}`]?.position.abbreviation : '';
                    const awayFieldThree = playerThree ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[2]}`]?.position.abbreviation : '';
                    const awayFieldFour = playerFour ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[3]}`]?.position.abbreviation : '';
                    const awayFieldFive = playerFive ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[4]}`]?.position.abbreviation : '';
                    const awayFieldSix = playerSix ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[5]}`]?.position.abbreviation : '';
                    const awayFieldSeven = playerSeven ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[6]}`]?.position.abbreviation : '';
                    const awayFieldEight = playerEight ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[7]}`]?.position.abbreviation : '';
                    const awayFieldNine = playerNine ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[8]}`]?.position.abbreviation : '';

                    // Position abbreviation for Home Lineup 
                    const homeFieldOne = homeOne ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[0]}`]?.position.abbreviation : '';
                    const homeFieldTwo = homeTwo ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[1]}`]?.position.abbreviation : '';
                    const homeFieldThree = homeThree ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[2]}`]?.position.abbreviation : '';
                    const homeFieldFour = homeFour ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[3]}`]?.position.abbreviation : '';
                    const homeFieldFive = homeFive ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[4]}`]?.position.abbreviation : '';
                    const homeFieldSix = homeSix ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[5]}`]?.position.abbreviation : '';
                    const homeFieldSeven = homeSeven ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[6]}`]?.position.abbreviation : '';
                    const homeFieldEight = homeEight ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[7]}`]?.position.abbreviation : '';
                    const homeFieldNine = homeNine ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[8]}`]?.position.abbreviation : '';


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
                        <div class="pregame-misc-table">
                            <div class="team-color away-team-color" style="background-color: ${awayTeamColor};">
                                <div class="pre-game-teams-away">
                                    <img src="${awayTeamLogo}" class="svg-spots away-svg">
                                    <div id="away-batting-order"></div> 
                                </div>
                            </div>
                            <div class="team-color home-team-color" style="background-color: ${homeTeamColor};">
                                <div class="pre-game-teams-home">
                                    <img src="${homeTeamLogo}" class="svg-spots home-svg">
                                    <div id="home-batting-order"></div>
                                </div>
                            </div>

                            <div class="lineup-title">
                            Starting Lineups
                            <div class="small-title">
                            <div class="oval">2024 BATTING AVERAGE</div>
                            </div>
                            <div class="small-title-2">
                            <div class="oval2">LAST 10 GAMES</div>
                            </div>

                            <!-- Table for lineup card -->
                            <table class="lineup-table">
                                <tbody>
                                    <tr>
                                        <td class="batSide" id="awayOrder">${awayFieldOne} ${playerOne} ${awayHandOne}</td>
                                        <td id="numbers">1</td>
                                        <td id="homeOrder">${homeHandOne} ${homeOne} ${homeFieldOne}</td>
                                    </tr>
                                    <tr>
                                        <td id="awayOrder">${awayFieldTwo} ${playerTwo} ${awayHandTwo}</td>
                                        <td id="numbers">2</td>
                                        <td id="homeOrder">${homeHandTwo} ${homeTwo} ${homeFieldTwo}</td>
                                    </tr>
                                    <tr>
                                        <td id="awayOrder">${awayFieldThree} ${playerThree} ${awayHandThree}</td>
                                        <td id="numbers">3</td>
                                        <td id="homeOrder">${homeHandThree} ${homeThree} ${homeFieldThree}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldFour} ${playerFour} ${awayHandFour}</td>
                                        <td id="numbers">4</td>
                                        <td id="homeOrder">${homeHandFour} ${homeFour} ${homeFieldFour}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldFive} ${playerFive} ${awayHandFive}</td>
                                        <td id="numbers">5</td>
                                        <td id="homeOrder">${homeHandFive} ${homeFive} ${homeFieldFive}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldSix} ${playerSix} ${awayHandSix}</td>
                                        <td id="numbers">6</td>
                                        <td id="homeOrder">${homeHandSix} ${homeSix} ${homeFieldSix}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldSeven} ${playerSeven} ${awayHandSeven}</td>
                                        <td id="numbers">7</td>
                                        <td id="homeOrder">${homeHandSeven} ${homeSeven} ${homeFieldSeven}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldEight} ${playerEight} ${awayHandEight}</td>
                                        <td id="numbers">8</td>
                                        <td id="homeOrder">${homeHandEight} ${homeEight} ${homeFieldEight}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldNine} ${playerNine} ${awayHandNine}</td>
                                        <td id="numbers">9</td>
                                        <td id="homeOrder">${homeHandNine} ${homeNine} ${homeFieldNine}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;

                    // Insert HTML and call fetch/render
                    document.getElementById('feedContainer').innerHTML = preGameHTML;
                    fetchDataAndRender();

                } else if (detailedState === 'Live' || detailedState === 'In Progress') {
                    // Get inning data
                    const inningHalf = gameDatabase.linescore.inningHalf;
                    const inningOrdinal = gameDatabase.linescore.currentInningOrdinal;

                    // Combine inningHalf and inningOrdinal
                    gameStatus = `${inningHalf} ${inningOrdinal}`;
                    inningBoxStyle = 'color: red';

                    // Function to fetch real-time pitch data
                    function fetchRealTimePitchData() {
                        fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`)
                            .then(response => response.json())
                            .then(data => {
                                console.log('Full Data:', data); // Log the entire data structure

                                if (data.gameData && data.liveData && data.liveData.plays && data.liveData.plays.currentPlay) {
                                    const batterId = data.liveData.plays.currentPlay.matchup.batter.id;
                                    const playEvents = data.liveData.plays.currentPlay.playEvents;

                                    // Clear previous pitches if a new batter is up
                                    const lastBatterId = localStorage.getItem('lastBatterId');
                                    if (batterId !== lastBatterId) {
                                        clearPitches();
                                        localStorage.setItem('lastBatterId', batterId);
                                    }

                                    // Fetch the common strike zone top and bottom from the playEvents (first pitch available)
                                    let strikeZoneTop = null;
                                    let strikeZoneBottom = null;

                                    for (let event of playEvents) {
                                        if (event.pitchData) {
                                            strikeZoneTop = event.pitchData.strikeZoneTop;
                                            strikeZoneBottom = event.pitchData.strikeZoneBottom;
                                            break; // Exit loop after finding the first pitch
                                        }
                                    }

                                    if (strikeZoneTop && strikeZoneBottom) {
                                        handleRealTimePitchData(playEvents, strikeZoneTop, strikeZoneBottom);
                                    } else {
                                        console.error('Strike zone data unavailable.');
                                    }
                                } else {
                                    console.error('Unexpected data format or live play data not available:', data);
                                }
                            })
                            .catch(error => {
                                console.error('Error fetching pitch data:', error);
                            });
                    }

                                // Function to handle and process the pitch data
                                function handleRealTimePitchData(playEvents, strikeZoneTop, strikeZoneBottom) {
                                    if (playEvents && playEvents.length > 0) {
                                        playEvents.forEach(event => {
                                            if (event.details && event.details.call && event.pitchData) {
                                                const { pX, pZ } = event.pitchData.coordinates;
                                                const description = event.details.call.description;

                                                console.log('Pitch Data:', { pX, pZ, description }); // Log the pitch data

                                                // Plot the pitch on the strike zone with common top and bottom values
                                                plotPitch(pX, pZ, description, strikeZoneTop, strikeZoneBottom);
                                            }
                                        });
                                    } else {
                                        console.warn('No play events or pitch data available.');
                                    }
                                }

                            // Function to plot a pitch on the SVG strike zone using real pixel values
                                function plotPitch(pX, pZ, description, strikeZoneTop, strikeZoneBottom) {
                                    const svgWidth = 454; // Actual width of the strike zone SVG in px
                                    const svgHeight = 550; // Actual height of the strike zone SVG in px
                                    const centerX = svgWidth / 2; // Center of the strike zone horizontally (X-axis)
                                    const centerY = svgHeight / 2; // Center of the strike zone vertically (Y-axis)

                                    // Calculate the dynamic height of the strike zone
                                    const strikeZoneHeight = strikeZoneTop - strikeZoneBottom;

                                    // Scale the pX and pZ coordinates to the SVG dimensions
                                    // Convert pX from -8.5 to +8.5 inches to actual pixel coordinates
                                    const xPos = centerX + (pX * (svgWidth / 17)); // Map pX to the full strike zone width (17 inches = 454px)

                                    // Map pZ (vertical) from the strike zone height to the actual pixel coordinates
                                    const yPos = svgHeight - ((pZ - strikeZoneBottom) / strikeZoneHeight) * svgHeight;

                                    console.log(`Plotting pitch at X: ${xPos}, Y: ${yPos}, Description: ${description}`);
                                    console.log(`Strike Zone Top: ${strikeZoneTop}, Bottom: ${strikeZoneBottom}`);

                                    // Create a circle element for the pitch
                                    const pitchCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                                    pitchCircle.setAttribute("cx", xPos);  // Adjusted X position based on the center of the SVG
                                    pitchCircle.setAttribute("cy", yPos);  // Adjusted Y position
                                    pitchCircle.setAttribute("r", 5);      // Adjusted radius to fit the SVG
                                    pitchCircle.setAttribute("class", "pitch");

                                    // Assign color based on pitch description
                                    switch (description) {
                                        case 'Called Strike':
                                        case 'Foul':
                                        case 'Swinging Strike':
                                            pitchCircle.setAttribute("fill", "#D22D49");
                                            break;
                                        case 'Ball':
                                        case 'Ball in Dirt':
                                            pitchCircle.setAttribute("fill", "#EEE716");
                                            break;
                                        case 'In play, out(s)':
                                        case 'In play, no out':
                                        case 'In play, run(s)':
                                            pitchCircle.setAttribute("fill", "#00D1ED");
                                            break;
                                        default:
                                            pitchCircle.setAttribute(null);
                                    }

                                    // Add stroke to all pitches
                                    pitchCircle.setAttribute("stroke", "black");
                                    pitchCircle.setAttribute("stroke-width", "1");

                                    // Find the SVG element and append the pitch circle
                                    const svg = document.querySelector(".strike-zone");
                                    if (svg) {
                                        svg.appendChild(pitchCircle);
                                        console.log(`Pitch circle added to SVG at ${xPos}, ${yPos}`);
                                    } else {
                                        console.error('SVG element not found.');
                                    }
                                }

                                // Function to clear all previous pitches
                                function clearPitches() {
                                    const svg = document.getElementById("strikeZone");
                                    if (svg) {
                                        const pitches = svg.querySelectorAll(".pitch");
                                        pitches.forEach(pitch => pitch.remove());
                                        console.log('Cleared all previous pitches.');
                                    } else {
                                        console.error('SVG element not found.');
                                    }
                                }

            // Call fetchRealTimePitchData every 10 seconds
           // setInterval(fetchRealTimePitchData, 10000);

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

                        <svg class="svg-1" width="450" height="500" viewBox=" 0 0 400 400">
                            <g transform="scale(0.65) translate(100,175)">
                            <rect width="500" height="500" fill="none" stroke="none"> </rect>
                            <g>
                            <defs>
                            <style id="overall-color">.e{fill:#006c54;stroke:#ffdddd;}.e,.f{stroke-miterlimit:10;}.f{fill:#006c54;stroke:#ffdddd;opacity:0.8;}</style>
                            </defs>
                            <g id="a"/>
                            <g id="b">
                            <g id="c">
                            <g id="d">
                            <path class="f" d="M146.94,96.6c23.31,13.83,19.38,9.82,19.38,9.82,0,0,2.54-.65,1.58,1.98-.99,2.7-1.91,4.41-3.22,5.85-.96,1.05-2.31-1.11-2.31-2.3s-17.4-10.71-17.4-10.71"/>
                            <path class="e" d="M163.54,107.7c.79-3.56-5.93-7.9-11.85-11.46-1.97-1.18-3.8-1.23-5.38-.76l-9.64-5.56v-5.93c-.4-18.18-21.73-17.39-25.69-16.99-3.91,.39-28.75,8.15-20.4,28.64-11.95,2.93-27.14,10.42-34.13,14.83-7.51,4.74-9.09,30.43-9.88,52.16-.79,21.73-8.3,45.05-9.09,47.02-.79,1.98,.4,6.32,1.58,8.3s-1.19,3.56-1.19,3.56c0,0-7.9,1.98-13.44,18.57-5.53,16.6-.57,29.5,1.98,33.98,2.12,3.73,12.19,17.34,16.2,22.13,1.3,1.55,17.78,30.03,20.15,35.17s1.19,17.39,.79,17.78-3.52,3.97-6.33,8.52c-2.82,4.58-8.69,18.74-14.22,32.57s-15.02,51.77-15.02,51.77c0,0-6.72,23.31-3.56,28.85,3.16,5.53,23.71,3.16,31.61,2.37s20.15,4.35,29.24,3.56,16.2-2.77,17.78-9.09-18.33-8.4-28.85-16.11c-6.86-5.03-11.87-7.79-13.84-10.16-1.98-2.37,2.1-7.88,4.38-10.69,1.25-1.53,4.32-8.09,5.12-9.27,.79-1.19,18.97-45.05,19.76-46.63,.22-.43,1.43-2.47,3.14-5.41-3.56,21.65-9.46,32.68-9.46,32.68,0,0-6.72,13.83-2.37,19.36s15.41,2.77,24.5,2.77,16.99,3.16,23.31,1.98,15.02-6.72,15.81-9.88-8.96-5.24-13.44-6.32c-6.27-1.52-7.34,.87-16.43-10.98s-.18-38.72-.18-38.72c0,0,7.47-18.94,8.23-27.16,.68-7.25-4.27-23.12-10.6-46.82s-15.41-28.06-16.99-30.82-.79-10.67-.79-10.67c0,0,3.16,1.58,5.93,1.98s5.53-4.74,11.46-17.39c5.93-12.65,8.3-35.56,8.69-38.73,.4-3.16,4.35-13.04,4.35-13.04,0,0,17.78,4.74,21.73,5.14s11.85,1.98,14.23-1.98c2.37-3.95,2.37-16.2,2.37-24.1s-6.32-28.06-6.72-30.03,1.19-5.93,1.98-7.11c.79-1.19,4.35-8.3,5.14-11.85Zm-16.2,28.06c-.4,5.14-3.56,16.2-3.56,16.2,0,0-8.69-4.74-15.81-10.27-7.11-5.53-16.99-4.74-16.99-4.74l.79-3.16c.79-3.16,6.72-6.72,13.83-6.72s6.72-9.09,6.72-9.09c0,0,3.95-11.46,4.35-11.85,.27-.27,1.81-3.62,2.77-5.76,.46-1.01,1.37-.87,1.37-.87,.51,.03,.39-.85,.82-.85-.4,.45-.62,.76-.62,.76,0,0-.79,1.19-1.58,3.16s.4,9.48,.4,12.65,3.16,5.93,5.14,7.51c1.98,1.58,2.77,7.9,2.37,13.04Z"/>
                            <path class="e" d="M139.48,100.6c.46-1.01,.79-1.75,.79-1.75,.51,.03,.97,.04,1.41,.03"/>
                            <path class="e" d="M92.78,369.4c4.58-7.84,12-22.09,14.67-28.86,1.82-4.61-1.98-19.76-1.98-19.76,0,0-6.72-36.75-7.51-37.14"/>
                            <path class="f" d="M144.1,101.73s-34.4-21.36-34.76-21.3c0,0-40.7-24.5-48.21-28.06C53.62,48.82,9.59,19.08,1.86,14.44c-3.95-2.37,1.98-9.88,1.98-9.88C8.37-.06,8.97-.57,12.92,2.19c2.07,1.45,42.68,26.48,59.67,39.52s41.72,35.8,63.49,48.72"/>
                            <path class="e" d="M59.34,117.54c.09,.26,3.33,14.72,21.29,17.52,0,0,5.78,2.28,8.5-3.07s10.86-11.74,18.31-14.81c7.45-3.07,21.46-9.9,22.95-10.16s8.06-2.54,9.99-3.94c1.93-1.4,9.55-7.1,7.01-9.46s-14.02-11.39-17.17-11.04-6.31,1.58-8.23,4.03c-1.93,2.45-2.63,5.96-3.68,6.48s-2.28,.88-8.76,1.75-20.28,1.14-20.28,1.14c.21-.18-19.86,6.44-33.92,15.37"/>
                            </g>
                            </g>
                            </g>
                            <defs>
                            <style id="bat-color">.e{fill:#006c54;stroke:#d6d6d6;}.e,.f{stroke-miterlimit:10;}.f{fill:#006c54;stroke:#bababa;opacity: 1;}</style>
                            </defs>
                            <g id="a"/>
                            <g id="b" transform="translate(340, 0)">
                            <g id="c">
                            <g id="d">
                            <path class="f" d="M21.68,96.6C-1.64,110.43,2.3,106.42,2.3,106.42c0,0-2.54-.65-1.58,1.98,.99,2.7,1.91,4.41,3.22,5.85,.96,1.05,2.31-1.11,2.31-2.3s17.4-10.71,17.4-10.71"> </path>
                            <path class="e" d="M10.22,119.55c.79,1.19,2.37,5.14,1.98,7.11s-6.72,22.13-6.72,30.03c0,7.9,0,20.15,2.37,24.1s10.27,2.37,14.23,1.98,21.73-5.14,21.73-5.14c0,0,3.95,9.88,4.35,13.04,.4,3.16,2.77,26.08,8.69,38.73,5.93,12.65,8.69,17.78,11.46,17.39s5.93-1.98,5.93-1.98c0,0,.79,7.9-.79,10.67s-10.67,7.11-16.99,30.82c-6.32,23.71-11.28,39.57-10.6,46.82,.77,8.21,8.23,27.16,8.23,27.16,0,0,8.91,26.87-.18,38.72s-10.16,9.46-16.43,10.98c-4.48,1.09-14.23,3.16-13.44,6.32,.79,3.16,9.48,8.69,15.81,9.88s14.23-1.98,23.31-1.98,20.15,2.77,24.5-2.77c4.35-5.53-2.37-19.36-2.37-19.36,0,0-5.9-11.02-9.46-32.68,1.71,2.94,2.93,4.98,3.14,5.41,.79,1.58,18.97,45.44,19.76,46.63s3.87,7.74,5.12,9.27c2.28,2.8,6.36,8.32,4.38,10.69s-6.98,5.13-13.84,10.16c-10.51,7.71-30.43,9.79-28.85,16.11,1.58,6.32,8.69,8.3,17.78,9.09,9.09,.79,21.34-4.35,29.24-3.56s28.45,3.16,31.61-2.37c3.16-5.53-3.56-28.85-3.56-28.85,0,0-9.48-37.94-15.02-51.77-5.53-13.83-11.4-28-14.22-32.57-2.8-4.56-5.93-8.13-6.33-8.52s-1.58-12.65,.79-17.78,18.85-33.62,20.15-35.17c4.01-4.79,14.08-18.4,16.2-22.13,2.55-4.48,7.51-17.39,1.98-33.98-5.53-16.6-13.44-18.57-13.44-18.57,0,0-2.37-1.58-1.19-3.56,1.19-1.98,2.37-6.32,1.58-8.3s-8.3-25.29-9.09-47.02-2.37-47.42-9.88-52.16c-6.99-4.41-22.18-11.9-34.13-14.83,8.34-20.49-16.49-28.24-20.4-28.64-3.95-.4-25.29-1.19-25.69,16.99v5.93l-9.64,5.56c-1.58-.46-3.41-.42-5.38,.76-5.93,3.56-12.65,7.9-11.85,11.46s4.35,10.67,5.14,11.85Zm13.44,3.16c1.98-1.58,5.14-4.35,5.14-7.51,0-3.16,1.19-10.67,.4-12.65-.79-1.98-1.58-3.16-1.58-3.16,0,0-.22-.31-.62-.76,.43,0,.31,.88,.82,.85,0,0,.92-.15,1.37,.87,.96,2.13,2.5,5.49,2.77,5.76,.4,.4,4.35,11.85,4.35,11.85,0,0-.4,9.09,6.72,9.09s13.04,3.56,13.83,6.72l.79,3.16s-9.88-.79-16.99,4.74c-7.11,5.53-15.81,10.27-15.81,10.27,0,0-3.16-11.06-3.56-16.2-.4-5.14,.4-11.46,2.37-13.04Z"> </path>
                            <path class="e" d="M29.14,100.6c-.46-1.01-.79-1.75-.79-1.75-.51,.03-.97,.04-1.41,.03"> </path>
                            <path class="e" d="M75.84,369.4c-4.58-7.84-12-22.09-14.67-28.86-1.82-4.61,1.98-19.76,1.98-19.76,0,0,6.72-36.75,7.51-37.14"> </path>
                            <path class="f" d="M24.52,101.73s34.4-21.36,34.76-21.3c0,0,40.7-24.5,48.21-28.06,7.51-3.56,51.55-33.3,59.27-37.94,3.95-2.37-1.98-9.88-1.98-9.88-4.54-4.62-5.14-5.14-9.09-2.37-2.07,1.45-42.68,26.48-59.67,39.52-16.99,13.04-41.72,35.8-63.49,48.72"> </path>
                            <path class="e" d="M109.28,117.54c-.09,.26-3.33,14.72-21.29,17.52,0,0-5.78,2.28-8.5-3.07s-10.86-11.74-18.31-14.81-21.46-9.9-22.95-10.16-8.06-2.54-9.99-3.94c-1.93-1.4-9.55-7.1-7.01-9.46s14.02-11.39,17.17-11.04,6.31,1.58,8.23,4.03c1.93,2.45,2.63,5.96,3.68,6.48s2.28,.88,8.76,1.75c6.48,.88,20.28,1.14,20.28,1.14-.21-.18,19.86,6.44,33.92,15.37"> </path>
                            </g>
                            </g>
                            </g>
                            <defs>
                            <style id="overall-color">.e{fill:#006c54;stroke:#ffdddd;stroke-miterlimit:10;opacity:0.7;}</style>
                            </defs>
                            <g id="a"> </g>
                            <g id="b" transform="translate(190, 400) scale(1.13, 0.954)">
                            <g id="c">
                            <path id="d" class="e" d="M.5,33.51s52.15,17.56,52.15,17.56l53.21-17.56L91.81,.85,13.85,.5,.5,33.51Z"> </path>
                            </g>
                            </g>
                            <g id="strikeZone">
                            <rect class="strike-zone" x="205.729375" width="88.54124999999999" y="178.57142857142856" height="142.85714285714283" fill-opacity="0.001" stroke-opacity="1" style="fill: none; stroke: rgb(0, 0, 0);"> </rect>
                            </g>
                            </g>
                            <g> </g>
                            </g>
                        </svg> 
                       <div class="live-misc-table">
                            <table class="misc-right-side">
                                <thead>
                                <tr>
                                        <th colspan="5" class="th-name-header"></th>
                                        <th colspan="7" class="th-title-header">Advanced Metrics</th>
                                </tr>
                                <tr class="tr-component-row">
                                        <th id="metricsContainer_th-0" class="ev-sort"></th>
                                        <th id="metricsContainer_th-1" class="ev-sort">Batter</th>
                                        <th id="metricsContainer_th-2" class="ev-sort">PA</th>
                                        <th id="metricsContainer_th-3" class="ev-sort">Inn.</th>
                                        <th id="metricsContainer_th-4" class="ev-sort">Result</th>
                                        <th id="metricsContainer_th-5" class="ev-sort tooltip-hover" title="Exit Velocity (MPH)">Exit Velo</th>
                                        <th id="metricsContainer_th-6" class="ev-sort tooltip-hover" title="Launch Angle (Degrees)">LA</th>
                                        <th id="metricsContainer_th-7" class="ev-sort tooltip-hover" title="Hit Distance (Feet)">Hit Dist.</th>
                                        <th id="metricsContainer_th-8" class="ev-sort tooltip-hover" >Bat Speed</th>
                                        <th id="metricsContainer_th-9" class="ev-sort tooltip-hover" >Pitch Velocity</th>
                                </tr>
                                </thead>
                            </table>
                            </div>
                        </div>
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

                     // Get Team Id
                     const awayTeamId = Number(data.gameData.teams.away.id); // Fetch away team ID
                     const homeTeamId = Number(data.gameData.teams.home.id); // Fetch home team ID
 
                     const awayTeamColor = colorCode[awayTeamId] || '#cccccc';
                     const homeTeamColor = colorCode[homeTeamId] || '#cccccc'; 
 
                     const teamLogosPath = 'images/svg-spots/'; // Define your logos folder path 
 
                     // Get team logo file names dynamically
                     const awayTeamLogo = `${teamLogosPath}${teamMap[awayTeamId]}.svg`;
                     const homeTeamLogo = `${teamLogosPath}${teamMap[homeTeamId]}.svg`;
 
                     // Render Batting Order from Pre-Games
                     const awayBattingOrder = data.liveData.boxscore.teams.away.battingOrder; // Array of player IDs for the away team
                     const homeBattingOrder = data.liveData.boxscore.teams.home.battingOrder; // Array of player IDs for the home team
 
                    // Manually input all 9 batters so they are dynamically rendered - Away Batters
                    const playerOne = awayBattingOrder[0] ? data.gameData.players[`ID${awayBattingOrder[0]}`]?.boxscoreName || '' : '';
                    const playerTwo = awayBattingOrder[1] ? data.gameData.players[`ID${awayBattingOrder[1]}`]?.boxscoreName || '' : '';
                    const playerThree = awayBattingOrder[2] ? data.gameData.players[`ID${awayBattingOrder[2]}`]?.boxscoreName || '' : '';
                    const playerFour = awayBattingOrder[3] ? data.gameData.players[`ID${awayBattingOrder[3]}`]?.boxscoreName || '' : '';
                    const playerFive = awayBattingOrder[4] ? data.gameData.players[`ID${awayBattingOrder[4]}`]?.boxscoreName || '' : '';
                    const playerSix = awayBattingOrder[5] ? data.gameData.players[`ID${awayBattingOrder[5]}`]?.boxscoreName || '' : '';
                    const playerSeven = awayBattingOrder[6] ? data.gameData.players[`ID${awayBattingOrder[6]}`]?.boxscoreName || '' : '';
                    const playerEight = awayBattingOrder[7] ? data.gameData.players[`ID${awayBattingOrder[7]}`]?.boxscoreName || '' : '';
                    const playerNine = awayBattingOrder[8] ? data.gameData.players[`ID${awayBattingOrder[8]}`]?.boxscoreName || '' : '';

                    // Now do the same for the Home Team Batting Order
                    const homeOne = homeBattingOrder[0] ? data.gameData.players[`ID${homeBattingOrder[0]}`]?.boxscoreName || '' : '';
                    const homeTwo = homeBattingOrder[1] ? data.gameData.players[`ID${homeBattingOrder[1]}`]?.boxscoreName || '' : '';
                    const homeThree = homeBattingOrder[2] ? data.gameData.players[`ID${homeBattingOrder[2]}`]?.boxscoreName || '' : '';
                    const homeFour = homeBattingOrder[3] ? data.gameData.players[`ID${homeBattingOrder[3]}`]?.boxscoreName || '' : '';
                    const homeFive = homeBattingOrder[4] ? data.gameData.players[`ID${homeBattingOrder[4]}`]?.boxscoreName || '' : '';
                    const homeSix = homeBattingOrder[5] ? data.gameData.players[`ID${homeBattingOrder[5]}`]?.boxscoreName || '' : '';
                    const homeSeven = homeBattingOrder[6] ? data.gameData.players[`ID${homeBattingOrder[6]}`]?.boxscoreName || '' : '';
                    const homeEight = homeBattingOrder[7] ? data.gameData.players[`ID${homeBattingOrder[7]}`]?.boxscoreName || '' : '';
                    const homeNine = homeBattingOrder[8] ? data.gameData.players[`ID${homeBattingOrder[8]}`]?.boxscoreName || '' : '';

                     // Example async/await fetch function and render
                     async function fetchDataAndRender() {
                         const data = await fetchData(); // Assuming fetchData is defined elsewhere
                         renderBattingOrders(data);
                     }

                     // Bat Side for the Away Team
                    const awayHandOne = playerOne ? data.gameData.players[`ID${awayBattingOrder[0]}`]?.batSide?.code : '';
                    const awayHandTwo = playerTwo ? data.gameData.players[`ID${awayBattingOrder[1]}`]?.batSide?.code : '';
                    const awayHandThree = playerThree ? data.gameData.players[`ID${awayBattingOrder[2]}`]?.batSide?.code : '';
                    const awayHandFour = playerFour ? data.gameData.players[`ID${awayBattingOrder[3]}`]?.batSide?.code : '';
                    const awayHandFive = playerFive ? data.gameData.players[`ID${awayBattingOrder[4]}`]?.batSide?.code : '';
                    const awayHandSix = playerSix ? data.gameData.players[`ID${awayBattingOrder[5]}`]?.batSide?.code : '';
                    const awayHandSeven = playerSeven ? data.gameData.players[`ID${awayBattingOrder[6]}`]?.batSide?.code : '';
                    const awayHandEight = playerEight ? data.gameData.players[`ID${awayBattingOrder[7]}`]?.batSide?.code : '';
                    const awayHandNine = playerNine ? data.gameData.players[`ID${awayBattingOrder[8]}`]?.batSide?.code : '';

                    // Bat Side for the Home Team 
                    const homeHandOne = homeOne ? data.gameData.players[`ID${homeBattingOrder[0]}`]?.batSide?.code : '';
                    const homeHandTwo = homeTwo ? data.gameData.players[`ID${homeBattingOrder[1]}`]?.batSide?.code : '';
                    const homeHandThree = homeThree ? data.gameData.players[`ID${homeBattingOrder[2]}`]?.batSide?.code : '';
                    const homeHandFour = homeFour ? data.gameData.players[`ID${homeBattingOrder[3]}`]?.batSide?.code : '';
                    const homeHandFive = homeFive ? data.gameData.players[`ID${homeBattingOrder[4]}`]?.batSide?.code : '';
                    const homeHandSix = homeSix ? data.gameData.players[`ID${homeBattingOrder[5]}`]?.batSide?.code : '';
                    const homeHandSeven = homeSeven ? data.gameData.players[`ID${homeBattingOrder[6]}`]?.batSide?.code : '';
                    const homeHandEight = homeEight ? data.gameData.players[`ID${homeBattingOrder[7]}`]?.batSide?.code : '';
                    const homeHandNine = homeNine ? data.gameData.players[`ID${homeBattingOrder[8]}`]?.batSide?.code : '';

                    // Position abbreviation for Away Lineup 
                    const awayFieldOne = playerOne ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[0]}`]?.position.abbreviation : '';
                    const awayFieldTwo = playerTwo ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[1]}`]?.position.abbreviation : '';
                    const awayFieldThree = playerThree ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[2]}`]?.position.abbreviation : '';
                    const awayFieldFour = playerFour ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[3]}`]?.position.abbreviation : '';
                    const awayFieldFive = playerFive ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[4]}`]?.position.abbreviation : '';
                    const awayFieldSix = playerSix ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[5]}`]?.position.abbreviation : '';
                    const awayFieldSeven = playerSeven ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[6]}`]?.position.abbreviation : '';
                    const awayFieldEight = playerEight ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[7]}`]?.position.abbreviation : '';
                    const awayFieldNine = playerNine ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[8]}`]?.position.abbreviation : '';

                    // Position abbreviation for Home Lineup 
                    const homeFieldOne = homeOne ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[0]}`]?.position.abbreviation : '';
                    const homeFieldTwo = homeTwo ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[1]}`]?.position.abbreviation : '';
                    const homeFieldThree = homeThree ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[2]}`]?.position.abbreviation : '';
                    const homeFieldFour = homeFour ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[3]}`]?.position.abbreviation : '';
                    const homeFieldFive = homeFive ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[4]}`]?.position.abbreviation : '';
                    const homeFieldSix = homeSix ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[5]}`]?.position.abbreviation : '';
                    const homeFieldSeven = homeSeven ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[6]}`]?.position.abbreviation : '';
                    const homeFieldEight = homeEight ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[7]}`]?.position.abbreviation : '';
                    const homeFieldNine = homeNine ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[8]}`]?.position.abbreviation : '';
 

                    gameStatus = 'Final';
                    inningBoxStyle = 'color: red;';
                    svgFieldHTML = '';

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
                   <div class="pregame-misc-table">
                            <div class="team-color away-team-color" style="background-color: ${awayTeamColor};">
                                <div class="pre-game-teams-away">
                                    <img src="${awayTeamLogo}" class="svg-spots away-svg">
                                    <div id="away-batting-order"></div> 
                                </div>
                            </div>
                            <div class="team-color home-team-color" style="background-color: ${homeTeamColor};">
                                <div class="pre-game-teams-home">
                                    <img src="${homeTeamLogo}" class="svg-spots home-svg">
                                    <div id="home-batting-order"></div>
                                </div>
                            </div>
                            <div class="lineup-title">
                            Starting Lineups
                            <div class="small-title">
                            <div class="oval">2024 BATTING AVERAGE</div>
                            </div>
                            <div class="small-title-2">
                            <div class="oval2">LAST 10 GAMES</div>
                            </div>

                            <!-- Table for lineup card -->
                            <table class="lineup-table">
                                <tbody>
                                     <tr>
                                        <td class="fieldPos batSide" id="awayOrder">${awayFieldOne} ${playerOne} ${awayHandOne}</td>
                                        <td id="numbers">1</td>
                                        <td id="homeOrder">${homeHandOne} ${homeOne} ${homeFieldOne}</td>
                                    </tr>
                                    <tr>
                                        <td id="awayOrder">${awayFieldTwo} ${playerTwo} ${awayHandTwo}</td>
                                        <td id="numbers">2</td>
                                        <td id="homeOrder">${homeHandTwo} ${homeTwo} ${homeFieldTwo}</td>
                                    </tr>
                                    <tr>
                                        <td id="awayOrder">${awayFieldThree} ${playerThree} ${awayHandThree}</td>
                                        <td id="numbers">3</td>
                                        <td id="homeOrder">${homeHandThree} ${homeThree} ${homeFieldThree}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldFour} ${playerFour} ${awayHandFour}</td>
                                        <td id="numbers">4</td>
                                        <td id="homeOrder">${homeHandFour} ${homeFour} ${homeFieldFour}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldFive} ${playerFive} ${awayHandFive}</td>
                                        <td id="numbers">5</td>
                                        <td id="homeOrder">${homeHandFive} ${homeFive} ${homeFieldFive}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldSix} ${playerSix} ${awayHandSix}</td>
                                        <td id="numbers">6</td>
                                        <td id="homeOrder">${homeHandSix} ${homeSix} ${homeFieldSix}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldSeven} ${playerSeven} ${awayHandSeven}</td>
                                        <td id="numbers">7</td>
                                        <td id="homeOrder">${homeHandSeven} ${homeSeven} ${homeFieldSeven}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldEight} ${playerEight} ${awayHandEight}</td>
                                        <td id="numbers">8</td>
                                        <td id="homeOrder">${homeHandEight} ${homeEight} ${homeFieldEight}</td>
                                    </tr>
                                    <tr>
                                    <td id="awayOrder">${awayFieldNine} ${playerNine} ${awayHandNine}</td>
                                        <td id="numbers">9</td>
                                        <td id="homeOrder">${homeHandNine} ${homeNine} ${homeFieldNine}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;

                    // Insert HTML and call fetch/render
                    document.getElementById('feedContainer').innerHTML = preGameHTML;
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
                            ${svgFieldHTML}
                            ${finalStateHTML}
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
