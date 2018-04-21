/*
  author: Keir Armstrong
  contact: karmstr7@uoregon.edu
  date of creation: April 11, 2018
  last update: April 15, 2018
*/

/* --Instantiate all required objects--*/
let date = new Date();              // date object
const uuid = require('uuid/v1');    // random id generator
$('#event-modal').modal();          // modal
$('.datepicker').datepicker({       // datepicker
  showClearBtn: true,
});
$('.timepicker').timepicker({       // timepicker
  twelveHour: false,
  autoClose: true,
  showClearBtn: true,
});
$('.dropdown-trigger').dropdown();  // dropdown menu
/* ----------------------------------- */


/* ----------Global constants--------- */
const DAYS_AS_STRINGS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_AS_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLOR_OPTIONS = {"#ffcdd2": "red lighten-4",
                        "#f8bbd0": "pink lighten-4",
                        "#e1bee7": "purple lighten-4",
                        "#d1c4e9": "deep-purple lighten-4",
                        "#c5cae9": "indigo lighten-4",
                        "#bbdefb": "blue lighten-4",
                        "#f0f4c3": "lime lighten-4"}
/* ----------------------------------- */


/* ----------Global variables--------- */
let originPosition = 0;
let currentPosition = 0;      // tracking the day currently being shown
let days = [];                // a 'cookie' for all loaded events
/* ----------------------------------- */


/* ----------Global dictionaries------ */
/* ----------------------------------- */


/* -----------Helper functions-------- */
const dayToString = (num) => {    // transform day from int to string
  return DAYS_AS_STRINGS[num];
}

const getColor = (colorName=null) => {  // get random color or the named color
  if (colorName === null) {
    let colorKeys = Object.keys(COLOR_OPTIONS);
    let objLength = colorKeys.length;
    let randNum = Math.floor(Math.random()*objLength);
    let chosenKey = colorKeys[randNum];
    return COLOR_OPTIONS[chosenKey];
  }
  else {
    return COLOR_OPTIONS[colorName];
  }
}
/* ----------------------------------- */


/* -------Define general actions------ */
const BASE_URL = 'http://127.0.0.1:5000/calendar/api/events/';

const getEventsByDate = async (url) => {
  const response = await fetch(BASE_URL + url, {
    method: "get"
  });
  const data = await response.json();
  return data;    // data['events']
}

const createEvent = async (url, payload) => {
  const response = await fetch(BASE_URL + url, {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data;    // data['event']
}

const updateEvent = async (url, payload) => {
  const response = await fetch(BASE_URL + url, {
    method: "put",
    headers: {
      'ACCEPT': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data['event'];   // data['event']
}

const deleteEvent = async (url) => {
  const response = await fetch(BASE_URL + url, {
    method: "delete",
  });
  const data = await response.json();
  return data['result'];    //  data['result']
}

const createDay = () => {
  days.push([]);
}

const createPreviousDay = () => {
  days.unshift([]);
}

const populateDay = () => {
  let thisDay = new Date();
  let dayDelta = currentPosition - originPosition;
  thisDay.setDate(date.getDate()+dayDelta);
  let thisDayString = MONTHS_AS_STRINGS[thisDay.getMonth()] + " "
                      + thisDay.getDate().toString() + ", "
                      + date.getFullYear().toString();
  getEventsByDate(thisDayString).then(data => {
    events = data['events'];
    let i = 0, len = events.length;
    for (; i < len; i++) {
      days[currentPosition].push(events[i]);
    }
  }).catch(err => {
    console.log("error");       // TODO: inform user failure to load events
  });
  displayEvents();
}

const displayEvents = (day=currentPosition) => {
  let i = 1, len = 25;
  for (; i < len; i++) {
    let tableCell = '#' + i.toString();
    $(tableCell).text('');
    $(tableCell).removeClass('red lighten-4 pink lighten-4 purple lighten-4 deep-purple lighten-4 indigo lighten-4 blue lighten-4 lime lighten-4');
    $(tableCell).removeClass('has-event');
    $(tableCell).val('');
  }

  let thisDayEvents = days[day];
  i = 0, len = thisDayEvents.length;
  for (; i < len; i++) {
    id = thisDayEvents[i]['id'];
    name = thisDayEvents[i]['name'];
    color = thisDayEvents[i]['color'];
    startTime = parseInt(thisDayEvents[i]['start-time'].split(":")[0]);
    endTime = parseInt(thisDayEvents[i]['end-time'].split(":")[0]);
    let j = 0, eventLen = endTime - startTime;
    for (; j < eventLen; j++) {
      if (j === 0) {
        $('#' + startTime.toString()).text(name);
      }
      $('#' + startTime.toString()).val(id);
      $('#' + startTime.toString()).addClass(color);
      $('#' + startTime.toString()).addClass('has-event');
      startTime++;
    }
  }
}
/* ----------------------------------- */

/* -------Pre-load actions/states------*/
createDay();
/* ----------------------------------- */

/* ------Post-load events/states------ */
$(document).ready(function(){
  populateDay();
  let openedEvent = null;
  // display day of week and day of month in day panel
  $('#day-table>thead>tr').append("<th>" +
                                  dayToString(date.getDay()) + " " +
                                  date.getDate().toString() + "</th>");

  // clickable event area
  $('#day-table>tbody>tr').click(
    function() {
      // open modal
      $('#event-modal').modal('open');
      if ($(this).children().hasClass('has-event')) {
        openedEvent = $(this).children();
        $('#event-create').hide();
        $('#event-delete').show();
        $('#event-save').show();
      }
      else {
        openedEvent = null;
        $('#event-delete').hide();
        $('#event-save').hide();
        $('#event-create').show();
      }
    }
  );

  $('#event-delete').click(
    function(e) {
      e.preventDefault();
      let events = days[currentPosition];
      let i = 0, len = events.length;
      for (; i < len; i++) {
        if (events[i]['id'] === openedEvent.val()) {
          deleteEvent(openedEvent.val()).then(data => {
            days[currentPosition].splice(i, 1);
          });
        }
      };
    }
  );

  $('#previous').click(
    function() {
      createPreviousDay();
      populateDay();
    }
  );

  $('#next').click(
    function() {
      console.log("next");

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

  $('#event-save').click(
    function(e) {
      // e.preventDefault();
      let $inputs = $('#event-form :input');
      let vals = {};
      $inputs.each(function() {
        vals[this.name] = $(this).val();
      });
      delete vals[""];
      console.log(vals);
    }
  )

  $('#event-create').click(
    function(e) {
      // e.preventDefault();
      $('#event-form').trigger('submit');
    }
  );

  // TODO: validate inputs
  $('#event-form').submit(
    function(e) {
      e.preventDefault();
      let $inputs = $('#event-form :input');
      let vals = {};
      $inputs.each(function() {
        vals[this.name] = $(this).val();
      });
      delete vals[""];
      vals["color"] = getColor();
      vals["id"] = uuid();
      createEvent("create", vals).then(data => {
        event = data['event'];
        days[currentPosition].push(event);
        displayEvents();
      }).catch(err => {
        console.log("error: failed to create new event");
      })
    }
  );
});
/* ----------------------------------- */

/* ------------ATTRIBUTIONS------------*/

/* ----------------------------------- */
