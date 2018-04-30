/*
  author: Keir Armstrong, Andrew Letz, Kyle Nielsen
  contact: karmstr7@uoregon.edu, kylen@uoregon.edu, aletz@uoregon.edu
  date of creation: April 11, 2018
  last update: April 29, 2018
*/

/* --------- Global constants -------- */
const COLOR_OPTIONS = {"#ffcdd2": "red lighten-4",
                        "#f8bbd0": "pink lighten-4",
                        "#e1bee7": "purple lighten-4",
                        "#d1c4e9": "deep-purple lighten-4",
                        "#c5cae9": "indigo lighten-4",
                        "#bbdefb": "blue lighten-4",
                        "#f0f4c3": "lime lighten-4"}
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_AS_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const VIEW_MODES = ["day", "week"];
/* ----------------------------------- */

/* --- Instantiate required objects ---*/
const remote = require('electron').remote;
const UUID = require('uuid/v1');        // unique id generator
$('#event-modal').modal({               // Materialize modal component
  dismissible: false
});
$('.dropdown-trigger').dropdown();      // Materialize dropdown component
$('.datepicker').datepicker({           // Materialize datepicker component
  showClearBtn: true,
});
$('.timepicker').timepicker({           // Materialize timepicker component
  twelveHour: false,
  showClearBtn: true,
});
$('.tooltipped').tooltip();             // Materialize tooltip component
/* ----------------------------------- */

/* --- Default scroll ---*/
//$('.main').scrollTop($('.panel.time-table.days-tbody.default-scroll').position().top);
/* ----------------------------------- */

