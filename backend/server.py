# author(s): Kyle Nielsen, Keir Armstrong
# contact: kylen@uoregon.edu, karmstr7@uoregon.edu
# date of creation: April 11, 2018
# last update: April 29, 2018


#TODO comments and/or descriptiion, check comments for input < 144
#TODO return error if data.json file doesn't exist (or create a new file) (test that this is necessary)
#TODO disable debug mode in the final product


from flask import Flask, jsonify, abort, make_response, request
import json
from backup import backup_csv

app = Flask(__name__)

try:  # attempt unicode
    to_unicde = unicode
except NameError:  # If unicode is unavailable, default to standard string
    to_unicde = str

with open('data.json', 'r') as data_file:  # Open the database file for reading
    data_loaded = json.load(data_file)

events = data_loaded['events']  # Create a list of events from the data in the file

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
    event_id = event_id.replace("%20", " ")  # get the id, replacing %20 (equivalent of a space in URLs) with a space
    print(event_id)
    event = [events for event in events if event['id'] == event_id]  # Generate a list of all events (which is just one) that have the given id
    if len(event) == 0:  # if no event found, HTTP status 404
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
    start_date = start_date.replace("%20", " ")  # Get start date, raplacing for spaces as necessary
    events_found = [event for event in events if event['start-date'] == start_date]  # Generate a list of all events with the given start date
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
    if not request.json:  # If there is no json object with the request, raise status 400
        abort(400)
    event = {  # Get all event attributes from the request json
        'id': request.json['id'],
        'name': request.json['name'],
        'description': request.json['description'],
        'start-date': request.json['start-date'],
        'end-date': request.json['end-date'],
        'start-time': request.json['start-time'],
        'end-time': request.json['end-time'],
        'color': request.json['color'] 
    }
    events.append(event)  # Add the new event to the events list
    update_datafile()  # Update the database file
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
    event = [event for event in events if event['id'] == event_id]  # Create list containing the event with the given id
    if len(event) == 0:  # If no such event, raise status 404
        abort(404)
    if not request.json:  # If no json object in the request, raise status 400
        abort(400)

    # Replace the old data in the event with the new data
    event[0]['id'] = request.json.get('id', event[0]['id'])
    event[0]['name'] = request.json.get('name', event[0]['name'])
    event[0]['start-date'] = request.json.get('start-date', event[0]['start-date'])
    event[0]['end-date'] = request.json.get('end-date', event[0]['end-date'])
    event[0]['start-time'] = request.json.get('start-time', event[0]['start-time'])
    event[0]['end-time'] = request.json.get('end-time', event[0]['end-time'])
    event[0]['color'] = request.json.get('color', event[0]['color'])
    event[0]['description'] = request.json.get('description', event[0]['description'])
    update_datafile()  # Update database file
    return jsonify({'event': event[0]})


@app.route('/calendar/api/events/<string:event_id>', methods=['DELETE'])
def delete_event(event_id):
    '''
    removes an event from the database based on id
    status 404 if the event doesn't exist
    returns a json object of the form {'result': True} if successful
    '''
    print("DELETING EVENT")
    event = [event for event in events if event['id'] == event_id]  # Create list containing the event with the given id
    if len(event) == 0:  # If no event found, raise status 404
        abort(404)
    events.remove(event[0])  # Remove the event from the list
    update_datafile()  # update the database
    return jsonify({'result': True})


def update_datafile():
    '''
    writes the events list to the database file (data.json)
    writes a list of valid events with the key 'events'
    '''
    with open('data.json', 'w') as f:  # Open the file with write permissions
        formatted_events = {'events': events}  # Create a json object by assigning the key "events" to the events list
        json.dump(formatted_events, f)  # Write to the file
    print(events)


@app.route('/calendar/backup', methods=['GET'])
def backup_calendar():
    '''
    calls a function to write the events to a csv file for backup
    details in backup.py
    responds with status 404 if there are no events, 500 if something else goes wrong
    '''
    if not events:  # if events list is empty, raise status 404
        abort(404)

    try:  # Attempt backup
        status, message = backup_csv(events)
        return jsonify({'status': status, 'message': message})
    except:  # If backup failed, raise status 500
        abort(500)


if __name__ == "__main__":
    app.run(debug=True)

###############################################################
# ATTRIBUTIONS
# https://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask
#
################################################################
