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

                   // Assuming you have access to both gameData and liveData from the API
                   const awayBattingOrder = data.liveData.boxscore.teams.away.battingOrder; // Get the away team's batting order

                   // Defensive positions from linescore
                   const defense = data.liveData.linescore.defense; // catcher, first base, second base, etc.

                   // Function to link batting order with defensive positions
                   awayBattingOrder.forEach((playerId, index) => {
                       const playerKey = `ID${playerId}`; // Example: playerId = 543807, playerKey = ID543807
                       const player = data.gameData.players[playerKey]; // Get player info using player ID

                       if (player) {
                           const playerName = player.boxscoreName || player.fullName || '';
                           const playerPosition = checkPlayerPosition(playerId, defense); // Get player's position if they match

                           console.log(`Player ${index + 1}: ${playerName} (ID: ${playerId}) is playing ${playerPosition}`);
                       }
                   });

                   // Helper function to check if player's ID matches any defensive position
                   function checkPlayerPosition(playerId, defense) {
                       if (defense.catcher && defense.catcher.id === playerId) {
                           return 'Catcher';
                       }
                       if (defense.first && defense.first.id === playerId) {
                           return 'First Base';
                       }
                       if (defense.second && defense.second.id === playerId) {
                           return 'Second Base';
                       }
                       if (defense.third && defense.third.id === playerId) {
                           return 'Third Base';
                       }
                       if (defense.shortstop && defense.shortstop.id === playerId) {
                           return 'Shortstop';
                       }
                       if (defense.left && defense.left.id === playerId) {
                           return 'Left Field';
                       }
                       if (defense.center && defense.center.id === playerId) {
                           return 'Center Field';
                       }
                       if (defense.right && defense.right.id === playerId) {
                           return 'Right Field';
                       }
                       if (defense.pitcher && defense.pitcher.id === playerId) {
                           return 'Pitcher';
                       }

                       return 'Unknown position'; // If no match found
                   }


                // Example async/await fetch function and render
                async function fetchDataAndRender() {
                    const data = await fetchData(); // Assuming fetchData is defined elsewhere
                    renderBattingOrders(data);
                }

                   
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
                        <div class="positioning-misc-table">
                            <div class="away-def-bg" style="background-color: ${awayTeamColor};">
                            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            viewBox="0 0 745.89 600.276" style="enable-background:new 0 0 745.89 600.276;" xml:space="preserve">
                        <g>
                            <path d="M420.603,37.419c-8.455,0.091-21.501,0.523-26.364,0.864c-39.251,2.75-74.57,11.273-109.207,26.342
                                c-5.955,2.591-20.16,9.637-25.91,12.864c-20.023,11.182-38.774,24.387-55.797,39.274c-13.478,11.796-28.728,27.364-40.137,40.956
                                c-23.932,28.478-45.251,62.547-60.206,96.139c-2.182,4.909-6.137,14.728-7.273,18.046l-0.841,2.477l0.977,0.955
                                c0.545,0.545,11.068,9.705,23.387,20.387c70.297,60.956,126.026,109.275,187.959,162.958l69.661,60.365l1.068,3.386
                                c3.591,11.182,11.046,20.478,21.091,26.251c5.296,3.046,10.478,4.818,17.273,5.864c8.25,1.273,17.978-0.386,26.501-4.546
                                c9.159-4.5,16.841-12.296,21.091-21.432c1.114-2.341,2.5-5.977,3.068-7.909c0.364-1.25,0.477-1.386,4.568-5.023
                                c11.546-10.228,62.524-54.842,125.571-109.844c71.911-62.751,147.049-128.503,149.64-130.935c0.182-0.159,0.318-0.636,0.295-1.046
                                c-0.068-2.114-6.091-17.5-11.455-29.387c-13.978-30.819-33.433-62.342-54.66-88.479c-7.864-9.682-13.682-16.137-23.478-26.023
                                c-10.909-11.046-20.796-19.955-31.364-28.273c-45.365-35.66-98.048-56.888-155.572-62.683
                                C455.126,37.419,445.444,37.124,420.603,37.419z M458.558,39.851c21.251,1.636,36.501,3.977,54.206,8.318
                                c41.819,10.25,81.57,30.114,115.685,57.842c15.432,12.546,31.501,28.228,45.047,44.024c27.137,31.637,51.819,72.547,67.229,111.434
                                c2.205,5.591,4.136,10.932,4.25,11.75c0.068,0.5-1,1.5-7.887,7.591c-14.932,13.182-78.888,69.138-140.685,123.048
                                c-61.933,54.047-115.366,100.775-126.48,110.639c-2.318,2.045-4.273,3.955-4.364,4.227c-3.068,9.409-5.546,14.091-10.364,19.546
                                c-5.182,5.887-12.887,10.682-20.841,12.978c-2.886,0.841-7.955,1.705-10.909,1.841c-5.955,0.318-14.546-1.568-20.66-4.568
                                c-11.409-5.568-19.773-15.5-23.432-27.796c-0.568-1.955-0.932-2.796-1.409-3.25c-0.341-0.341-41.751-36.228-92.002-79.775
                                c-85.388-73.979-157.958-136.912-179.504-155.64c-8.796-7.637-9.273-8.091-9.159-8.705c0.364-1.773,5.091-13.523,8.364-20.751
                                c16.955-37.387,41.365-74.684,68.024-103.98c17.114-18.796,35.183-35.137,53.66-48.569
                                c48.206-35.001,102.639-54.819,163.731-59.592c11.455-0.909,19.841-1.091,44.547-1.023
                                C449.854,39.465,454.922,39.556,458.558,39.851z" />
                            <path d="M422.198,464.035c3.531-0.105,7.058,0.332,10.473,1.236l0,0c13.137,3.5,22.887,11.25,29.182,23.205
                                c1.364,2.568,2.068,3.318,2.841,2.977c0.227-0.114,16.569-15.091,36.274-33.274c60.365-55.66,84.797-78.161,99.957-91.934
                                c4.727-4.296,5.546-5,5.705-4.864c0.364,0.432,4.659,14.773,5.068,16.978l0.205,1.136l-26.614,23.023
                                c-14.637,12.659-47.365,40.978-72.729,62.911l-46.092,39.865l0.068,2.546c0.091,2.636,0.318,3.296,1.114,3.296
                                c0.455,0,2.455-1.727,30.569-26.001c48.024-41.501,87.548-75.843,111.912-97.184c7-6.137,7.409-6.546,7.477-7.341
                                c0.136-1.545-2.386-10.909-4.955-18.478c-0.773-2.25-1.455-4.273-1.523-4.523c-0.068-0.386,0.545-1.114,2.932-3.409
                                c5.341-5.182,26.114-24.432,87.457-80.979c6.932-6.409,12.682-11.637,12.75-11.637c0.318,0,6.091,13.341,8.955,20.637
                                c1.614,4.159,1.955,4.614,2.932,4.091c0.682-0.364,7.955-6.409,12.182-10.114l3.068-2.705l-0.023-1.136
                                c0-0.795-0.432-2.25-1.523-5.091c-7-18.546-17.364-39.933-28.455-58.751c-26.546-45.024-58.956-81.661-96.934-109.571
                                c-5.409-3.977-16.796-11.546-22.614-15.023c-37.728-22.614-78.093-35.819-123.185-40.274c-7.659-0.75-10-0.932-16.137-1.159
                                c-6.773-0.25-34.024-0.25-43.978,0.023c-14.228,0.364-25.773,1.341-40.001,3.386c-77.797,11.159-145.163,49.092-199.505,112.389
                                c-23.319,27.182-44.342,59.956-59.479,92.843c-6.318,13.728-9.25,21.114-8.75,22.046c0.114,0.205,3.114,2.886,6.637,5.955
                                c9.068,7.818,8.682,7.5,9.409,7.409c0.591-0.068,0.727-0.318,2.136-3.818c3.205-7.887,7.568-17.364,7.932-17.228
                                c0.114,0.045,12.955,11.682,28.569,25.864c32.273,29.364,79.002,71.888,81.275,73.979l1.523,1.409l-0.568,1.796
                                c-1.5,4.886-4.182,16.909-4.182,18.841v1l3.591,3.136c9.296,8.205,58.229,50.365,112.662,97.116
                                c11.137,9.546,21.91,18.841,23.978,20.614c2.068,1.796,3.796,3.25,3.864,3.25c0.25,0-0.045-6.932-0.295-7.318
                                c-0.159-0.205-14.228-12.364-31.296-27.023c-60.297-51.797-105.798-90.957-106.298-91.434c-0.5-0.477-0.5-0.5-0.136-2.5
                                c0.386-2.296,2.886-12.568,3.091-12.796c0.341-0.318,6.091,4.864,86.002,77.593c27.796,25.296,50.592,45.978,50.683,45.978
                                c0.114,0,0.386-0.477,0.614-1.091c1.182-2.909,2.727-6.159,3.796-7.955c5.368-8.96,13.235-15.523,22.88-19.155
                                c2.861-1.077,5.842-1.8,8.872-2.205C417.402,464.347,419.73,464.108,422.198,464.035z M411.194,463.407
                                c-8.773,2.273-15.569,6.091-21.728,12.273c-4.159,4.136-7.705,9.25-9.773,14.091c-0.409,0.932-0.818,1.796-0.909,1.886
                                c-0.091,0.114-18.41-16.409-40.706-36.705c-80.206-73.002-89.934-81.797-93.82-84.911c-1.409-1.114-2.091-1.386-2.659-1
                                c-0.341,0.205-0.977,2.364-2.341,8c-1.295,5.387-1.841,8.091-1.841,9.341v0.864l38.024,32.705
                                c20.887,17.978,51.956,44.683,69.024,59.365l31.023,26.66l0.068,1.136l0.068,1.114l-0.545-0.409
                                c-0.318-0.25-7.409-6.318-15.75-13.5c-8.364-7.182-22.16-19.046-30.66-26.364c-41.683-35.819-77.956-67.092-88.138-75.979
                                l-5.182-4.523l0.159-0.818c0.795-4.727,2.523-12.159,4-17.296l0.932-3.296l-0.682-0.568c-0.364-0.318-10.864-9.887-23.319-21.228
                                c-63.411-57.774-89.388-81.297-89.843-81.297c-0.25,0-0.636,0.182-0.841,0.409c-0.727,0.795-5.977,12.273-8.387,18.319
                                c-0.5,1.273-0.955,2.341-1,2.386c-0.114,0.114-1.091-0.705-8.114-6.773c-4.796-4.136-5.614-4.932-5.477-5.341
                                c0.364-1.182,2.818-7.227,4.636-11.387c22.978-52.592,56.797-99.866,97.025-135.753c37.546-33.455,79.547-56.479,126.276-69.206
                                c21.319-5.818,46.16-9.728,68.979-10.864c11.205-0.545,33.387-0.75,47.615-0.432c37.024,0.841,73.911,8.659,107.184,22.728
                                c40.796,17.25,77.479,43.887,109.457,79.434c29.682,33.024,56.138,75.797,72.524,117.276c2.114,5.387,3.227,8.568,3.091,8.796
                                c-0.364,0.568-13.137,11.318-13.455,11.318c-0.114,0-0.705-1.25-1.295-2.796c-2.705-6.932-9.568-22.66-9.887-22.66
                                c-0.205,0-78.82,72.502-94.889,87.502c-8.455,7.909-11.023,10.478-11.023,11c0,0.273,0.568,2.091,1.25,4.091
                                c2.091,6,4.818,15.387,5.409,18.705c0.136,0.727,0.023,0.841-14.114,13.205c-33.705,29.455-94.684,82.32-128.98,111.844
                                l-4.046,3.477l0.068-1.159l0.068-1.159l31.705-27.41c17.432-15.091,50.138-43.365,72.638-62.842l40.956-35.433l-0.318-1.614
                                c-0.841-4.386-5.341-19.023-6.046-19.637c-0.045-0.023-0.295-0.136-0.568-0.205c-0.432-0.136-1.25,0.5-5.114,4
                                c-5.659,5.114-36.91,33.774-50.638,46.433c-25.16,23.205-75.229,69.365-80.638,74.365c-3.296,3.046-6.046,5.523-6.137,5.523
                                s-0.727-1.045-1.409-2.318c-5.841-10.818-15.023-18.523-26.614-22.319C425.739,460.279,411.194,463.407,411.194,463.407z"/>
                            <path d="M412.648,70.829c-5.432,0.136-14.728,0.545-19.091,0.864c-42.206,3.068-82.593,14.364-118.662,33.205
                                c-56.229,29.342-104.457,78.115-139.162,140.731c-3.546,6.432-6.068,11.432-6,11.909c0.091,0.545,111.298,101.775,111.798,101.775
                                c0.091,0,0.25-0.227,0.341-0.523c0.409-1.386,4.205-10.932,5.591-14.137c11.523-26.364,28.387-49.274,48.933-66.365
                                c14.319-11.932,31.342-21.682,49.319-28.273c16.591-6.068,34.728-9.864,55.115-11.5c12.591-1.023,40.637-1.023,51.024-0.023
                                c36.478,3.568,64.592,13.114,90.57,30.773c8.705,5.909,16.069,12.023,24.001,19.932c16.205,16.159,29.001,34.864,38.751,56.66
                                c0.955,2.182,1.796,4,1.864,4.046c0.068,0.091,101.071-92.866,104.025-95.73l0.568-0.568l-2.568-5.046
                                c-12.432-24.591-30.251-51.41-48.001-72.206c-6.091-7.159-10.728-12.137-18.841-20.25c-10.25-10.25-16.387-15.796-25.614-23.182
                                c-28.819-23.023-59.956-39.524-94.116-49.865c-22.796-6.909-46.319-10.887-71.865-12.159
                                C446.649,70.693,419.762,70.647,412.648,70.829z M444.126,72.716c11.546,0.318,20.273,0.955,30.796,2.296
                                c52.024,6.568,98.911,26.41,140.253,59.32c17.569,13.978,35.728,32.273,50.91,51.228c14.932,18.66,30.251,42.296,40.433,62.433
                                c1.386,2.705,2.5,5.023,2.5,5.136c0,0.273-100.866,93.343-101.161,93.343c-0.114,0-1.023-1.773-2-3.909
                                c-7.682-16.728-17.728-32.183-30.273-46.547c-3.318-3.796-11.978-12.455-15.773-15.773
                                c-27.478-24.001-59.911-37.887-100.002-42.842c-8.341-1.045-11.614-1.295-20.114-1.523c-8.887-0.227-25.637-0.091-33.069,0.273
                                c-49.319,2.477-90.502,19.296-121.344,49.524c-18.66,18.296-32.978,40.433-43.069,66.592c-0.75,1.932-1.455,3.523-1.591,3.523
                                c-0.273,0-2.318-1.841-37.524-33.842c-63.774-58.001-71.138-64.706-71.138-64.82c0-0.386,5.046-9.796,8.455-15.773
                                c29.069-50.819,68.297-93.116,112.707-121.548c30.546-19.546,64.024-33.114,99.821-40.478c18.523-3.818,35.955-5.773,56.751-6.387
                                C424.33,72.511,434.103,72.443,444.126,72.716z"/>
                            <path d="M409.466,240.583c-0.682,0.045-3.091,0.182-5.341,0.318c-19.137,1.136-38.455,4.909-55.115,10.75
                                c-30.933,10.841-56.479,29.273-76.206,55.001c-10.159,13.228-18.637,28.228-25.296,44.728c-2.25,5.614-3.727,9.887-3.727,10.796
                                c0,0.727-2.773-1.841,46.069,42.66c13.409,12.205,24.501,22.205,24.614,22.205c0.523,0,5.068-2.296,6.637-3.341
                                c2.091-1.386,5.727-4.864,7.364-7.046c2.523-3.341,4.318-7.568,4.886-11.409c0.386-2.773,0.159-8.727-0.455-10.955
                                c-1.705-6.341-6.25-12.432-12-16.159c-0.795-0.523-1.432-1-1.432-1.091s18.728-16.637,41.615-36.774l41.637-36.637l1.341,1.205
                                c3.296,2.886,5.614,4.364,8.932,5.682c3.205,1.273,5.5,1.75,9.091,1.909c6.932,0.273,12.932-1.727,18.5-6.114l2.296-1.796l3,2.455
                                c7.909,6.5,80.479,68.547,80.57,68.888c0.023,0.091-0.682,0.614-1.568,1.182c-2.136,1.364-5.568,4.727-6.841,6.705
                                c-1.523,2.409-3.046,5.568-3.955,8.273c-0.705,2.068-0.841,2.886-1.045,5.773c-0.341,5.046,0.023,9.137,1.045,12.25
                                c1.568,4.636,4.068,8.887,6.955,11.773c1.818,1.796,4.341,3.636,5,3.636c0.295,0,1.455-0.886,3.046-2.318
                                c13.5-12.341,43.456-39.91,60.592-55.751c7.296-6.75,13.819-12.796,14.5-13.409l1.25-1.136l-1.727-3.909
                                c-15.909-36.274-40.933-65.252-72.07-83.457c-3.75-2.205-13.296-7.046-18.341-9.296c-14.909-6.705-34.114-11.818-53.024-14.114
                                c-11.273-1.386-12.114-1.432-31.478-1.5C418.853,240.538,410.148,240.538,409.466,240.583z M514.471,400.73
                                c-0.048-2.701,0.406-5.387,1.293-7.938l0,0c0.795-2.227,2.614-6.046,3.818-7.909c1.727-2.705,5.068-5.682,8.432-7.523
                                c1.886-1.023,1.932-1.068,1.523-1.455c-0.727-0.705-65.342-56.001-72.911-62.411c-10.978-9.273-13.114-11-13.728-11
                                c-0.318,0-1.318,0.614-2.5,1.545c-2.818,2.227-3.864,2.909-6.455,4.136c-7.523,3.568-16.455,3.159-23.751-1.114
                                c-1.909-1.114-3.432-2.296-5.637-4.386c-1.182-1.114-1.75-1.523-1.977-1.386c-0.182,0.091-19.705,17.25-43.433,38.115
                                l-43.092,37.955l0.727,0.455c4.818,2.932,7.568,5.227,9.818,8.159c3.068,4.023,4.546,7.682,4.909,12.25
                                c0.295,3.705-0.023,7.773-0.795,10.091c-2.205,6.568-7.296,12.341-13.728,15.546c-1,0.5-1.955,0.909-2.114,0.909
                                c-0.273,0-16.614-14.796-52.774-47.819c-8.364-7.637-15.5-14.137-15.841-14.455l-0.636-0.568l0.864-2.523
                                c0.477-1.364,1.546-4.227,2.409-6.364c11.546-28.864,28.478-52.933,49.888-70.865c29.455-24.682,66.865-37.955,111.821-39.683
                                c6.091-0.227,32.023-0.068,36.66,0.227c24.001,1.568,48.047,7.273,66.638,15.819c16.728,7.682,29.16,15.637,42.046,26.932
                                c3.75,3.273,10.841,10.341,14.25,14.182c12.864,14.523,23.501,31.251,31.66,49.774l1.295,2.955l-1,0.909
                                c-0.568,0.5-8.273,7.614-17.137,15.796c-17.705,16.364-44.297,40.819-52.479,48.274c-2.886,2.614-5.546,5.068-5.932,5.409
                                l-0.705,0.659l-1.727-1.364c-3.636-2.886-6.455-7.182-8.409-12.818l0,0c-0.558-1.604-0.922-3.267-1.084-4.958
                                C514.581,403.25,514.494,402.015,514.471,400.73z"/>
                            <g>
                                <path d="M417.489,279.925c-2.796,2.864-5.046,5.318-5,5.5c0.023,0.182,2.5,2.682,5.5,5.546l5.432,5.227l3.341-3.432
                                    c2.789-2.859,7.223-7.827,7.223-7.827l-3.004-3.009c-2.355-2.383-8.06-7.279-8.06-7.279S419.751,277.609,417.489,279.925z
                                    M426.808,289.994l-3.409,3.523l-3.386-3.227c-1.864-1.773-3.773-3.614-4.227-4.091l-0.841-0.864l3.977-4.159l4-4.136l1.046,0.886
                                    c0.591,0.5,2.5,2.273,4.25,3.955l3.182,3.046l-0.591,0.773C430.467,286.13,428.671,288.062,426.808,289.994z"/>
                            </g>
                            <g>
                                <path d="M294.556,393.991c-2.697,2.957-4.863,5.486-4.811,5.666c0.029,0.181,2.589,2.596,5.685,5.356l5.606,5.04l3.223-3.543
                                    c2.691-2.952,6.954-8.067,6.954-8.067l-3.104-2.906c-2.435-2.301-8.302-7.002-8.302-7.002S296.738,391.6,294.556,393.991z
                                    M304.21,403.738l-3.288,3.636l-3.494-3.111c-1.923-1.709-3.893-3.484-4.363-3.946l-0.87-0.835l3.834-4.291l3.858-4.269
                                    l1.075,0.85c0.608,0.48,2.576,2.187,4.382,3.809l3.283,2.936l-0.564,0.792C307.736,399.753,306.007,401.744,304.21,403.738z"/>
                            </g>
                            <g>
                                <path d="M531.677,394.301c-2.943,2.712-5.32,5.043-5.285,5.227c0.013,0.183,2.354,2.811,5.199,5.829l5.147,5.508l3.518-3.25
                                    c2.937-2.708,7.627-7.434,7.627-7.434l-2.84-3.164c-2.226-2.504-7.663-7.696-7.663-7.696S534.059,392.108,531.677,394.301z
                                    M540.449,404.849l-3.591,3.337l-3.211-3.402c-1.767-1.869-3.576-3.809-4.005-4.309l-0.794-0.907l4.192-3.943l4.214-3.919
                                    l0.997,0.941c0.564,0.531,2.376,2.402,4.035,4.174l3.016,3.21l-0.631,0.74C544.308,401.184,542.412,403.018,540.449,404.849z"/>
                            </g>
                            <path d="M400.197,402.614c0.433,5.251,2.531,10.245,6.126,14.098c0.025,0.027,0.05,0.054,0.075,0.081
                                c3.886,4.114,8.364,6.387,13.841,7.068c7.364,0.932,14.523-1.546,19.478-6.75c1.886-1.977,2.932-3.477,4.182-5.977
                                c1.909-3.796,2.523-6.796,2.318-11.341c-0.159-3.659-0.705-5.818-2.318-9c-3.136-6.273-8.182-10.409-14.864-12.205
                                c-2.25-0.591-8.273-0.773-10.478-0.295c-2.727,0.568-6.818,2.364-8.864,3.864c-1.5,1.091-4.75,4.523-5.887,6.227
                                c-1.25,1.841-2.364,4.227-3.023,6.523C400.008,397.233,399.994,400.165,400.197,402.614z M402.784,394.951
                                c1.227-3.864,2.773-6.273,6.159-9.523c1.909-1.818,2.636-2.341,4.409-3.205c2.568-1.25,4.659-1.955,6.614-2.227
                                c1.841-0.25,6.227-0.091,8.182,0.341c3.136,0.659,6.977,2.727,9.637,5.182c2.636,2.432,5.432,7.273,6.137,10.614
                                c0.545,2.546,0.5,7.773-0.091,10.023c-1.614,6.091-6.046,11.432-11.682,14.046c-2.864,1.364-4.182,1.636-8.046,1.773
                                c-3.932,0.136-6.091-0.182-8.955-1.318c-1.193-0.483-2.384-1.138-3.531-1.925c-6.28-4.313-9.737-11.635-9.489-19.25
                                C402.176,398,402.369,396.462,402.784,394.951z"/>
                            <path d="M414.012,399.655v4.886h9.091h9.091v-4.886v-4.887h-9.091h-9.091V399.655z M430.376,399.655v3.068h-7.159h-7.159v-3.068
                                v-3.068h7.159h7.159V399.655z"/>
                            <path d="M391.966,501.021v20.114h9.773h9.773v-15.637c0-8.614-0.068-17.66-0.159-20.114l-0.136-4.477h-9.637h-9.614V501.021z
                                M404.534,482.885l4.932,0.136v18.16v18.137h-7.841h-7.841v-18.296v-18.296h2.909C398.284,482.725,401.807,482.794,404.534,482.885
                                z"/>
                            <path d="M434.921,501.021v20.114h9.887h9.887v-20.114v-20.114h-9.887h-9.887V501.021z M452.649,501.021v18.296h-7.841h-7.841
                                v-18.296v-18.296h7.841h7.841V501.021z"/>
                            <path d="M414.012,494.317v4.477v4.182l4.705,5l4.705,5l4.386-4.387l4.386-4.386v-4.932v-4.955h-8.932H414.012z M430.376,499.84
                                v3.455l-3.477,3.477l-3.477,3.477l-3.682-3.932l-3.659-3.932l-0.023-3.023v-3h7.159h7.159V499.84z"/>
                            <path d="M414.012,531.477v13.978h9.182c6.273,0,9.25-0.068,9.341-0.25c0.091-0.136,0.091-6.409,0-13.978l-0.182-13.728h-9.159
                                h-9.182V531.477z M428.739,519.476l1.864,0.136v11.887v11.909h-7.387h-7.387v-12.046v-12.046h5.523
                                C424.376,519.317,427.694,519.385,428.739,519.476z"/>
                        </g>
                        </svg>
                        <div class="pos-field">
                            <!-- Catcher -->
                            <div id="catcher" class="def-position catcher">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.catcher.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- First Base -->
                            <div id="first" class="def-position first">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.first.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Second Base -->
                            <div id="second" class="def-position second">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.second.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Third Base -->
                            <div id="third" class="def-position third">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.third.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Short Stop -->
                            <div id="short" class="def-position short">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.shortstop.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Left Field -->
                            <div id="left" class="def-position left">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.left.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Center Field -->
                            <div id="center" class="def-position center">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.center.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Right Field -->
                            <div id="right" class="def-position right">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.right.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                        </div>
                        <div class="stadium-location">${data.gameData.venue.name}
                        <span class="city-state">${data.gameData.venue.location.city}, ${data.gameData.venue.location.stateAbbrev}</span>
                        </div>                        </div>
                    `;

                    // Insert HTML and call fetch/render
                    document.getElementById('feedContainer').innerHTML = preGameHTML;
                    fetchDataAndRender();

                }  else if (detailedState === 'Suspended: Rain') {
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

                      // Assuming you have access to both gameData and liveData from the API
                        const awayBattingOrder = data.liveData.boxscore.teams.away.battingOrder; // Get the away team's batting order

                        // Defensive positions from linescore
                        const defense = data.liveData.linescore.defense; // catcher, first base, second base, etc.

                        // Function to link batting order with defensive positions
                        awayBattingOrder.forEach((playerId, index) => {
                            const playerKey = `ID${playerId}`; // Example: playerId = 543807, playerKey = ID543807
                            const player = data.gameData.players[playerKey]; // Get player info using player ID

                            if (player) {
                                const playerName = player.boxscoreName || player.fullName || '';
                                const playerPosition = checkPlayerPosition(playerId, defense); // Get player's position if they match

                                console.log(`Player ${index + 1}: ${playerName} (ID: ${playerId}) is playing ${playerPosition}`);
                            }
                        });

                        // Helper function to check if player's ID matches any defensive position
                        function checkPlayerPosition(playerId, defense) {
                            if (defense.catcher && defense.catcher.id === playerId) {
                                return 'Catcher';
                            }
                            if (defense.first && defense.first.id === playerId) {
                                return 'First Base';
                            }
                            if (defense.second && defense.second.id === playerId) {
                                return 'Second Base';
                            }
                            if (defense.third && defense.third.id === playerId) {
                                return 'Third Base';
                            }
                            if (defense.shortstop && defense.shortstop.id === playerId) {
                                return 'Shortstop';
                            }
                            if (defense.left && defense.left.id === playerId) {
                                return 'Left Field';
                            }
                            if (defense.center && defense.center.id === playerId) {
                                return 'Center Field';
                            }
                            if (defense.right && defense.right.id === playerId) {
                                return 'Right Field';
                            }
                            if (defense.pitcher && defense.pitcher.id === playerId) {
                                return 'Pitcher';
                            }

                            return 'Unknown position'; // If no match found
                        }

 
                     // Example async/await fetch function and render
                     async function fetchDataAndRender() {
                         const data = await fetchData(); // Assuming fetchData is defined elsewhere
                         renderBattingOrders(data);
                     }

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
                   <div class="positioning-misc-table">
                            <div class="away-def-bg" style="background-color: ${awayTeamColor};">
                              <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                            viewBox="0 0 745.89 600.276" style="enable-background:new 0 0 745.89 600.276;" xml:space="preserve">
                        <g>
                            <path d="M420.603,37.419c-8.455,0.091-21.501,0.523-26.364,0.864c-39.251,2.75-74.57,11.273-109.207,26.342
                                c-5.955,2.591-20.16,9.637-25.91,12.864c-20.023,11.182-38.774,24.387-55.797,39.274c-13.478,11.796-28.728,27.364-40.137,40.956
                                c-23.932,28.478-45.251,62.547-60.206,96.139c-2.182,4.909-6.137,14.728-7.273,18.046l-0.841,2.477l0.977,0.955
                                c0.545,0.545,11.068,9.705,23.387,20.387c70.297,60.956,126.026,109.275,187.959,162.958l69.661,60.365l1.068,3.386
                                c3.591,11.182,11.046,20.478,21.091,26.251c5.296,3.046,10.478,4.818,17.273,5.864c8.25,1.273,17.978-0.386,26.501-4.546
                                c9.159-4.5,16.841-12.296,21.091-21.432c1.114-2.341,2.5-5.977,3.068-7.909c0.364-1.25,0.477-1.386,4.568-5.023
                                c11.546-10.228,62.524-54.842,125.571-109.844c71.911-62.751,147.049-128.503,149.64-130.935c0.182-0.159,0.318-0.636,0.295-1.046
                                c-0.068-2.114-6.091-17.5-11.455-29.387c-13.978-30.819-33.433-62.342-54.66-88.479c-7.864-9.682-13.682-16.137-23.478-26.023
                                c-10.909-11.046-20.796-19.955-31.364-28.273c-45.365-35.66-98.048-56.888-155.572-62.683
                                C455.126,37.419,445.444,37.124,420.603,37.419z M458.558,39.851c21.251,1.636,36.501,3.977,54.206,8.318
                                c41.819,10.25,81.57,30.114,115.685,57.842c15.432,12.546,31.501,28.228,45.047,44.024c27.137,31.637,51.819,72.547,67.229,111.434
                                c2.205,5.591,4.136,10.932,4.25,11.75c0.068,0.5-1,1.5-7.887,7.591c-14.932,13.182-78.888,69.138-140.685,123.048
                                c-61.933,54.047-115.366,100.775-126.48,110.639c-2.318,2.045-4.273,3.955-4.364,4.227c-3.068,9.409-5.546,14.091-10.364,19.546
                                c-5.182,5.887-12.887,10.682-20.841,12.978c-2.886,0.841-7.955,1.705-10.909,1.841c-5.955,0.318-14.546-1.568-20.66-4.568
                                c-11.409-5.568-19.773-15.5-23.432-27.796c-0.568-1.955-0.932-2.796-1.409-3.25c-0.341-0.341-41.751-36.228-92.002-79.775
                                c-85.388-73.979-157.958-136.912-179.504-155.64c-8.796-7.637-9.273-8.091-9.159-8.705c0.364-1.773,5.091-13.523,8.364-20.751
                                c16.955-37.387,41.365-74.684,68.024-103.98c17.114-18.796,35.183-35.137,53.66-48.569
                                c48.206-35.001,102.639-54.819,163.731-59.592c11.455-0.909,19.841-1.091,44.547-1.023
                                C449.854,39.465,454.922,39.556,458.558,39.851z" />
                            <path d="M422.198,464.035c3.531-0.105,7.058,0.332,10.473,1.236l0,0c13.137,3.5,22.887,11.25,29.182,23.205
                                c1.364,2.568,2.068,3.318,2.841,2.977c0.227-0.114,16.569-15.091,36.274-33.274c60.365-55.66,84.797-78.161,99.957-91.934
                                c4.727-4.296,5.546-5,5.705-4.864c0.364,0.432,4.659,14.773,5.068,16.978l0.205,1.136l-26.614,23.023
                                c-14.637,12.659-47.365,40.978-72.729,62.911l-46.092,39.865l0.068,2.546c0.091,2.636,0.318,3.296,1.114,3.296
                                c0.455,0,2.455-1.727,30.569-26.001c48.024-41.501,87.548-75.843,111.912-97.184c7-6.137,7.409-6.546,7.477-7.341
                                c0.136-1.545-2.386-10.909-4.955-18.478c-0.773-2.25-1.455-4.273-1.523-4.523c-0.068-0.386,0.545-1.114,2.932-3.409
                                c5.341-5.182,26.114-24.432,87.457-80.979c6.932-6.409,12.682-11.637,12.75-11.637c0.318,0,6.091,13.341,8.955,20.637
                                c1.614,4.159,1.955,4.614,2.932,4.091c0.682-0.364,7.955-6.409,12.182-10.114l3.068-2.705l-0.023-1.136
                                c0-0.795-0.432-2.25-1.523-5.091c-7-18.546-17.364-39.933-28.455-58.751c-26.546-45.024-58.956-81.661-96.934-109.571
                                c-5.409-3.977-16.796-11.546-22.614-15.023c-37.728-22.614-78.093-35.819-123.185-40.274c-7.659-0.75-10-0.932-16.137-1.159
                                c-6.773-0.25-34.024-0.25-43.978,0.023c-14.228,0.364-25.773,1.341-40.001,3.386c-77.797,11.159-145.163,49.092-199.505,112.389
                                c-23.319,27.182-44.342,59.956-59.479,92.843c-6.318,13.728-9.25,21.114-8.75,22.046c0.114,0.205,3.114,2.886,6.637,5.955
                                c9.068,7.818,8.682,7.5,9.409,7.409c0.591-0.068,0.727-0.318,2.136-3.818c3.205-7.887,7.568-17.364,7.932-17.228
                                c0.114,0.045,12.955,11.682,28.569,25.864c32.273,29.364,79.002,71.888,81.275,73.979l1.523,1.409l-0.568,1.796
                                c-1.5,4.886-4.182,16.909-4.182,18.841v1l3.591,3.136c9.296,8.205,58.229,50.365,112.662,97.116
                                c11.137,9.546,21.91,18.841,23.978,20.614c2.068,1.796,3.796,3.25,3.864,3.25c0.25,0-0.045-6.932-0.295-7.318
                                c-0.159-0.205-14.228-12.364-31.296-27.023c-60.297-51.797-105.798-90.957-106.298-91.434c-0.5-0.477-0.5-0.5-0.136-2.5
                                c0.386-2.296,2.886-12.568,3.091-12.796c0.341-0.318,6.091,4.864,86.002,77.593c27.796,25.296,50.592,45.978,50.683,45.978
                                c0.114,0,0.386-0.477,0.614-1.091c1.182-2.909,2.727-6.159,3.796-7.955c5.368-8.96,13.235-15.523,22.88-19.155
                                c2.861-1.077,5.842-1.8,8.872-2.205C417.402,464.347,419.73,464.108,422.198,464.035z M411.194,463.407
                                c-8.773,2.273-15.569,6.091-21.728,12.273c-4.159,4.136-7.705,9.25-9.773,14.091c-0.409,0.932-0.818,1.796-0.909,1.886
                                c-0.091,0.114-18.41-16.409-40.706-36.705c-80.206-73.002-89.934-81.797-93.82-84.911c-1.409-1.114-2.091-1.386-2.659-1
                                c-0.341,0.205-0.977,2.364-2.341,8c-1.295,5.387-1.841,8.091-1.841,9.341v0.864l38.024,32.705
                                c20.887,17.978,51.956,44.683,69.024,59.365l31.023,26.66l0.068,1.136l0.068,1.114l-0.545-0.409
                                c-0.318-0.25-7.409-6.318-15.75-13.5c-8.364-7.182-22.16-19.046-30.66-26.364c-41.683-35.819-77.956-67.092-88.138-75.979
                                l-5.182-4.523l0.159-0.818c0.795-4.727,2.523-12.159,4-17.296l0.932-3.296l-0.682-0.568c-0.364-0.318-10.864-9.887-23.319-21.228
                                c-63.411-57.774-89.388-81.297-89.843-81.297c-0.25,0-0.636,0.182-0.841,0.409c-0.727,0.795-5.977,12.273-8.387,18.319
                                c-0.5,1.273-0.955,2.341-1,2.386c-0.114,0.114-1.091-0.705-8.114-6.773c-4.796-4.136-5.614-4.932-5.477-5.341
                                c0.364-1.182,2.818-7.227,4.636-11.387c22.978-52.592,56.797-99.866,97.025-135.753c37.546-33.455,79.547-56.479,126.276-69.206
                                c21.319-5.818,46.16-9.728,68.979-10.864c11.205-0.545,33.387-0.75,47.615-0.432c37.024,0.841,73.911,8.659,107.184,22.728
                                c40.796,17.25,77.479,43.887,109.457,79.434c29.682,33.024,56.138,75.797,72.524,117.276c2.114,5.387,3.227,8.568,3.091,8.796
                                c-0.364,0.568-13.137,11.318-13.455,11.318c-0.114,0-0.705-1.25-1.295-2.796c-2.705-6.932-9.568-22.66-9.887-22.66
                                c-0.205,0-78.82,72.502-94.889,87.502c-8.455,7.909-11.023,10.478-11.023,11c0,0.273,0.568,2.091,1.25,4.091
                                c2.091,6,4.818,15.387,5.409,18.705c0.136,0.727,0.023,0.841-14.114,13.205c-33.705,29.455-94.684,82.32-128.98,111.844
                                l-4.046,3.477l0.068-1.159l0.068-1.159l31.705-27.41c17.432-15.091,50.138-43.365,72.638-62.842l40.956-35.433l-0.318-1.614
                                c-0.841-4.386-5.341-19.023-6.046-19.637c-0.045-0.023-0.295-0.136-0.568-0.205c-0.432-0.136-1.25,0.5-5.114,4
                                c-5.659,5.114-36.91,33.774-50.638,46.433c-25.16,23.205-75.229,69.365-80.638,74.365c-3.296,3.046-6.046,5.523-6.137,5.523
                                s-0.727-1.045-1.409-2.318c-5.841-10.818-15.023-18.523-26.614-22.319C425.739,460.279,411.194,463.407,411.194,463.407z"/>
                            <path d="M412.648,70.829c-5.432,0.136-14.728,0.545-19.091,0.864c-42.206,3.068-82.593,14.364-118.662,33.205
                                c-56.229,29.342-104.457,78.115-139.162,140.731c-3.546,6.432-6.068,11.432-6,11.909c0.091,0.545,111.298,101.775,111.798,101.775
                                c0.091,0,0.25-0.227,0.341-0.523c0.409-1.386,4.205-10.932,5.591-14.137c11.523-26.364,28.387-49.274,48.933-66.365
                                c14.319-11.932,31.342-21.682,49.319-28.273c16.591-6.068,34.728-9.864,55.115-11.5c12.591-1.023,40.637-1.023,51.024-0.023
                                c36.478,3.568,64.592,13.114,90.57,30.773c8.705,5.909,16.069,12.023,24.001,19.932c16.205,16.159,29.001,34.864,38.751,56.66
                                c0.955,2.182,1.796,4,1.864,4.046c0.068,0.091,101.071-92.866,104.025-95.73l0.568-0.568l-2.568-5.046
                                c-12.432-24.591-30.251-51.41-48.001-72.206c-6.091-7.159-10.728-12.137-18.841-20.25c-10.25-10.25-16.387-15.796-25.614-23.182
                                c-28.819-23.023-59.956-39.524-94.116-49.865c-22.796-6.909-46.319-10.887-71.865-12.159
                                C446.649,70.693,419.762,70.647,412.648,70.829z M444.126,72.716c11.546,0.318,20.273,0.955,30.796,2.296
                                c52.024,6.568,98.911,26.41,140.253,59.32c17.569,13.978,35.728,32.273,50.91,51.228c14.932,18.66,30.251,42.296,40.433,62.433
                                c1.386,2.705,2.5,5.023,2.5,5.136c0,0.273-100.866,93.343-101.161,93.343c-0.114,0-1.023-1.773-2-3.909
                                c-7.682-16.728-17.728-32.183-30.273-46.547c-3.318-3.796-11.978-12.455-15.773-15.773
                                c-27.478-24.001-59.911-37.887-100.002-42.842c-8.341-1.045-11.614-1.295-20.114-1.523c-8.887-0.227-25.637-0.091-33.069,0.273
                                c-49.319,2.477-90.502,19.296-121.344,49.524c-18.66,18.296-32.978,40.433-43.069,66.592c-0.75,1.932-1.455,3.523-1.591,3.523
                                c-0.273,0-2.318-1.841-37.524-33.842c-63.774-58.001-71.138-64.706-71.138-64.82c0-0.386,5.046-9.796,8.455-15.773
                                c29.069-50.819,68.297-93.116,112.707-121.548c30.546-19.546,64.024-33.114,99.821-40.478c18.523-3.818,35.955-5.773,56.751-6.387
                                C424.33,72.511,434.103,72.443,444.126,72.716z"/>
                            <path d="M409.466,240.583c-0.682,0.045-3.091,0.182-5.341,0.318c-19.137,1.136-38.455,4.909-55.115,10.75
                                c-30.933,10.841-56.479,29.273-76.206,55.001c-10.159,13.228-18.637,28.228-25.296,44.728c-2.25,5.614-3.727,9.887-3.727,10.796
                                c0,0.727-2.773-1.841,46.069,42.66c13.409,12.205,24.501,22.205,24.614,22.205c0.523,0,5.068-2.296,6.637-3.341
                                c2.091-1.386,5.727-4.864,7.364-7.046c2.523-3.341,4.318-7.568,4.886-11.409c0.386-2.773,0.159-8.727-0.455-10.955
                                c-1.705-6.341-6.25-12.432-12-16.159c-0.795-0.523-1.432-1-1.432-1.091s18.728-16.637,41.615-36.774l41.637-36.637l1.341,1.205
                                c3.296,2.886,5.614,4.364,8.932,5.682c3.205,1.273,5.5,1.75,9.091,1.909c6.932,0.273,12.932-1.727,18.5-6.114l2.296-1.796l3,2.455
                                c7.909,6.5,80.479,68.547,80.57,68.888c0.023,0.091-0.682,0.614-1.568,1.182c-2.136,1.364-5.568,4.727-6.841,6.705
                                c-1.523,2.409-3.046,5.568-3.955,8.273c-0.705,2.068-0.841,2.886-1.045,5.773c-0.341,5.046,0.023,9.137,1.045,12.25
                                c1.568,4.636,4.068,8.887,6.955,11.773c1.818,1.796,4.341,3.636,5,3.636c0.295,0,1.455-0.886,3.046-2.318
                                c13.5-12.341,43.456-39.91,60.592-55.751c7.296-6.75,13.819-12.796,14.5-13.409l1.25-1.136l-1.727-3.909
                                c-15.909-36.274-40.933-65.252-72.07-83.457c-3.75-2.205-13.296-7.046-18.341-9.296c-14.909-6.705-34.114-11.818-53.024-14.114
                                c-11.273-1.386-12.114-1.432-31.478-1.5C418.853,240.538,410.148,240.538,409.466,240.583z M514.471,400.73
                                c-0.048-2.701,0.406-5.387,1.293-7.938l0,0c0.795-2.227,2.614-6.046,3.818-7.909c1.727-2.705,5.068-5.682,8.432-7.523
                                c1.886-1.023,1.932-1.068,1.523-1.455c-0.727-0.705-65.342-56.001-72.911-62.411c-10.978-9.273-13.114-11-13.728-11
                                c-0.318,0-1.318,0.614-2.5,1.545c-2.818,2.227-3.864,2.909-6.455,4.136c-7.523,3.568-16.455,3.159-23.751-1.114
                                c-1.909-1.114-3.432-2.296-5.637-4.386c-1.182-1.114-1.75-1.523-1.977-1.386c-0.182,0.091-19.705,17.25-43.433,38.115
                                l-43.092,37.955l0.727,0.455c4.818,2.932,7.568,5.227,9.818,8.159c3.068,4.023,4.546,7.682,4.909,12.25
                                c0.295,3.705-0.023,7.773-0.795,10.091c-2.205,6.568-7.296,12.341-13.728,15.546c-1,0.5-1.955,0.909-2.114,0.909
                                c-0.273,0-16.614-14.796-52.774-47.819c-8.364-7.637-15.5-14.137-15.841-14.455l-0.636-0.568l0.864-2.523
                                c0.477-1.364,1.546-4.227,2.409-6.364c11.546-28.864,28.478-52.933,49.888-70.865c29.455-24.682,66.865-37.955,111.821-39.683
                                c6.091-0.227,32.023-0.068,36.66,0.227c24.001,1.568,48.047,7.273,66.638,15.819c16.728,7.682,29.16,15.637,42.046,26.932
                                c3.75,3.273,10.841,10.341,14.25,14.182c12.864,14.523,23.501,31.251,31.66,49.774l1.295,2.955l-1,0.909
                                c-0.568,0.5-8.273,7.614-17.137,15.796c-17.705,16.364-44.297,40.819-52.479,48.274c-2.886,2.614-5.546,5.068-5.932,5.409
                                l-0.705,0.659l-1.727-1.364c-3.636-2.886-6.455-7.182-8.409-12.818l0,0c-0.558-1.604-0.922-3.267-1.084-4.958
                                C514.581,403.25,514.494,402.015,514.471,400.73z"/>
                            <g>
                                <path d="M417.489,279.925c-2.796,2.864-5.046,5.318-5,5.5c0.023,0.182,2.5,2.682,5.5,5.546l5.432,5.227l3.341-3.432
                                    c2.789-2.859,7.223-7.827,7.223-7.827l-3.004-3.009c-2.355-2.383-8.06-7.279-8.06-7.279S419.751,277.609,417.489,279.925z
                                    M426.808,289.994l-3.409,3.523l-3.386-3.227c-1.864-1.773-3.773-3.614-4.227-4.091l-0.841-0.864l3.977-4.159l4-4.136l1.046,0.886
                                    c0.591,0.5,2.5,2.273,4.25,3.955l3.182,3.046l-0.591,0.773C430.467,286.13,428.671,288.062,426.808,289.994z"/>
                            </g>
                            <g>
                                <path d="M294.556,393.991c-2.697,2.957-4.863,5.486-4.811,5.666c0.029,0.181,2.589,2.596,5.685,5.356l5.606,5.04l3.223-3.543
                                    c2.691-2.952,6.954-8.067,6.954-8.067l-3.104-2.906c-2.435-2.301-8.302-7.002-8.302-7.002S296.738,391.6,294.556,393.991z
                                    M304.21,403.738l-3.288,3.636l-3.494-3.111c-1.923-1.709-3.893-3.484-4.363-3.946l-0.87-0.835l3.834-4.291l3.858-4.269
                                    l1.075,0.85c0.608,0.48,2.576,2.187,4.382,3.809l3.283,2.936l-0.564,0.792C307.736,399.753,306.007,401.744,304.21,403.738z"/>
                            </g>
                            <g>
                                <path d="M531.677,394.301c-2.943,2.712-5.32,5.043-5.285,5.227c0.013,0.183,2.354,2.811,5.199,5.829l5.147,5.508l3.518-3.25
                                    c2.937-2.708,7.627-7.434,7.627-7.434l-2.84-3.164c-2.226-2.504-7.663-7.696-7.663-7.696S534.059,392.108,531.677,394.301z
                                    M540.449,404.849l-3.591,3.337l-3.211-3.402c-1.767-1.869-3.576-3.809-4.005-4.309l-0.794-0.907l4.192-3.943l4.214-3.919
                                    l0.997,0.941c0.564,0.531,2.376,2.402,4.035,4.174l3.016,3.21l-0.631,0.74C544.308,401.184,542.412,403.018,540.449,404.849z"/>
                            </g>
                            <path d="M400.197,402.614c0.433,5.251,2.531,10.245,6.126,14.098c0.025,0.027,0.05,0.054,0.075,0.081
                                c3.886,4.114,8.364,6.387,13.841,7.068c7.364,0.932,14.523-1.546,19.478-6.75c1.886-1.977,2.932-3.477,4.182-5.977
                                c1.909-3.796,2.523-6.796,2.318-11.341c-0.159-3.659-0.705-5.818-2.318-9c-3.136-6.273-8.182-10.409-14.864-12.205
                                c-2.25-0.591-8.273-0.773-10.478-0.295c-2.727,0.568-6.818,2.364-8.864,3.864c-1.5,1.091-4.75,4.523-5.887,6.227
                                c-1.25,1.841-2.364,4.227-3.023,6.523C400.008,397.233,399.994,400.165,400.197,402.614z M402.784,394.951
                                c1.227-3.864,2.773-6.273,6.159-9.523c1.909-1.818,2.636-2.341,4.409-3.205c2.568-1.25,4.659-1.955,6.614-2.227
                                c1.841-0.25,6.227-0.091,8.182,0.341c3.136,0.659,6.977,2.727,9.637,5.182c2.636,2.432,5.432,7.273,6.137,10.614
                                c0.545,2.546,0.5,7.773-0.091,10.023c-1.614,6.091-6.046,11.432-11.682,14.046c-2.864,1.364-4.182,1.636-8.046,1.773
                                c-3.932,0.136-6.091-0.182-8.955-1.318c-1.193-0.483-2.384-1.138-3.531-1.925c-6.28-4.313-9.737-11.635-9.489-19.25
                                C402.176,398,402.369,396.462,402.784,394.951z"/>
                            <path d="M414.012,399.655v4.886h9.091h9.091v-4.886v-4.887h-9.091h-9.091V399.655z M430.376,399.655v3.068h-7.159h-7.159v-3.068
                                v-3.068h7.159h7.159V399.655z"/>
                            <path d="M391.966,501.021v20.114h9.773h9.773v-15.637c0-8.614-0.068-17.66-0.159-20.114l-0.136-4.477h-9.637h-9.614V501.021z
                                M404.534,482.885l4.932,0.136v18.16v18.137h-7.841h-7.841v-18.296v-18.296h2.909C398.284,482.725,401.807,482.794,404.534,482.885
                                z"/>
                            <path d="M434.921,501.021v20.114h9.887h9.887v-20.114v-20.114h-9.887h-9.887V501.021z M452.649,501.021v18.296h-7.841h-7.841
                                v-18.296v-18.296h7.841h7.841V501.021z"/>
                            <path d="M414.012,494.317v4.477v4.182l4.705,5l4.705,5l4.386-4.387l4.386-4.386v-4.932v-4.955h-8.932H414.012z M430.376,499.84
                                v3.455l-3.477,3.477l-3.477,3.477l-3.682-3.932l-3.659-3.932l-0.023-3.023v-3h7.159h7.159V499.84z"/>
                            <path d="M414.012,531.477v13.978h9.182c6.273,0,9.25-0.068,9.341-0.25c0.091-0.136,0.091-6.409,0-13.978l-0.182-13.728h-9.159
                                h-9.182V531.477z M428.739,519.476l1.864,0.136v11.887v11.909h-7.387h-7.387v-12.046v-12.046h5.523
                                C424.376,519.317,427.694,519.385,428.739,519.476z"/>
                        </g>
                        </svg>
                        <div class="pos-field">
                            <!-- Catcher -->
                            <div id="catcher" class="def-position catcher">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.catcher.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- First Base -->
                            <div id="first" class="def-position first">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.first.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Second Base -->
                            <div id="second" class="def-position second">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.second.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Third Base -->
                            <div id="third" class="def-position third">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.third.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Short Stop -->
                            <div id="short" class="def-position short">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.shortstop.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Left Field -->
                            <div id="left" class="def-position left">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.left.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Center Field -->
                            <div id="center" class="def-position center">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.center.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                            <! -- Right Field -->
                            <div id="right" class="def-position right">
                                <img src="https://img.mlbstatic.com/mlb-photos/image/upload/w_120,q_100/v1/people/${defense.right.id}/headshot/silo/current" style="width: 5em; height: 5em;">
                            </div>
                        </div>
                        <div class="stadium-location">${data.gameData.venue.name} >
                        <span class="city-state">${data.gameData.venue.location.city}, ${data.gameData.venue.location.stateAbbrev}</span>
                        </div>
                        </div>
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
 
     // Get the gamePk from the URL and fetch the game data
     const gamePk = getGamePkFromURL();
     if (gamePk) {
         fetchAndDisplayGameData(gamePk);
     }
     
 });