/* ---------- Helper functions ------- */
const getColor = (colorName=null) => {  // get a random color or the named color
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

const formatMonth = (date) => {               // converts digit to lettered represenation of month
  return MONTHS_AS_STRINGS[date.getMonth()];
}

const formataWeekday = (date) => {            // converts digit to lettered represenation of week
  return DAYS_OF_WEEK[date.getDay()];
}

const formatFull = (date) => {                // converts all date objects to a readable format
  return MONTHS_AS_STRINGS[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear().toString();
}

const gotoDayView = () => {
  view.changeViewMode('day');
  $('#previous').attr('data-tooltip', 'Previous Day');
  $('#next').attr('data-tooltip', 'Next Day');
  $('#tab-day').addClass('active');
  $('#tab-week').removeClass('active');
  $('#panel-week').hide();
  $('#panel-day').show();
  let monthYear = formatMonth(view.currentDay) + " " + view.currentDay.getFullYear().toString();
  $('#month-year').html(monthYear);
  document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Today";
}

const gotoWeekView = () => {
  view.changeViewMode('week');
  $('#previous').attr('data-tooltip', 'Previous Week');
  $('#next').attr('data-tooltip', 'Next Week');
  $('#tab-day').removeClass('active');
  $('#tab-week').addClass('active');
  $('#panel-day').hide();
  $('#panel-week').show();
  let monthYear = formatMonth(view.currentWeek) + " " + view.currentWeek.getFullYear().toString();
  $('#month-year').html(monthYear);
  document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Week";
}

const validateInputs = () => {                // call to validate form inputs
  let valid = true;
  let $inputs = $('#event-form :input');
  let tempStartHour = null, tempStartMin = null;
  $inputs.each(function() {
    if (this.name === 'name') {
      if (2 <= $(this).val().length  && $(this).val().length <= 25) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'description') {
      if (2 <= $(this).val().length && $(this).val().length <= 350) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'start-date') {
      if ($(this).val().length >= 11) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'end-date') {
      if ($(this).val().length >= 11) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'start-time') {
      if ($(this).val().length === 5) {
        tempStartHour = parseInt($(this).val().split(":")[0]);
        tempStartMin = parseInt($(this).val().split(":")[1]);
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'end-time') {
      let endHour = parseInt($(this).val().split(":")[0]);
      let endMin = parseInt($(this).val().split(":")[1]);
      let validEndTime = false;
      if ((endHour > tempStartHour) || (endHour === tempStartHour && endMin > tempStartMin)) {
        validEndTime = true;
      }
      if ($(this).val().length === 5 && validEndTime) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
  });
  if (valid) {
    return true;
  }
  return false;
}
/* ----------------------------------- */

/* ------- API Request Actions ------- */
const BASE_URL = 'http://127.0.0.1:5000';
const API_EVENTS = '/calendar/api/events';
const ID_URL = '/calendar/api/events/id';
const CREATE_URL = '/calendar/api/events/create';
const BACKUP_URL = '/calendar/backup';
                                          // async await lets the appliction run without freezing up while waiting for server response.
const getAllEvents = async () => {        // call this to fetch all events in the database
  const response = await fetch(BASE_URL+API_EVENTS, {
    method: "get"
  });
  const data = await response.json();
  return data['events'];
}

const getEventsByDate = async (date) => { // call this to fetch all events of the specified date in the database
  const response = await fetch(BASE_URL+API_EVENTS+"/" + date, {
    method: "get"
  });
  const data = await response.json();
  return data['events'];
}

const postEvent = async (payload) => {  // call this to create an event in the database
  const response = await fetch(BASE_URL + CREATE_URL, {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data['event'];
}

const updateEvent = async (id, payload) => {  // call this to update the selected event in the database
  const response = await fetch(BASE_URL+API_EVENTS+"/" + id, {
    method: "put",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data['event'];
}

const deleteEvent = async (id) => { // call this to delete event of the specified id in the database
  const response = await fetch(BASE_URL+API_EVENTS+"/" + id, {
    method: "delete",
  });
  const data = await response.json();
  return data['result'];
}

const createBackup = () => {  // creates a backup csv file
  fetch(BASE_URL + BACKUP_URL)
  .then(function(response) {
    console.log(response);
  });
}
/* ----------------------------------- */

/* ------------ Controllers ---------- */
class ViewManager {
  constructor() {
    this.currentDay = new Date();
    this.currentWeek = new Date();
    this.dayTables = {};
    this.weekTables = {};
    this.currentViewMode = "day";
    this.events = [];
    this._init();
    this.createDayViewTable();
    this.createWeekViewTable();
  }

  _init() {                         // it's probably fine to just get all the events with a small app, not ideal when scaled.
    getAllEvents()
    .then(data => {
      this.events = data;
      this.renderDayViewEvents();
      this.renderWeekViewEvents();
    })
    .catch(err => {
      alert("Network error, couldn't establish connection to server. Try again"); // actually needs a hard restart of the program.
    });
  }

  createDayViewTable() {           // generate tables using javascript, because who wants to type it out?
    let monthYear = formatMonth(this.currentDay) + " " + this.currentDay.getFullYear().toString();
    $('#month-year').html(monthYear);
    let monthDateYear = formatMonth(this.currentDay) + " " + this.currentDay.getDate().toString() + ", " + this.currentDay.getFullYear().toString();
    let table = document.getElementById('day-table'),
        thead = document.createElement('thead'),
        tbody = document.createElement('tbody');
    for (let i = 0; i < 25; i++) {
      if (i === 0) {
        let weekDate = formataWeekday(this.currentDay) + " " + this.currentDay.getDate().toString();
        let th = document.createElement('th'),
            tr = document.createElement('tr');
        th.innerHTML = weekDate;
        tr.appendChild(th);
        thead.appendChild(tr);
        table.appendChild(thead);
      }
      else {
        let tr = document.createElement('tr'),
            td = document.createElement('td');
        if (i < 10) { // sets up the IDs for prepopulating fields later
          if (i == 0) {
            var newId = '0:00';
          } else {
            var newId = '0' + (i - 1) + ':00';
          }
        } else {
          var newId = (i - 1) + ':00';
        }
        tr.id = newId;
        tr.appendChild(td);
        tbody.appendChild(tr);
      }
    }
    table.appendChild(tbody);
    $('#day-table').prop('value', monthDateYear);
  }

  createWeekViewTable() {
    let monthYear = formatMonth(this.currentWeek) + " " + this.currentWeek.getFullYear().toString();
    $('#month-year').html(monthYear);
    let copiedDate = new Date(this.currentWeek);
    for (let i = 0; i < 7; i++) {
      let weekDate = formataWeekday(copiedDate) + " " + copiedDate.getDate().toString();
      let monthDateYear = formatMonth(copiedDate) + " " + copiedDate.getDate().toString() + ", " + copiedDate.getFullYear().toString();
      let table = document.getElementById('week-table-' + i.toString());
      let thead = document.createElement('thead');
      let tbody = document.createElement('tbody');

      for (let j = 0; j < 25; j++) {
        if (j === 0) {
          let th = document.createElement('th'),
              tr = document.createElement('tr');
          th.innerHTML = weekDate;
          tr.appendChild(th);
          thead.appendChild(tr);
          table.appendChild(thead);
        }
        else {
          let tr = document.createElement('tr');
          let td = document.createElement('td');
          if (j < 10) { // sets up the IDs for prepopulating fields later
            if (j == 0) {
              var newId = '0:00';
            } else {
              var newId = '0' + (j - 1) + ':00';
            }
          } else {
            var newId = (j - 1) + ':00';
          }
          tr.id = newId;
          tr.appendChild(td);
          tbody.appendChild(tr);
        }
      }
      table.appendChild(tbody);
      $('#week-table-' + i.toString()).prop('value', monthDateYear);
      copiedDate.setDate(copiedDate.getDate() + 1);
    }
  }

  renderDayViewEvents() {   // call this after the tables have been generated, this attaches events to the approriate table cells.
    // clear table
    $('#day-table > tbody > tr').each(function() {
      $(this).removeClass('red pink purple deep-purple indigo blue lime lighten-4');
      $(this).removeClass('has-event');
      $(this).children().first().html('');
      $(this).val('');
    });

    let monthDateYear = formatMonth(this.currentDay) + " " + this.currentDay.getDate().toString() + ", " + this.currentDay.getFullYear().toString();
    let todaysEvents = {};
    let i = 0, len = this.events.length;
    for (; i < len; i++) {
      if (this.events[i]['start-date'] === monthDateYear) {
        let startTime = parseInt(this.events[i]['start-time'].split(":")[0]),
            endTime = parseInt(this.events[i]['end-time'].split(":")[0]);
		let endMinute = parseInt(this.events[i]['end-time'].split(":")[1]);  // Kyle
        let timeDelta = endTime - startTime;
		if (endMinute > 0) {  // Kyle
			timeDelta = timeDelta + 1;
		}
        todaysEvents[startTime] = this.events[i];
        todaysEvents[startTime]['time-delta'] = timeDelta;
      }
    }
    if (Object.keys(todaysEvents).length === 0) {return false};

    let continueEvent = null;
    $('#day-table > tbody > tr').each(function(i) {
      if (continueEvent != null) {
        $(this).addClass(continueEvent['color']);
        $(this).addClass('has-event');
        $(this).val(continueEvent['id']);
        continueEvent['time-delta']--;
        if (continueEvent['time-delta'] === 0) {
          continueEvent = null;
        }
      }
      if (i in todaysEvents) {
        continueEvent = todaysEvents[i];
        $(this).children().first().html(continueEvent['name']);
        $(this).children().first().append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        $(this).children().first().append(continueEvent['start-time'] + "-" + continueEvent['end-time']);
        $(this).addClass(continueEvent['color']);
        $(this).addClass('has-event');
        $(this).val(continueEvent['id']);
        continueEvent['time-delta']--;
        if (continueEvent['time-delta'] === 0) {
          continueEvent = null;
        }
      }
    });
  }

  renderWeekViewEvents() {  // render events for 7 days at a time
    // clear tables
    for (let i = 0; i < 7; i++) {
      let tableName = '#week-table-' + i.toString() + '>tbody>tr';
      $(tableName).each(function() {
        $(this).removeClass('red pink purple deep-purple indigo blue lime lighten-4');
        $(this).removeClass('has-event');
        $(this).children().first().html('');
        $(this).val('');
      });
    }
    let copiedDate = new Date(this.currentWeek);
    for (let i = 0; i < 7; i++) {
      let tableName = '#week-table-' + i.toString() + '>tbody>tr';
      let monthDateYear = formatMonth(copiedDate) + " " + copiedDate.getDate().toString() + ", " + copiedDate.getFullYear().toString();
      let todaysEvents = {};
      let j = 0, len = this.events.length;
      for (; j < len; j++) {
        if (this.events[j]['start-date'] === monthDateYear) {
          let startTime = parseInt(this.events[j]['start-time'].split(":")[0]),
              endTime = parseInt(this.events[j]['end-time'].split(":")[0]);
    		  let endMinute = parseInt(this.events[j]['end-time'].split(":")[1]);  // Kyle
              let timeDelta = endTime - startTime;
    		  if (endMinute > 0) {  // Kyle
    			timeDelta = timeDelta + 1;
    		  }
          todaysEvents[startTime] = this.events[j];
          todaysEvents[startTime]['time-delta'] = timeDelta;
        }
      }
      copiedDate.setDate(copiedDate.getDate() + 1);
      if (Object.keys(todaysEvents).length === 0) {continue};
      let continueEvent = null;
      $(tableName).each(function(k) {
        if (continueEvent != null) {
          $(this).addClass(continueEvent['color']);
          $(this).addClass('has-event');
          $(this).val(continueEvent['id']);
          continueEvent['time-delta']--;
          if (continueEvent['time-delta'] === 0) {
            continueEvent = null;
          }
        }
        if (k in todaysEvents) {
          continueEvent = todaysEvents[k];
          $(this).children().first().html(continueEvent['name']);
          $(this).addClass(continueEvent['color']);
          $(this).addClass('has-event');
          $(this).val(continueEvent['id']);
          continueEvent['time-delta']--;
          if (continueEvent['time-delta'] === 0) {
            continueEvent = null;
          }
        }
      });
    }
  }
  showPrevious() {  // triggers when user clicks the prevous button, handles both day view and week view
    if (this.currentViewMode === "day") {
      this.currentDay.setDate(this.currentDay.getDate() - 1);
      this.renderDayViewEvents();
      let monthYear = formatMonth(this.currentDay) + " " + this.currentDay.getFullYear().toString();
      let weekDate = formataWeekday(this.currentDay) + " " + this.currentDay.getDate().toString();
      let monthDateYear = formatMonth(this.currentDay) + " " + this.currentDay.getDate().toString() + ", " + this.currentDay.getFullYear().toString();
      $('#month-year').html(monthYear);
      $('#day-table thead tr th').html(weekDate);
      $('#day-table').prop('value', monthDateYear);
    }
    else {
      this.currentWeek.setDate(this.currentWeek.getDate() - 7);
      this.renderWeekViewEvents();
      let monthYear = formatMonth(this.currentWeek) + " " + this.currentWeek.getFullYear().toString();
      $('#month-year').html(monthYear);
      let copiedDate = new Date(this.currentWeek);
      for (let i = 0; i < 7; i++) {
        let weekDate = formataWeekday(copiedDate) + " " + copiedDate.getDate().toString();
        let monthDateYear = formatMonth(copiedDate) + " " + copiedDate.getDate().toString() + ", " + copiedDate.getFullYear().toString();
        $('#week-table-' + i.toString() + ' thead tr th').html(weekDate);
        $('#week-table-' + i.toString()).prop('value', monthDateYear);
        copiedDate.setDate(copiedDate.getDate() + 1);
      }
    }
  }

  showNext() {  // triggers when user clicks the next button, handles both day view and week view
    if (this.currentViewMode === "day") {
      this.currentDay.setDate(this.currentDay.getDate() + 1);
      this.renderDayViewEvents();
      let monthYear = formatMonth(this.currentDay) + " " + this.currentDay.getFullYear().toString();
      let weekDate = formataWeekday(this.currentDay) + " " + this.currentDay.getDate().toString();
      let monthDateYear = formatMonth(this.currentDay) + " " + this.currentDay.getDate().toString() + ", " + this.currentDay.getFullYear().toString();
      $('#month-year').html(monthYear);
      $('#day-table thead tr th').html(weekDate);
      $('#day-table').prop('value', monthDateYear);
    }
    else {
      this.currentWeek.setDate(this.currentWeek.getDate() + 7);
      this.renderWeekViewEvents();
      let monthYear = formatMonth(this.currentWeek) + " " + this.currentWeek.getFullYear().toString();
      $('#month-year').html(monthYear);
      let copiedDate = new Date(this.currentWeek);
      for (let i = 0; i < 7; i++) {
        let weekDate = formataWeekday(copiedDate) + " " + copiedDate.getDate().toString();
        let monthDateYear = formatMonth(copiedDate) + " " + copiedDate.getDate().toString() + ", " + copiedDate.getFullYear().toString();
        $('#week-table-' + i.toString() + ' thead tr th').html(weekDate);
        $('#week-table-' + i.toString()).prop('value', monthDateYear);
        copiedDate.setDate(copiedDate.getDate() + 1);
      }
    }
  }

  findEventById(id) {   // returns the event with matching id
    let i = 0, len = this.events.length;
    for (; i < len; i++) {
      if (this.events[i]['id'] === id) {
        return this.events[i];
      }
    }
  }

  createNewEvent(data) {  // want to call the Request functions in the class to make use the class's methods
    postEvent(data)
    .then(data => {
      this.events.push(data);
      this.renderDayViewEvents();
      this.renderWeekViewEvents();
    })
    .catch(err => {
      alert("Network error, couldn't establish connection to server. Try again");
    });
  }

  removeEvent(id) { // want to call the Request functions in the class to make use the class's methods
    deleteEvent(id)
    .then(data => {
      let i = 0, len = this.events.length;
      for (; i < len; i++) {
        if (this.events[i]['id'] === id) {
          this.events.splice(i, 1);
          break;
        }
      }
      this.renderDayViewEvents();
      this.renderWeekViewEvents();
    })
    .catch(err => {
      alert("Network error, couldn't establish connection to server. Try again");
    });
  }

  updateEvent(id, data) { // want to call the Request functions in the class to make use the class's methods
    updateEvent(id, data)
    .then(data => {
      this.events.push(data);
      this.renderDayViewEvents();
      this.renderWeekViewEvents();
    })
    .catch(err => {
      alert("Network error, couldn't establish connection to server. Try again");
    });
  }

  changeViewMode(newView) { // switch between day/week views
    this.currentViewMode = newView;
  }

  getCurrentDay() { // getter method
    return this.currentDay;
  }

  getCurrentWeek() {  // getter method
    return this.currentWeek;
  }
  getCurrentView() {  // getter method
    return this.currentViewMode;
  }
}
let view = new ViewManager();
/* ----------------------------------- */

/* ------ Starting the Program ------- */
$(document).ready(function() {
  let openedEventId = null;   // for tracking the event currently being edited

  // Enable event menu to pop
  $('table>tbody>tr').click(
    function() {
      remote.getGlobal('storage').needsPrompt = true;
      if ($(this).hasClass('has-event')) {  // if an event is in this cell, prepopulate the form with existing data.
        openedEventId = $(this).val();
        let eventData = view.findEventById($(this).val());
        $('#event-name').val(eventData['name']);
        $('#event-description').val(eventData['description']);
        $('#event-start-date').val(eventData['start-date']);
        $('#event-end-date').val(eventData['end-date']);
        $('#event-start-time').val(eventData['start-time']);
        $('#event-end-time').val(eventData['end-time']);
        M.updateTextFields();
        $('#event-create').hide();
        $('#event-delete').show();
        $('#event-save').show();
      }
      else {                                // if no existing event, prepopulate with default data.
        openedEventId = null;
        let d = $(this).parent().parent().val();
        $('#event-start-date').val(d);
        $('#event-end-date').val(d);
        $('#event-start-time').val(this.id);
        if (this.id == '23:00') {
          $('#event-end-time').val('23:59');
        } else {
          $('#event-end-time').val($(this).closest('tr').next().attr("id"));
        }
        M.updateTextFields();
        validateInputs();
        $('#event-delete').hide();
        $('#event-save').hide();
        $('#event-create').show();
      }
      $('#event-modal').modal('open');
    }
  );

  // Enable event menu actions
  $('#event-delete').click(             // delete button
    function() {
      if (openedEventId != null) {
        view.removeEvent(openedEventId);
        resetEventForm();
        $('#event-modal').modal('close');
      }
      remote.getGlobal('storage').needsPrompt = false;
    }
  );

  $('#event-save').click(               // save/update button
    function() {
      if (validateInputs()) {
        let $inputs = $('#event-form :input');
        let vals = {};
        $inputs.each(function() {
          vals[this.name] = $(this).val();
        });
        delete vals[''];
        vals['id'] = openedEventId;
        view.updateEvent(openedEventId, vals);
        resetEventForm();
        $('#event-modal').modal('close');
      }
      remote.getGlobal('storage').needsPrompt = false;
    }
  );


  $('#event-cancel').click(
    function() {
      resetEventForm();
      remote.getGlobal('storage').needsPrompt = false;
    }
  );

  $('#event-create').click(
    function() {
      $('#event-form').trigger('submit');
    }
  );

  $('#event-form').submit(
    function(e) {
      e.preventDefault();
      if (validateInputs()){
        let $inputs = $('#event-form :input');
        let vals = {};
        $inputs.each(function() {
          vals[this.name] = $(this).val();
        });
        delete vals[''];
        vals['color'] = getColor();
        vals['id'] = UUID();
        view.createNewEvent(vals);
        resetEventForm();
        $('#event-modal').modal('close');
      }
      remote.getGlobal('storage').needsPrompt = false;
    }
  );

  // File backup
  $('#backup').click(
    function() {
      createBackup();
    }
  );

  // Previous/Next day navigation
  $('#previous').click(
    function() {
      view.showPrevious();
    }
  );

  $('#next').click(
    function() {
      view.showNext();
    }
  );

  /*    Dropdown menu     */

  // Hide current view, show day view.
  $('#tab-day').click(
    function() {
      gotoDayView();
    }
  );

  // Hide current view, show week view.
  $('#tab-week').click(
    function() {
      gotoWeekView();
    }
  );

  // small functions to update changes in the form, useful for form validation
  $('#event-end-time').change(function() {
    validateInputs();
  });

  $('#event-start-time').change(function() {
    validateInputs();
  });

  $('#event-end-date').change(function() {
    validateInputs();
  });

  $('#event-start-date').change(function() {
    validateInputs();
  });

  $('#event-name').change(function() {
    validateInputs();
  });

  $('#event-description').change(function() {
    validateInputs();
  });

  // need to forget filled forms once done with em, or if they are cancelled mid-way.
  const resetEventForm = () =>{
    $('#event-name').val('Untitled Event');
    $('#event-description').val('Empty');
    $('#event-start-date').val('');
    $('#event-end-date').val('');
    $('#event-start-time').val('00:00');
    $('#event-end-time').val('01:00');
  }
});
/* ----------------------------------- */

/* ------- ATTRIBUTIONS -------
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
    --------------------------- */
