
document.addEventListener('DOMContentLoaded', function () {
    // Get the search input element
    var searchBar = document.getElementById('searchBar');

   // Get the clear button
   var clearButton = document.querySelector('.header-autoComplete-clearIndicatorDirty');

    // Remove the placeholder value when the input is focused
    searchBar.addEventListener('focus', function () {
        searchBar.placeholder = '';
        clearButton.style.display = 'block'; // Show the clear button
    });

    // Restore the placeholder value when the input loses focus and is empty
    searchBar.addEventListener('blur', function () {
        if (!searchBar.value) {
            searchBar.placeholder = 'Search';
            clearButton.style.display = 'none'; // Hide the clear button
        }
    });

    // Clear the input and hide the clear button when the clear button is clicked
    clearButton.addEventListener('click', function() {
      searchBar.value = '';
      searchBar.placeholder = 'Search';
      clearButton.style.display = 'none'; // Hide the clear button
    })

    // Optional: Remove placeholder when the user starts typing
    searchBar.addEventListener('input', function () {
        searchBar.placeholder = '';
        clearButton.style.display = 'block'; // Show the clear button
    });

    });
