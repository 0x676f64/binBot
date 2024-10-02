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

                    const awayAvgOne = playerOne ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[0]}`]?.seasonStats.batting.avg : '';
                    const awayAvgTwo = playerTwo ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[1]}`]?.seasonStats.batting.avg : '';
                    const awayAvgThree = playerThree ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[2]}`]?.seasonStats.batting.avg : '';
                    const awayAvgFour = playerFour ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[3]}`]?.seasonStats.batting.avg : '';
                    const awayAvgFive = playerFive ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[4]}`]?.seasonStats.batting.avg : '';
                    const awayAvgSix = playerSix ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[5]}`]?.seasonStats.batting.avg : '';
                    const awayAvgSeven = playerSeven ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[6]}`]?.seasonStats.batting.avg : '';
                    const awayAvgEight = playerEight ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[7]}`]?.seasonStats.batting.avg : '';
                    const awayAvgNine = playerNine ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[8]}`]?.seasonStats.batting.avg : '';
                    
                    const homeAvgOne = homeOne ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[0]}`]?.seasonStats.batting.avg : '';
                    const homeAvgTwo = homeTwo ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[1]}`]?.seasonStats.batting.avg : '';
                    const homeAvgThree = homeThree ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[2]}`]?.seasonStats.batting.avg : '';
                    const homeAvgFour = homeFour ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[3]}`]?.seasonStats.batting.avg : '';
                    const homeAvgFive = homeFive ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[4]}`]?.seasonStats.batting.avg : '';
                    const homeAvgSix = homeSix ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[5]}`]?.seasonStats.batting.avg : '';
                    const homeAvgSeven = homeSeven ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[6]}`]?.seasonStats.batting.avg : '';
                    const homeAvgEight = homeEight ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[7]}`]?.seasonStats.batting.avg : '';
                    const homeAvgNine = homeNine ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[8]}`]?.seasonStats.batting.avg : '';

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

                            </div>
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
                            <style id="overall-color">.e{fill:#006c54;stroke:#ffdddd;}.e,.f{stroke-miterlimit:10;}.f{fill:#006c54;stroke:#ffdddd;opacity:0.8;}</styl>
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
 
                    const awayAvgOne = playerOne ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[0]}`]?.seasonStats.batting.avg : '';
                    const awayAvgTwo = playerTwo ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[1]}`]?.seasonStats.batting.avg : '';
                    const awayAvgThree = playerThree ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[2]}`]?.seasonStats.batting.avg : '';
                    const awayAvgFour = playerFour ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[3]}`]?.seasonStats.batting.avg : '';
                    const awayAvgFive = playerFive ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[4]}`]?.seasonStats.batting.avg : '';
                    const awayAvgSix = playerSix ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[5]}`]?.seasonStats.batting.avg : '';
                    const awayAvgSeven = playerSeven ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[6]}`]?.seasonStats.batting.avg : '';
                    const awayAvgEight = playerEight ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[7]}`]?.seasonStats.batting.avg : '';
                    const awayAvgNine = playerNine ? data.liveData.boxscore.teams.away.players[`ID${awayBattingOrder[8]}`]?.seasonStats.batting.avg : '';
                    
                    const homeAvgOne = homeOne ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[0]}`]?.seasonStats.batting.avg : '';
                    const homeAvgTwo = homeTwo ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[1]}`]?.seasonStats.batting.avg : '';
                    const homeAvgThree = homeThree ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[2]}`]?.seasonStats.batting.avg : '';
                    const homeAvgFour = homeFour ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[3]}`]?.seasonStats.batting.avg : '';
                    const homeAvgFive = homeFive ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[4]}`]?.seasonStats.batting.avg : '';
                    const homeAvgSix = homeSix ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[5]}`]?.seasonStats.batting.avg : '';
                    const homeAvgSeven = homeSeven ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[6]}`]?.seasonStats.batting.avg : '';
                    const homeAvgEight = homeEight ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[7]}`]?.seasonStats.batting.avg : '';
                    const homeAvgNine = homeNine ? data.liveData.boxscore.teams.home.players[`ID${homeBattingOrder[8]}`]?.seasonStats.batting.avg : '';

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
                                    <a href="/gamefeed?gamePk=${gamePk}/away-fielding">
                                    <img src="${awayTeamLogo}" class="svg-spots away-svg">
                                    </a>
                                    <div id="away-batting-order"></div> 
                                </div>
                            </div>
                            <div class="team-color home-team-color" style="background-color: ${homeTeamColor};">
                                <div class="pre-game-teams-home">
                                    <a href="/gamefeed?gamePk=${gamePk}home-fielding">
                                    <img src="${homeTeamLogo}" class="svg-spots home-svg">
                                    </a>
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
                                     <tr class="lineup">
                                     <td id="awayOrder">
                                        <span id="awayField">${awayFieldOne}</span>
                                        <span id="playerName">${playerOne}</span>
                                        <span id="awaySide">${awayHandOne}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgOne}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">1</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandOne}</span>
                                        <span id="playerName">${homeOne}</span>
                                        <span id="homeField">${homeFieldOne}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgOne}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldTwo}</span>
                                        <span id="playerName">${playerTwo}</span>
                                        <span id="awaySide">${awayHandTwo}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgTwo}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">2</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandTwo}</span>
                                        <span id="playerName">${homeTwo}</span>
                                        <span id="homeField">${homeFieldTwo}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgTwo}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldThree}</span>
                                        <span id="playerName">${playerThree}</span>
                                        <span id="awaySide">${awayHandThree}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgThree}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">3</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandThree}</span>
                                        <span id="playerName">${homeThree}</span>
                                        <span id="homeField">${homeFieldThree}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgThree}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldFour}</span>
                                        <span id="playerName">${playerFour}</span>
                                        <span id="awaySide">${awayHandFour}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgFour}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">4</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandFour}</span>
                                        <span id="playerName">${homeFour}</span>
                                        <span id="homeField">${homeFieldFour}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgFour}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldFive}</span>
                                        <span id="playerName">${playerFive}</span>
                                        <span id="awaySide">${awayHandFive}</span>
                                       <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgFive}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">5</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandFive}</span>
                                        <span id="playerName">${homeFive}</span>
                                        <span id="homeField">${homeFieldFive}</span>
                                       <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgFive}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldSix}</span>
                                        <span id="playerName">${playerSix}</span>
                                        <span id="awaySide">${awayHandSix}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgSix}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">6</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandSix}</span>
                                        <span id="playerName">${homeSix}</span>
                                        <span id="homeField">${homeFieldSix}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgSix}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldSeven}</span>
                                        <span id="playerName">${playerSeven}</span>
                                        <span id="awaySide">${awayHandSeven}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgSeven}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">7</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandSeven}</span>
                                        <span id="playerName">${homeSeven}</span>
                                        <span id="homeField">${homeFieldSeven}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgSeven}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldEight}</span>
                                        <span id="playerName">${playerEight}</span>
                                        <span id="awaySide">${awayHandEight}</span>
                                       <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgEight}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">8</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandEight}</span>
                                        <span id="playerName">${homeEight}</span>
                                        <span id="homeField">${homeFieldEight}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgEight}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                    <tr class="lineup">
                                    <td id="awayOrder">
                                        <span id="awayField">${awayFieldNine}</span>
                                        <span id="playerName">${playerNine}</span>
                                        <span id="awaySide">${awayHandNine}</span>
                                        <div class="away-progress-bar">
                                            <span id="awaySeasonAvg">${awayAvgNine}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    <td id="numbers">9</td>
                                    <td id="homeOrder">
                                        <span id="homeSide">${homeHandNine}</span>
                                        <span id="playerName">${homeNine}</span>
                                        <span id="homeField">${homeFieldNine}</span>
                                        <div class="home-progress-bar">
                                            <span id="homeSeasonAvg">${homeAvgNine}</span>
                                        </div>
                                        <span class="last10"></span>
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
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
