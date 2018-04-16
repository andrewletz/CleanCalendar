/*
  author: Keir Armstrong
  contact: karmstr7@uoregon.edu
  date of creation: April 11, 2018
  last update: April 11, 2018
*/

/* --Instantiate all required objects--*/
let date = new Date();
$('#event-modal').modal();
$('.datepicker').datepicker({
  showClearBtn: true,
});
$('.timepicker').timepicker({
  twelveHour: false,
  autoClose: true,
  showClearBtn: true,
});
$('.dropdown-trigger').dropdown();
/* ----------------------------------- */


/* ----------Global constants--------- */
const DAYS_AS_STRINGS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_AS_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/* ----------------------------------- */


/* ----------Global variables--------- */
let currentDay = 0;
let days = [];
/* ----------------------------------- */


/* ----------Global dictionaries------ */
let daySchedule = {
  "1": null,
  "2": null,
  "3": null,
  "4": null,
  "5": null,
  "6": null,
  "7": null,
  "8": null,
  "9": null,
  "10": null,
  "11": null,
  "12": null,
  "13": null,
  "14": null,
  "15": null,
  "16": null,
  "17": null,
  "18": null,
  "19": null,
  "20": null,
  "21": null,
  "22": null,
  "23": null,
  "24": null,
}
/* ----------------------------------- */


/* -----------Helper functions-------- */
let dayToString= (num) => {
  return DAYS_AS_STRINGS[num];
}
/* ----------------------------------- */


/* ---------Pre-load events/states---- */

/* ----------------------------------- */


/* --------Post-load events----------- */
$(document).ready(function(){
  // display day of week and day of month in day panel
  $('#day-table>thead>tr').append("<th>" +
                                  dayToString(date.getDay()) + " " +
                                  date.getDate().toString() + "</th>");

  // clickable event area
  $('#day-table>tbody>tr').click(
    function() {
      $(this).children('td').addClass('red lighten-4')
      // open modal
      $('#event-modal').modal('open');
      // attach a default value (today's date) to #event-start-date
      let startAndEndDate = MONTHS_AS_STRINGS[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear().toString();
      let startHour = parseInt($(this).children('td').children('input').val());
      let endHour = startHour + 1;
      let startTime = startHour.toString() + ":" + "00";
      let endTime = endHour.toString() + ":" + "00";

      $('#event-start-date').val(startAndEndDate);
      $('#event-end-date').val(startAndEndDate);
      $('#event-start-time').val(startTime);
      $('#event-end-time').val(endTime);

      M.updateTextFields();
    }
  );

  $('#tab-day').click(
    function() {
      $('#tab-day').addClass('active');
      $('#tab-week').removeClass('active');
      $('#tab-month').removeClass('active');
      $('#tab-year').removeClass('active');

      $('#panel-week').hide();
      $('#panel-month').hide();
      $('#panel-year').hide();
      $('#panel-day').show();

      document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Today";
    }
  );

  $('#tab-week').click(
    function() {
      $('#tab-day').removeClass('active');
      $('#tab-week').addClass('active');
      $('#tab-month').removeClass('active');
      $('#tab-year').removeClass('active');

      $('#panel-day').hide();
      $('#panel-month').hide();
      $('#panel-year').hide();
      $('#panel-week').show();

      document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Week";
    }
  );

  $('#tab-month').click(
    function() {
      $('#tab-day').removeClass('active');
      $('#tab-week').removeClass('active');
      $('#tab-month').addClass('active');
      $('#tab-year').removeClass('active');

      $('#panel-day').hide();
      $('#panel-week').hide();
      $('#panel-year').hide();
      $('#panel-month').show();

      document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Month";
    }
  );

  $('#tab-year').click(
    function() {
      $('#tab-day').removeClass('active');
      $('#tab-week').removeClass('active');
      $('#tab-month').removeClass('active');
      $('#tab-year').addClass('active');

      $('#panel-day').hide();
      $('#panel-week').hide();
      $('#panel-month').hide();
      $('#panel-year').show();

      document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Year";
    }
  );

  $('#event-create').click(
    function(e) {
      e.preventDefault();
      console.log('hello');
      $('#event-form').trigger('submit');
    }
  );

  $('#event-form').submit(
    function(e) {
      e.preventDefault();
      let $inputs = $('#event-form :input');
      let vals = {};
      $inputs.each(function() {
        vals[this.name] = $(this).val();
      });
      let startTime = "";
      let i = 0;
      while (vals['event-start-time'].charAt(i) != ":") {
        startTime = startTime + vals['event-start-time'].charAt(i);
        i++;
      };
      let endTime = "";
      i = 0;
      while (vals['event-end-time'].charAt(i) != ":") {
        endTime = endTime + vals['event-end-time'].charAt(i);
        i++;
      };
      let hoursLength = parseInt(endTime) - parseInt(startTime);
      for (i = 0; i < hoursLength; i++) {
        days[currentDay][startTime] = vals;
        startTime = (parseInt(startTime) + 1).toString();
      };
      console.log(days[currentDay]);
    }
  );

  const createDay = () => {
    let day = Object.assign(daySchedule);
    days.push(day);
  }
  createDay();

  const displayDay = () => {
    let thisDaySchedule = days[currentDay];
    let i = 0;
    $('#day-table tr').each(function() {
      $.each(this.cells, function() {
        if (i != 0) {
          let iToString = i.toString();
          if (thisDaySchedule[iToString]) {
            $(this).text(thisDaySchedule[iToString]['description']);
          }
          else {
            $(this).text("");
          }
        }
        i++;
      });
    });
  }

  const editDayEvent = (hour, props) => {
    days[currentDay][hour] = props;
    displayDay();
  }
});
/* ----------------------------------- */
