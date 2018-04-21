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
/* ----------------------------------- */

/* --- Instantiate required objects ---*/
const UUID = require('uuid/v1');
$('#event-modal').modal();
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

/* ------- Calendar Controller ------- */
class ViewManager {
  constructor(weekMonthDisplayElement, numberOfCells) {
    this.date = new Date();
    this.days = [];
    this.currentlyShown = [];
    this.daysSize = 0;
    this.showingAmount = 1;
    this.weekMonthDisplayElement = weekMonthDisplayElement;
    this.numberOfCells = numberOfCells;
    this.init();
  }

  init() {
    let text = formataWeekday(this.date) + " " + this.date.getDate().toString();
    $(this.weekMonthDisplayElement).text(text);
    getAllEvents()
    .then(data => {
      let daysWithEvents = {};
      let i = 0, len = data.length;
      for (; i < len; i++) {
        if (!(data[i]['start-date'] in daysWithEvents)) {
          daysWithEvents[data[i]['start-date']] = true;
          let d = new Day(data[i]['start-date']);
          d.fill(data[i]);
          this.days.push(d);
          this.daysSize++;
        }
        else {
          let j = 0, len2 = this.days.length;
          for (; j < len2; j++) {
            if (this.days[j].getDate() === data[i]['start-date']) {
              this.days[j].fill(data[i]);
            }
          }
        }
      }
      let formattedDate = formatFull(this.date);
      this.currentlyShown.push(formattedDate);
      this.showEvents();
    })
    .catch((err) => {
      console.log("error happened");
    })
  }

  showPrevious() {
    this.date.setDate(this.date.getDate() - 1);
    let text = formataWeekday(this.date) + " " + this.date.getDate().toString();
    $(this.weekMonthDisplayElement).text(text);
    let formattedDate = formatFull(this.date);
    this.currentlyShown.pop();
    this.currentlyShown.push(formattedDate);
    this.showEvents();
  }

  showNext() {
    this.date.setDate(this.date.getDate() + 1);
    let text = formataWeekday(this.date) + " " + this.date.getDate().toString();
    $(this.weekMonthDisplayElement).text(text);
    let formattedDate = formatFull(this.date);
    this.currentlyShown.pop();
    this.currentlyShown.push(formattedDate);
    this.showEvents();
  }

  deleteEvent(eventId) {
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (; i < len; i++) {
      if (this.days[i].getDate() === formattedDate) {
        this.days[i].delete(eventId);
        if (this.days[i].getSize() == 0) {
          this.days[i].splice(i, 1);
          this.daysSize--;
          this.showEvents();
          return;
        }
      }
    }
  }

  updateEvent(eventId, data) {
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (i; i < len; i++) {
      if (this.days[i].getDate() === formattedDate) {
        this.days[i].update(eventId, data);
        this.showEvents();
        return;
      }
    }
  }

  addEvent(data) {
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (i; i < len; i++) {
      if (this.days[i].getDate() === formattedDate) {
        this.days[i].add(data);
        this.showEvents();
        return;
      }
    }
    this.days.push(new Day(data['start-date']));
    this.daysSize++;
    this.days[this.daysSize-1].add(data);
    this.showEvents();
    return;
  }

  showEvents() {
    let i = 1, len = this.numberOfCells + 1;
    for (; i < len; i++) {
      $('#' + i.toString()).text('');
      $('#' + i.toString()).val('');
      $('#' + i.toString()).removeClass('red lighten-4 pink lighten-4 purple lighten-4 deep-purple lighten-4 indigo lighten-4 blue lighten-4 lime lighten-4');
      $('#' + i.toString()).removeClass('hasClass');
    }

    i = 0, len = this.daysSize;
    for (; i < len; i++) {
      if (this.days[i].getDate() === this.currentlyShown[0]) {    // check if this day has events at all
        let events = this.days[i].getEvents();
        let j = 0, len2 = events.length;
        for (; j < len2; j++) {
          let id = events[j]['id'];
          let name = events[j]['name'];
          let color = events[j]['color'];
          let startTime = parseInt(events[j]['start-time'].split(":")[0]);
          let endTime = parseInt(events[j]['end-time'].split(":")[0]);
          let k = 0, len3 = endTime - startTime;
          for (; k < len3; k++){
            if (k === 0) {
              $('#' + startTime.toString()).text(name);
            }
            $('#' + startTime.toString()).val(id);
            $('#' + startTime.toString()).addClass(color);
            $('#' + startTime.toString()).addClass('has-event');
            startTime++;
          }
        }
        break;
      }
    }
  }

  getDaysSize() {
    return this.daysSize;
  }

  getShowingAmount() {
    return this.showingAmount;
  }

  getCurrentDay() {
    return this.currentlyShown[0];
  }

  getAllDays() {
    return this.days;
  }
}

class Day {
  constructor(date) {
    this.date = date;
    this.size = 0;
    this.events = [];
  }

  add(eventObj) {
    this.events.push(eventObj);
    this.size++;
    postEvent(eventObj);
  }

  delete(eventId) {
    let i = 0, len = this.size;
    console.log(this.events);
    for (; i < len; i++) {
      if (this.events[i]['id'] === eventId) {
        this.events.splice(i, 1);
        this.size--;
        break;
      }
    }
    deleteEvent(eventId);
  }

  update(eventId, data) {
    let i = 0, len = this.size;
    for (; i < len; i++) {
      if (this.events[i]['id'] === eventId) {
        this.events[i]['name'] = data['name'];
        this.events[i]['start-date'] = data['start-date'];
        this.events[i]['end-date'] = data['end-date'];
        this.events[i]['start-time'] = data['start-time'];
        this.events[i]['end-time'] = data['end-time'];
      }
    }
    updateEvent(eventId, data);
  }

  fill(eventObj) {
    this.events.push(eventObj);
    this.size++;
  }

  getSize() {
    return this.size;
  }

  getDate() {
    return this.date;
  }

  getEvents() {
    return this.events;
  }
}
/* ----------------------------------- */

/* ------ Starting the Program ------- */
let view = new ViewManager("#week-month", 24);

$(document).ready(function() {
  let openedEvent = null;   // for tracking the event currently being edited

  // Enable event menu to pop
  $('#day-table>tbody>tr').click(
    function() {
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

  // Enable event menu actions
  $('#event-delete').click(
    function() {
      console.log(openedEvent.val());
      view.deleteEvent(openedEvent.val());
    }
  );

  $('#event-save').click(
    function() {
      let $inputs = $('#event-form :input');
      let vals = {};
      $inputs.each(function() {
        vals[this.name] = $(this).val();
      });
      delete vals[""];
      view.updateEvent(openedEvent.val(), vals);
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
      let $inputs = $('#event-form :input');
      let vals = {};
      $inputs.each(function() {
        vals[this.name] = $(this).val();
      });
      delete vals[''];
      console.log(367)
      vals['color'] = getColor();
      vals['id'] = UUID();
      view.addEvent(vals);
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

  // Dropdown menu and the corresponding content panels (could be written more elegantly, tbh)
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
});
/* ----------------------------------- */

/* --------- ATTRIBUTIONS ----------- */

/* ---------------------------------- */
