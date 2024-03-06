document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.querySelector('.flex-cal');

  const renderCalendar = () => {
    // Your existing calendar rendering logic...

    // Add an event listener to each date box
    document.querySelectorAll('.datepicker_day').forEach(dayElement => {
      dayElement.addEventListener('click', function () {
        // Get the clicked date
        const clickedDate = this.textContent;

        // Update the input value with the selected date
        dateInput.value = `${date.getMonth() + 1}/${clickedDate}`;
      });
    });
  };

  // Your existing navigation and rendering logic...

  // Initial render
  renderCalendar();
});

