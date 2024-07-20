document.addEventListener('DOMContentLoaded', () => {
    const apiURL = 'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2024';

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
        142: 'minn', // Minesota Twins
        143: 'phi', // Philadelphia Phillies 
        144: 'atl', // Atlanta Braves 
        145: 'chw', // Chicago White Sox
        146: 'mia', // Miami Marlins
        147: 'nyy', // New York Yankees 
        158: 'mil', // Milwaukee Brewers 

    };

    fetch(apiURL)
        .then(response => response.json())
        .then(data => updateStandings(data))
        .catch(error => console.error('Error fetching data:', error));

    function updateStandings(data) {
        const standingsContainer = document.getElementById('standings');
        standingsContainer.innerHTML = '';

        data.records.forEach(record => {
            const division = document.createElement('div');
            division.className = 'division-container';
            const table = document.createElement('table');
            table.className = 'standings-table';
            table.innerHTML = `
                <thead class="table-header">
                    <tr>
                        <th class="header-info">Team</th>
                        <th class="header-info" aria-label="Wins" aria-hidden="false">W</th>
                        <th class="header-info">L</th>
                        <th class="header-info">PCT</th>
                        <th class="header-info">GB</th>
                        <th class="header-info">WCGB</th>
                        <th class="header-info">L10</th>
                        <th class="header-info">STRK</th>
                        <th class="header-info">RS</th>
                        <th class="header-info">RA</th>
                        <th class="header-info">DIFF</th>
                        <th class="header-info">HOME</th>
                        <th class="header-info">AWAY</th>
                    </tr>
                </thead>
                <tbody>
                    ${record.teamRecords.map(teamRecord => {
                        const runDiff = teamRecord.runDifferential;
                        const runDiffColor = runDiff >= 0 ? 'green' : 'red';
                        const teamAbbreviation = teamMap[teamRecord.team.id] || 'unknown'; // Get the team abbr or 'unknown' if not found 
                        return `
                        <tr>
                            <td>
                                <a class="teamAbbr" href="https://localhost/teams/${teamAbbreviation}">
                                <img src="https://www.mlbstatic.com/team-logos/${teamRecord.team.id}.svg" alt="${teamRecord.team.name}" width="40px" height="40px" class="team-logo">
                                </a>
                            </td>
                            <td class="column-data">${teamRecord.wins}</td>
                            <td class="column-data">${teamRecord.losses}</td>
                            <td class="column-data">${teamRecord.winningPercentage}</td>
                            <td class="column-data">${teamRecord.gamesBack}</td>
                            <td class="column-data">${teamRecord.wildCardGamesBack}</td>
                            <td class="column-data">${teamRecord.records.splitRecords[8].wins}-${teamRecord.records.splitRecords[8].losses}</td>
                            <td class="column-data">${teamRecord.streak.streakCode}</td>
                            <td class="column-data">${teamRecord.runsScored}</td>
                            <td class="column-data">${teamRecord.runsAllowed}</td>
                            <td class="column-data" style="color: ${runDiffColor};">${runDiff}</td>
                            <td class="column-data">${teamRecord.records.splitRecords[0].wins}-${teamRecord.records.splitRecords[0].losses}</td>
                            <td class="column-data">${teamRecord.records.splitRecords[1].wins}-${teamRecord.records.splitRecords[1].losses}</td>
                        </tr>
                    `;
                    }).join('')}
                </tbody>
            `;
            division.appendChild(table);
            standingsContainer.appendChild(division);
        });
    }
});