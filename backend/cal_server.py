# Credit:  #TODO credits if any
#BUG only one event with the same name can exist at a time. Possible fix: index by unique id, rather than name.


import flask
import event

from flask import request, jsonify
from datetime import date, time, datetime
from event import Event


app = flask.Flask(__name__)
app.secret_key = "Something Secure"  #TODO use something actually secure

cal = {}  # The calendar, a dict of the form {name: Event}


@app.route("/new")
def new_event():
    name = request.args.get("name", type=str)
    start_date = request.args.get("start date", type=str)
    end_date = request.args.get("end date", type=str)
    start_time = request.args.get("start time",type=str)
    end_time = request.args.get("end time", type=str)
    #desc = request.args.get("desc", type=str)
    #loc = request.args.get("loc", type=str)
    #cat = request.args.get("cat", type=str)
    #priority = request.args.get("priority", type=str)

    #TODO convert date and time objects

    event = Event(name, start_date, end_date, start_time, end_time)  #, desc, loc, cat, priority)
    print(event)  #TODO for debugging
    cal[name] = event
    #TODO update storage file (write the new dict to the file)

    return jsonify({"succsess": "yes"})


@app.route("/edit")  #TODO check if the event exists
def edit_event():
    old_name = request.args.get("old name", type=str)
    name = request.args.get("name", type=str)
    start_date = request.args.get("start date", type=str)
    end_date = request.args.get("end date", type=str)
    start_time = request.args.get("start time",type=str)
    end_time = request.args.get("end time", type=str)
    #desc = request.args.get("desc", type=str)
    #loc = request.args.get("loc", type=str)
    #cat = request.args.get("cat", type=str)
    #priority = request.args.get("priority", type=str)

    event = cal.pop(old_name)
    print(event)  #TODO for debugging
    event = Event(name, start_date, end_date, start_time, end_time)  #, desc, loc, cat, priority)
    print(event)  #TODO for debugging
    cal[name] = event
    #TODO update storage file

    return jsonify({"success": "yes"})


@app.route("/delete")
def del_event():
    name = request.args.get("name", type=str)
    event = cal.pop(name)
    print(event)  #TODO for debugging
    #TODO update storage file

    return jsonify({'success': 'yes'})


@app.route("/view")
def view_event():
    name = request.args.get("name", type=str)
    event = cal[name]
    print(event)  #TODO for debugging
    start_date = event.get_start_date()
    end_date = event.get_end_date()
    start_time = event.get_start_time()
    end_time = event.get_end_time()
    #desc = event.get_desc()
    #loc = event.get_loc()
    #cat = event.get_cat()
    #priority = event.get_priority()

    event_dict = {"name": name, "start date": start_date, "end date": end_date, "start time": start_time, "end time": end_time}  #, "desc": desc, "loc": loc, "cat": cat, "priority": priority}
    return jsonify(event_dict)


if __name__ == "__main__":
    #TODO load storage file into dict
    app.run(port=5001, host='0.0.0.0', debug=True)
