import flask
import event


app = flask.Flask(__name__)
app.secret_key = "Something Secure"  #TODO use something actually secure
app.port = 5001
app.host = "0.0.0.0"
app.debug - True

cal = {}  # The calendar, a dict of the form {date: Event}
args = flask.request.args.get  # an alias that's easier to type


@app.route("/new")
def new_event():
    name = args("name", type=str)
    edate = args("date", type=str)
    start = args("start",type=str)
    end = args("end", type=str)
    desc = args("desc", type=str)
    loc = args("loc", type=str)
    cat = args("cat", type=str)
    priority = args("priority", type=str)

    event = Event(name, edate, start, end, desc, loc, cat, priority)
    cal[name] = event
    #TODO add event to storage file

    return flask.jsonify(result={"succsess": "yes"})


@app.route("/edit")
def edit_event():
    old_name = args("old name", type=str)
    name = args("name", type=str)
    edate = args("date", type=str)
    start = args("start",type=str)
    end = args("end", type=str)
    desc = args("desc", type=str)
    loc = args("loc", type=str)
    cat = args("cat", type=str)
    priority = args("priority", type=str)

    event = cal.pop(old_name)
    #TODO remove event from storage file
    event = Event(name, edate, start, end, desc, loc, cat, priority)
    cal[name] = event
    #TODO add event to storage file

    return flask.jsonify(result={"success": "yes"})


@app.route("/delete")
def del_event():
    name = args("name", type=str)
    event = cal.pop(name)
    #TODO remove from storage file


@app.route("/view")
def view_event();
    name = args("name", type=str)
    event = cal[name]
    edate = event.get_date()
    start = event.get_start()
    end = event.get_end()
    desc= event.get_desc()
    loc = event.get_loc()
    cat = event.get_cat()
    priority = event.get_priotity()

    event_dict = {"name": name, "date": edate, "start": start, "end": end, "desc": desc, "loc": loc, "cat": cat, "priority": priority)
    return flask.jsonify(result=event_dict)


if __name__ == "__main__":
    app.run()
