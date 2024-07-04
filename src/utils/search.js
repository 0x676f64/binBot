// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get the search input element by its ID
    var searchBar = document.getElementById('searchBar');

    // Get the clear button element by its class name
    var clearButton = document.querySelector('.header-autoComplete-clearIndicatorDirty');

    // Add an event listener to the search bar for the 'focus' event
    searchBar.addEventListener('focus', function () {
        // Remove the placeholder text when the search bar gains focus
        searchBar.placeholder = '';
        // Show the clear button
        clearButton.style.display = 'block';
    });

    // Add an event listener to the search bar for the 'blur' event
    searchBar.addEventListener('blur', function () {
        // If the search bar is empty when it loses focus
        if (!searchBar.value) {
            // Restore the placeholder text
            searchBar.placeholder = 'Search';
            // Hide the clear button
            clearButton.style.display = 'none';
        }
    });

    // Add an event listener to the clear button for the 'click' event
    clearButton.addEventListener('click', function() {
        // Clear the search bar value
        searchBar.value = '';
        // Restore the placeholder text
        searchBar.placeholder = 'Search';
        // Hide the clear button
        clearButton.style.display = 'none';
    });

    // Add an event listener to the search bar for the 'input' event
    searchBar.addEventListener('input', function () {
        // Remove the placeholder text when the user starts typing
        searchBar.placeholder = '';
        // Show the clear button
        clearButton.style.display = 'block';
    });

    // Add an event listener to the search bar for the 'keypress' event
    searchBar.addEventListener('keypress', function(event) {
        // Check if the pressed key is 'Enter'
        if (event.key === 'Enter') {
            // Prevent the default form submission
            event.preventDefault();
            // Call the searchPlayer function
            searchPlayer();
        }
    });
});

// Function to search for MLB players
function searchPlayer() {
    // Get the player name from the search bar
    var playerName = document.getElementById('searchBar').value;

    // Make an AJAX request to the search_player endpoint with the player name as a query parameter
    fetch(`https://statsapi.mlb.com/api/v1/people/search?names=${playerName}`)
        .then(response => response.json()) // Parse the JSON from the response
        .then(data => {
            // Get the results div to display the search results
            var resultsDiv = document.getElementById('results');
            // Clear previous results
            resultsDiv.innerHTML = '';

            // Check if the data contains any players
            if (data && data.people && data.people.length > 0) {
                // Loop through each player and display their information
                data.people.forEach(player => {
                    // Create a new div element for each player
                    var playerDiv = document.createElement('div');
                    // Add a class to the player div
                    playerDiv.classList.add('player-result');
                    // Set the inner HTML of the player div with player's information
                    playerDiv.innerHTML = `<strong>${player.fullName}</strong> - ${player.primaryPosition.name} for ${player.currentTeam.name}`;
                    // Append the player div to the results div
                    resultsDiv.appendChild(playerDiv);
                });
            } else {
                // Display a message if no players are found
                resultsDiv.innerHTML = '<p>No players found</p>';
            }
        })
        .catch(error => {
            // Log the error to the console
            console.error('Error:', error);
            // Display an error message
            var resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = '<p>Error retrieving player data</p>';
        });
}


