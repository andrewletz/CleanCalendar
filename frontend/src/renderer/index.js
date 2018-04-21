const UUID = require('uuid/v1');
const COLOR_OPTIONS = {"#ffcdd2": "red lighten-4",
                        "#f8bbd0": "pink lighten-4",
                        "#e1bee7": "purple lighten-4",
                        "#d1c4e9": "deep-purple lighten-4",
                        "#c5cae9": "indigo lighten-4",
                        "#bbdefb": "blue lighten-4",
                        "#f0f4c3": "lime lighten-4"}
const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_AS_STRINGS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

$('#event-modal').modal();
$('.dropdown-trigger').dropdown();
$('.datepicker').datepicker({
  showClearBtn: true,
});
$('.timepicker').timepicker({
  twelveHour: false,
  showClearBtn: true,
});

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
  return DAYS_OF_WEEK[date.getDate];
}

const formatFull = (date) => {
  return MONTHS_AS_STRINGS[date.getMonth()] + " " + date.getDate().toString() + ", " + date.getFullYear().toString();
}

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
      'ACCEPT': 'application/json',
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

class ViewManager {
  constructor() {
    this.date = new Date();
    this.days = [];
    this.currentlyShown = [];
    this.daysSize = 0;
    this.showingAmount = 1;
    this.init();
  }

  init() {
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
      console.log(this.currentlyShown);
    })
    .catch((err) => {
      console.log("error happened");
    })
  }

  showPrevious() {
    this.date.setDate(this.date.getDate() - 1);
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (; i < len; i++) {
      if (this.days[i].getDate() == formattedDate) {
        this.currentlyShown.pop().push(formattedDate);
        return this.days[i];
      }
    }
    this.currentlyShown.pop().push(formattedDate);
    return null;
  }

  showNext() {
    this.date.setDate(this.date.getDate() + 1);
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (; i < len; i++) {
      if (this.days[i].getDate() == formattedDate) {
        this.currentlyShown.pop().push(formattedDate);
        return this.days[i];
      }
    }
    this.currentlyShown.pop().push(formattedDate);
    return null;
  }

  removeEvent(eventId) {
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (; i < len; i++) {
      if (this.days[i].getDate() === formattedDate) {
        this.days[i].delete(eventId);
        if (this.days[i].getSize() == 0) {
          this.days[i].splice(i, 1);
          this.daysSize--;
          return true;
        }
      }
    }
    return false;
  }

  updateEvent(eventId, data) {
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (i; i < len; i++) {
      if (this.days[i].getDate() === formattedDate) {
        this.days[i].update(eventId, data);
        return true;
      }
    }
    return false;
  }

  addEvent(data) {
    let formattedDate = formatFull(this.date);
    let i = 0, len = this.daysSize;
    for (i; i < len; i++) {
      if (this.days[i].getDate() === formattedDate) {
        this.days[i].add(data);
        this.daysSize++;
        return true;
      }
    }
    this.days.push(new Day(data['start-date']));
    this.days[-1].add(data);
    this.daysSize++;
    return false;
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
    for (; i < len; i++) {
      if (this.events[i]['id'] === eventId) {
        this.events.splice(i, 1);
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
        this.events[i]['color'] = data['color'];
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


let view = new ViewManager();
console.log(view.getAllDays());
console.log(view.showPrevious());
console.log(view.getCurrentDay());

$(document).ready(function() {
});
