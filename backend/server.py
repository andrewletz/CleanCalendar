# author(s): Kyle Nielsen, Keir Armstrong
# contact: kylen@uoregon.edu, karmstr7@uoregon.edu
# date of creation: April 11, 2018
# last update: April 26, 2018


#TODO comments and/or descriptiion, check comments for input < 144
#TODO return error if data.json file doesn't exist (or create a new file) (test that this is necessary)


from flask import Flask, jsonify, abort, make_response, request
import json
from backup import backup_csv

app = Flask(__name__)

try:
    to_unicde = unicode
except NameError:
    to_unicde = str

with open('data.json', 'r') as data_file:
    data_loaded = json.load(data_file)

events = data_loaded['events']  # a list of valid events

# a valid event is a dict of the form {'id':value, 'name': value, 'start-date': value, 'end-date': value, 'start-time': value, 'end-time': value, 'color': value}  #TODO update when comment/description are added
#   all values should be strings
#   dates should be strings of the form 'DD/MM/YYYY'
#   times should be strings of the form 'hh:mm'
#   there should only be one event per id (i.e. ids are unique)


# flask error hendlers
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not Found'}), 404)


@app.errorhandler(400)
def format_error(error):
    return make_response(jsonify({'error': 'Not valid JSON format'}, 400))


@app.errorhandler(500)
def server_error(error):
    return make_response(jsonify({'error': 'Server-side error, probably issue with backup'}, 500))


#functions to be called for specific URLs (host:port/route)
@app.route('/calendar/api/events', methods=['GET'])
def get_events():
    '''
    returns a json object containing a list of valid events indexed by the key 'events'
    '''
    print("GETTING ALL EVENTS")
    return jsonify({'events': events})


@app.route('/calendar/api/events/id/<string:event_id>', methods=['GET'])
def get_event_by_id(event_id):
    '''
    retrieves the valid event whose id == event_id
    if successful, returns a json object containing the event indexed by the key 'event'
    responds with status 404 if no such event is found
    '''
    print("GETTING EVENT BY ID")
    event_id = event_id.replace("%20", " ")
    print(event_id)
    event = [events for event in events if event['id'] == event_id]
    if len(event) == 0:
        abort(404)
    return jsonify({'event': event[0]})


@app.route('/calendar/api/events/<string:start_date>', methods=['GET'])
def get_event_by_date(start_date):
    '''
    retrieves all events that have the given start date
    if successfull, returns a json object containing the matching events indexed by the key 'events'
    the list will be empty if no matching events were found
    '''
    print("GETTING EVENT BY DATE")
    start_date = start_date.replace("%20", " ")
    events_found = [event for event in events if event['start-date'] == start_date]
    return jsonify({'events': events_found})


@app.route('/calendar/api/events/create', methods=['POST'])
def create_event():
    '''
    adds a new event to the database
    expects a json request containing a valid event
    returns a json object with the new event with the key 'event'
    status 400 if the request is not json
    '''
    print("CREATING EVENT")
    if not request.json:
        abort(400)
    event = {
        'id': request.json['id'],
        'name': request.json['name'],
        'start-date': request.json['start-date'],
        'end-date': request.json['end-date'],
        'start-time': request.json['start-time'],
        'end-time': request.json['end-time'],
        'color': request.json['color'] 
    }
    events.append(event)
    update_datafile()
    return jsonify({'event': event}), 201


@app.route('/calendar/api/events/<string:event_id>', methods=['PUT'])
def update_event(event_id):
    '''
    changes the data for an existing event based of id
    expects a json request containing a valid event
    returns a json oject of the event with the key 'event'
    status 404 if the event to be updated doesn't exist, 400 if the request isn't json
    '''
    print("UPDATING EVENT")
    event = [event for event in events if event['id'] == event_id]
    if len(event) == 0:
        abort(404)
    if not request.json:
        abort(400)
    event[0]['id'] = request.json.get('name', event[0]['id'])
    event[0]['name'] = request.json.get('name', event[0]['name'])
    event[0]['start-date'] = request.json.get('start-date', event[0]['start-date'])
    event[0]['end-date'] = request.json.get('end-date', event[0]['end-date'])
    event[0]['start-time'] = request.json.get('start-time', event[0]['start-time'])
    event[0]['end-time'] = request.json.get('start-time', event[0]['start-time'])
    event[0]['color'] = request.json.get('color', event[0]['color'])
    update_datafile()
    return jsonify({'event': event[0]})


@app.route('/calendar/api/events/<string:event_id>', methods=['DELETE'])
def delete_event(event_id):
    '''
    removes an event from the database based on id
    status 404 if the event doesn't exist
    returns a json object of the form {'result': True} if successful
    '''
    print("DELETING EVENT")
    event = [event for event in events if event['id'] == event_id]
    if len(event) == 0:
        abort(404)
    events.remove(event[0])
    update_datafile()
    return jsonify({'result': True})


def update_datafile():
    '''
    writes the events list to the database file (data.json)
    writes a list of valid events with the key 'events'
    '''
    with open('data.json', 'w') as f:
        formatted_events = {'events': events}
        json.dump(formatted_events, f)
    print(events)


@app.route('/calendar/backup', methods=['GET'])
def backup_calendar():
    '''
    calls a function to write the events to a csv file for backup
    details in backup.py
    responds with status 404 if there are no events, 500 if something else goes wrong
    '''
    if not events:  # if events list is empty
        abort(404)

    try:
        status, message = backup_csv(events)
        return jsonify({'status': status, 'message': message})
    except:
        abort(500)


if __name__ == "__main__":
    app.run(debug=True)

###############################################################
# ATTRIBUTIONS
# https://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask
#
################################################################
