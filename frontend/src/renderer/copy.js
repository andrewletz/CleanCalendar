/*
  author: Keir Armstrong
  contact: karmstr7@uoregon.edu
  date of creation: April 11, 2018
  last update: April 21, 2018
*/

// TODO: Default input values =====> URGENT
// TODO: Forget entries in previously visited days =====> URGENT
// TODO: Error reporting to the user =====> MODERATELY URGENT
// TODO: Text alignment, time-table needs better vertical alignment =====> MODERATELY URGENT

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
const UUID = require('uuid/v1');
$('#event-modal').modal({
  dismissible: false
});
$('.dropdown-trigger').dropdown();
$('.datepicker').datepicker({
  showClearBtn: true,
});
$('.timepicker').timepicker({
  twelveHour: false,
  showClearBtn: true,
});
/* ----------------------------------- */

/* ---------- Helper functions ------- */
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

const formatMonth = (date) => {
  return MONTHS_AS_STRINGS[date.getMonth()];
}

const formataWeekday = (date) => {
  return DAYS_OF_WEEK[date.getDay()];
}

const formatFull = (date) => {
  return MONTHS_AS_STRINGS[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear().toString();
}

const validateInputs = () => {
  let valid = true;
  let $inputs = $('#event-form :input');
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
      if ($(this).val().length === 12) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'end-date') {
      if ($(this).val().length === 12) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'start-time') {
      if ($(this).val().length === 5) {
        $(this).removeClass('invalid')
      } else {
        valid = false;
        $(this).addClass('invalid')
      }
    }
    if (this.name === 'end-time') {
      if ($(this).val().length === 5) {
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
const BASE_URL = 'http://127.0.0.1:5000/calendar/api/events';
const ID_URL = '/id';
const CREATE_URL = '/create';

const getAllEvents = async () => {
  const response = await fetch(BASE_URL, {
    method: "get"
  });
  const data = await response.json();
  return data['events'];
}

const getEventsByDate = async (date) => {
  const response = await fetch(BASE_URL + "/" + date, {
    method: "get"
  });
  const data = await response.json();
  return data['events'];
}

const postEvent = async (payload) => {
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

const updateEvent = async (id, payload) => {
  const response = await fetch(BASE_URL + "/" + id, {
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

const deleteEvent = async (id) => {
  const response = await fetch(BASE_URL + "/" + id, {
    method: "delete",
  });
  const data = await response.json();
  return data['result'];
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

  _init() {
    getAllEvents()
    .then(data => {
      this.events = data;
      this.renderDayViewEvents();
      this.renderWeekViewEvents();
      this._findLastSunday();
    })
    .catch(err => {
      alert("Network error, couldn't establish connection to server. Try again");
    });
  }

  _findLastSunday() {
    let copy = this.currentWeek;
    let i = 0, len = 7;
    for (; i < len; i++) {
      if (copy.getDay() === 0) {
        console.log('found sunday', copy);
        break;
      }
      copy.setDate(copy.getDate() - 1);
    }
  }

  createDayViewTable() {
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
    let copy = this.currentWeek;
    if (copy.getDay() != 0) {
      for (let i = 0; i < 7; i++) {
        copy.setDate(copy.getDate() - 1);
        if (copy.getDay() === 0) {
          this.currentWeek = copy;
          break;
        }
      }
    }
    for (let i = 0; i < 7; i++) {
      let weekDate = formataWeekday(copy) + " " + copy.getDate().toString();
      let monthDateYear = formatMonth(copy) + " " + copy.getDate().toString() + ", " + copy.getFullYear().toString();
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
          tr.appendChild(td);
          tbody.appendChild(tr);
        }
      }
      table.appendChild(tbody);
      $('#week-table-' + i.toString()).prop('value', monthDateYear);
      copy.setDate(copy.getDate() + 1);
    }
  }

  renderDayViewEvents() {
    // clear table
    $('#day-table > tbody > tr').each(function() {
      $(this).removeClass('red pink purple deep-purple indigo blue lime lighten-4');
      $(this).children().first().html('');
    });

    let monthDateYear = formatMonth(this.currentDay) + " " + this.currentDay.getDate().toString() + ", " + this.currentDay.getFullYear().toString();
    let todaysEvents = {};
    let i = 0, len = this.events.length;
    for (; i < len; i++) {
      if (this.events[i]['start-date'] === monthDateYear) {
        let startTime = parseInt(this.events[i]['start-time'].split(":")[0]),
            endTime = parseInt(this.events[i]['end-time'].split(":")[0]);
        let timeDelta = endTime - startTime;
        todaysEvents[startTime] = this.events[i];
        todaysEvents[startTime]['time-delta'] = timeDelta;
      }
    }
    if (Object.keys(todaysEvents).length === 0) {return false};

    let continueEvent = null;
    $('#day-table > tbody > tr').each(function(i) {
      if (continueEvent != null) {
        $(this).addClass(continueEvent['color']);
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
        continueEvent['time-delta']--;
        if (continueEvent['time-delta'] === 0) {
          continueEvent = null;
        }
      }
    });
  }

  renderWeekViewEvents() {
    // clear tables
    for (let i = 0; i < 7; i++) {
      let tableName = '#week-table-' + i.toString() + '>tbody>tr';
      $(tableName).each(function() {
        $(this).removeClass('red pink purple deep-purple indigo blue lime lighten-4');
        $(this).children().first().html('');
      });
    }

    let copyWeek = this.currentWeek;
    copyWeek.setDate(copyWeek.getDate() - 7);
    for (let i = 0; i < 7; i++) {
      let tableName = '#week-table-' + i.toString() + '>tbody>tr';
      let monthDateYear = formatMonth(copyWeek) + " " + copyWeek.getDate().toString() + ", " + copyWeek.getFullYear().toString();
      let todaysEvents = {};
      let j = 0, len = this.events.length;
      for (; j < len; j++) {
        if (this.events[j]['start-date'] === monthDateYear) {
          let startTime = parseInt(this.events[j]['start-time'].split(":")[0]),
              endTime = parseInt(this.events[j]['end-time'].split(":")[0]);
          let timeDelta = endTime - startTime;
          todaysEvents[startTime] = this.events[j];
          todaysEvents[startTime]['time-delta'] = timeDelta;
        }
      }
      if (Object.keys(todaysEvents).length === 0) {continue};
      let continueEvent = null;
      $(tableName).each(function(k) {
        if (continueEvent != null) {
          $(this).addClass(continueEvent['color']);
          continueEvent['time-delta']--;
          if (continueEvent['time-delta'] === 0) {
            continueEvent = null;
          }
        }
        if (k in todaysEvents) {
          continueEvent = todaysEvents[k];
          $(this).children().first().html(continueEvent['name']);
          $(this).addClass(continueEvent['color']);
          continueEvent['time-delta']--;
          if (continueEvent['time-delta'] === 0) {
            continueEvent = null;
          }
        }
      });
      copyWeek.setDate(copyWeek.getDate() + 1);
    }
  }
  showPrevious() {
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
      this.currentWeek.setDate(this.currentWeek.getDate() - 14);
      this.renderWeekViewEvents();
      let monthYear = formatMonth(this.currentWeek) + " " + this.currentWeek.getFullYear().toString();
      $('#month-year').html(monthYear);
      for (let i = 0; i < 7; i++) {
        let weekDate = formataWeekday(this.currentWeek) + " " + this.currentWeek.getDate().toString();
        let monthDateYear = formatMonth(this.currentWeek) + " " + this.currentWeek.getDate().toString() + ", " + this.currentWeek.getFullYear().toString();
        $('#week-table-' + i.toString() + ' thead tr th').html(weekDate);
        $('#week-table-' + i.toString()).prop('value', monthDateYear);
        this.currentWeek.setDate(this.currentWeek.getDate() + 1);
      }
    }
  }

  showNext() {
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
      for (let i = 0; i < 7; i++) {
        let weekDate = formataWeekday(this.currentWeek) + " " + this.currentWeek.getDate().toString();
        let monthDateYear = formatMonth(this.currentWeek) + " " + this.currentWeek.getDate().toString() + ", " + this.currentWeek.getFullYear().toString();
        $('#week-table-' + i.toString() + ' thead tr th').html(weekDate);
        $('#week-table-' + i.toString()).prop('value', monthDateYear);
        this.currentWeek.setDate(this.currentWeek.getDate() + 1);
      }
    }
  }

  changeViewMode(newView) {
    this.currentViewMode = newView;
  }

  getCurrentDay() {
    return this.currentDay;
  }

  getCurrentView() {
    return this.currentViewMode;
  }
}

let view = new ViewManager();
/* ----------------------------------- */

/* ------ Starting the Program ------- */
$(document).ready(function() {
  // let openedEvent = null;   // for tracking the event currently being edited
  //
  // Enable event menu to pop
  $('table>tbody>tr').click(
    function() {
      if ($(this).children().hasClass('has-event')) {
        openedEvent = $(this).children();
        $('#event-create').hide();
        $('#event-delete').show();
        $('#event-save').show();
      }
      else {
        openedEvent = null;
        let d = $(this).parent().parent().val();
        $('#event-start-date').val(d);
        $('#event-end-date').val(d);
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
  // $('#event-delete').click(
  //   function() {
  //     console.log(openedEvent.val());
  //     eManager.deleteEvent(openedEvent.val());
  //   }
  // );
  //
  // $('#event-save').click(
  //   function() {
  //     let $inputs = $('#event-form :input');
  //     let vals = {};
  //     $inputs.each(function() {
  //       vals[this.name] = $(this).val();
  //     });
  //     delete vals[""];
  //     eManager.updateEvent(openedEvent.val(), vals);
  //   }
  // );
  //

  $('#event-cancel').click(
    function() {
      resetEventForm();
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
        console.log(vals);
        resetEventForm();
        $('#event-modal').modal('close');
      }
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
      view.changeViewMode('day');
      $('#tab-day').addClass('active');
      $('#tab-week').removeClass('active');
      $('#panel-week').hide();
      $('#panel-day').show();
      document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Today";
    }
  );

  // Hide current view, show week view.
  $('#tab-week').click(
    function() {
      view.changeViewMode('week');
      $('#tab-day').removeClass('active');
      $('#tab-week').addClass('active');
      $('#panel-day').hide();
      $('#panel-week').show();
      document.getElementById("view-options-dropdown").childNodes[0].nodeValue = "Week";
    }
  );

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
