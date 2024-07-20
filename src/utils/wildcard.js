document.addEventListener('DOMContentLoaded', () => {
    const apiURL = 'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=2024';

    const teamMap = {
        108: 'laa', 109: 'az', 110: 'bal', 111: 'bos', 112: 'chc', 113: 'cin', 114: 'cle',
        115: 'col', 116: 'det', 117: 'hou', 118: 'kc', 119: 'lad', 120: 'was', 121: 'nym',
        133: 'oak', 134: 'pit', 135: 'sd', 136: 'sea', 137: 'sf', 138: 'stl', 139: 'tb',
        140: 'tex', 141: 'tor', 142: 'minn', 143: 'phi', 144: 'atl', 145: 'chw', 146: 'mia',
        147: 'nyy', 158: 'mil'
    };

    fetch(apiURL)
        .then(response => response.json())
        .then(data => updateStandings(data))
        .catch(error => console.error('Error fetching data:', error));

    function updateStandings(data) {
        const standingsContainer = document.getElementById('wild-card-standings');
        standingsContainer.innerHTML = '';

        // Separate AL and NL teams
        const alTeams = data.records.filter(record => record.league.id === 103); // AL
        const nlTeams = data.records.filter(record => record.league.id === 104); // NL

        // Process and render AL Division Leaders and Wild Card Standings
        const alDivisionLeaders = processDivisionLeaders(alTeams);
        renderDivisionStandings('AL Division Leaders', alDivisionLeaders, standingsContainer);

        const alWildCard = processWildCard(alTeams);
        renderWildCardStandings('AL Wild Card', alWildCard, standingsContainer);

        // Process and render NL Division Leaders and Wild Card Standings
        const nlDivisionLeaders = processDivisionLeaders(nlTeams);
        renderDivisionStandings('NL Division Leaders', nlDivisionLeaders, standingsContainer);

        const nlWildCard = processWildCard(nlTeams);
        renderWildCardStandings('NL Wild Card', nlWildCard, standingsContainer);
    }

    function processDivisionLeaders(teams) {
        let divisionLeaders = [];

        teams.forEach(record => {
            const leader = record.teamRecords.find(team => team.divisionRank === '1');
            if (leader) {
                divisionLeaders.push(leader);
            }
        });

        divisionLeaders.sort((a, b) => b.winningPercentage - a.winningPercentage);
        return divisionLeaders;
    }

    function processWildCard(teams) {
        let wildCardTeams = [];

        teams.forEach(record => {
            wildCardTeams = wildCardTeams.concat(record.teamRecords);
        });

        // Sort based on wildCardRank or winning percentage
        wildCardTeams.sort((a, b) => {
            if (a.wildCardRank && b.wildCardRank) {
                return a.wildCardRank - b.wildCardRank;
            }
            return b.winningPercentage - a.winningPercentage;
        });

        const leaders = wildCardTeams.filter(team => team.wildCardRank && team.wildCardRank <= 3);
        const contenders = wildCardTeams.filter(team => team.wildCardRank && team.wildCardRank > 3);

        return { leaders, contenders };
    }

    function renderDivisionStandings(title, teams, container) {
        const section = document.createElement('section');
        section.className = 'division-section';

        const header = document.createElement('h2');
        header.textContent = title;
        section.appendChild(header);

        const table = document.createElement('table');
        table.className = 'division-table';
        table.innerHTML = `
            <thead class="table-header">
                <tr>
                    <th class="header-info">Team</th>
                    <th class="header-info">W</th>
                    <th class="header-info">L</th>
                    <th class="header-info">PCT</th>
                    <th class="header-info">GB</th>
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
                ${teams.map(teamRecord => {
                    const runDiff = teamRecord.runDifferential;
                    const runDiffColor = runDiff >= 0 ? 'green' : 'red';
                    const teamAbbreviation = teamMap[teamRecord.team.id] || 'unknown';
                    return `
                        <tr>
                            <td>
                                <a class="teamAbbr" href="https://localhost/teams/${teamAbbreviation}">
                                    <img src="https://www.mlbstatic.com/team-logos/${teamRecord.team.id}.svg" alt="${teamRecord.team.name}" width="40px" height="40px" class="team-logo">
                                </a>
                            </td>
                            <td class="column-data">${teamRecord.wins}</td>
                            <td class="column-data">${teamRecord.losses}</td>
                            <td class="column-data">${parseFloat(teamRecord.winningPercentage).toFixed(3)}</td>
                            <td class="column-data">${teamRecord.gamesBack}</td>
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

        section.appendChild(table);
        container.appendChild(section);
    }

    function renderWildCardStandings(title, data, container) {
        const section = document.createElement('section');
        section.className = 'wild-card-section';

        const header = document.createElement('h2');
        header.textContent = title;
        section.appendChild(header);

        const table = document.createElement('table');
        table.className = 'wild-card-table';
        table.innerHTML = `
            <thead class="table-header">
                <tr>
                    <th class="header-info">Team</th>
                    <th class="header-info">W</th>
                    <th class="header-info">L</th>
                    <th class="header-info">PCT</th>
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
                ${data.leaders.concat(data.contenders).map((teamRecord, index) => {
                    const runDiff = teamRecord.runDifferential;
                    const runDiffColor = runDiff >= 0 ? 'green' : 'red';
                    const teamAbbreviation = teamMap[teamRecord.team.id] || 'unknown';
                    const borderStyle = (index === 2) ? 'style="border-bottom: 2px dashed;"' : '';
                    return `
                        <tr ${borderStyle}>
                            <td>
                                <a class="teamAbbr" href="https://localhost/teams/${teamAbbreviation}">
                                    <img src="https://www.mlbstatic.com/team-logos/${teamRecord.team.id}.svg" alt="${teamRecord.team.name}" width="40px" height="40px" class="team-logo">
                                </a>
                            </td>
                            <td class="column-data">${teamRecord.wins}</td>
                            <td class="column-data">${teamRecord.losses}</td>
                            <td class="column-data">${parseFloat(teamRecord.winningPercentage).toFixed(3)}</td>
                            <td class="column-data">${teamRecord.wildCardGamesBack}</td>
                            <td class="column-data">${teamRecord.records.splitRecords[8].wins}-${teamRecord.records.splitRecords[8].losses}</td>
                            <td class="column-data">${teamRecord.streak.streakCode}</td>
                            <td class="column-data">${teamRecord.runsScored}</td>
                            <td class
                            <td class="column-data">${teamRecord.runsAllowed}</td>
                            <td class="column-data" style="color: ${runDiffColor};">${runDiff}</td>
                            <td class="column-data">${teamRecord.records.splitRecords[0].wins}-${teamRecord.records.splitRecords[0].losses}</td>
                            <td class="column-data">${teamRecord.records.splitRecords[1].wins}-${teamRecord.records.splitRecords[1].losses}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;

        section.appendChild(table);
        container.appendChild(section);
    }
});
