const date = new Date();

const renderCalendar = () => {
  date.setDate(1);

  const monthDays = document.querySelector(".datepicker_week");

  const lastDay = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  const prevLastDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    0
  ).getDate();

  const firstDayIndex = date.getDay();

  const lastDayIndex = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDay();

  const nextDays = 7 - lastDayIndex - 1;

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const currentMonthYear = `${months[date.getMonth()]} ${date.getFullYear()}`;

  document.querySelector(".datepicker_current-month").innerHTML = currentMonthYear;

  document.querySelector(".datepicker_month p").innerHTML = new Date().toDateString();

  let days = "";

  for (let x = firstDayIndex; x > 0; x--) {
    days += `<div class="datepicker_day datepicker_day--outside-month">${prevLastDay - x + 1}</div>`;
  }

  for (let i = 1; i <= lastDay; i++) {
    if (
      i === new Date().getDate() &&
      date.getMonth() === new Date().getMonth()
    ) {
      days += `<div class="datepicker_day today" onclick="selectDate(${i}, this)">${i}</div>`;
    } else {
      days += `<div class="datepicker_day" onclick="selectDate(${i}, this)">${i}</div>`;
    }
  }

  for (let j = 1; j <= nextDays; j++) {
    days += `<div class="datepicker_day datepicker_day--outside-month" onclick="selectDate(${j}, this)">${j}</div>`;
    monthDays.innerHTML = days;
  }
};

document.querySelector(".datepicker_nav--previous").addEventListener("click", () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
});

document.querySelector(".datepicker_nav--next").addEventListener("click", () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
});

const selectDate = (day, element) => {
  // Reset background color for all date boxes
  document.querySelectorAll(".datepicker_day").forEach((dayElement) => {
    dayElement.style.backgroundColor = "#006C54";
  });

  // Highlight the selected date with the desired color
  element.style.backgroundColor = "#006C54";

  // Update the text inside the "flex-cal" button
  const flexCalButton = document.querySelector('.flex-cal');
  const currentMonthYear = document.querySelector(".datepicker_current-month").textContent;
  flexCalButton.value = `${currentMonthYear.split(' ')[0]}/${day}`;

  // You can perform additional actions here based on the selected date
  alert(`Selected Date: ${day} ${currentMonthYear}`);
};

const toggleCalendar = () => {
  const datepickerPopup = document.getElementById('datepickerPopup');
  datepickerPopup.style.display = (datepickerPopup.style.display === 'block') ? 'none' : 'block';

  // Get the selected date and update the button text
  const selectedDate = document.querySelector('.datepicker_day.selected');
  if (selectedDate) {
    const buttonText = `${selectedDate.textContent}/${document.querySelector('.datepicker_current-month').textContent.split(' ')[1]}`;
    document.querySelector('.flex-cal.calendar').textContent = buttonText;
  } else {
    // Reset to placeholder if no date is selected
    document.querySelector('.flex-cal.calendar').textContent = 'Select Date';
  }
};

renderCalendar();

