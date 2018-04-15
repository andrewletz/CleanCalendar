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
    edate = request.args.get("date", type=str)
    start = request.args.get("start",type=str)
    end = request.args.get("end", type=str)
    desc = request.args.get("desc", type=str)
    loc = request.args.get("loc", type=str)
    cat = request.args.get("cat", type=str)
    priority = request.args.get("priority", type=str)

    #TODO convert date and time objects

    event = Event(name, edate, start, end, desc, loc, cat, priority)
    print(event)  #TODO for debugging
    cal[name] = event
    #TODO update storage file (write the new dict to the file)

    return jsonify({"succsess": "yes"})


@app.route("/edit")  #TODO check if the event exists
def edit_event():
    old_name = request.args.get("old name", type=str)
    name = request.args.get("name", type=str)
    edate = request.args.get("date", type=str)
    start = request.args.get("start",type=str)
    end = request.args.get("end", type=str)
    desc = request.args.get("desc", type=str)
    loc = request.args.get("loc", type=str)
    cat = request.args.get("cat", type=str)
    priority = request.args.get("priority", type=str)

    event = cal.pop(old_name)
    print(event)  #TODO for debugging
    event = Event(name, edate, start, end, desc, loc, cat, priority)
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
    edate = event.get_date()
    start = event.get_start()
    end = event.get_end()
    desc= event.get_desc()
    loc = event.get_loc()
    cat = event.get_cat()
    priority = event.get_priority()

    event_dict = {"name": name, "date": edate, "start": start, "end": end, "desc": desc, "loc": loc, "cat": cat, "priority": priority}
    return jsonify(event_dict)


if __name__ == "__main__":
    app.run(port=5001, host='0.0.0.0', debug=True)
