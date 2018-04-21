# author(s): Kyle Nielsen, Keir Armstrong
# contact: ??, karmstr7@uoregon.edu
# date of creation: April 11, 2018
# last update: April 20, 2018

from flask import Flask, jsonify, abort, make_response, request
import json

app = Flask(__name__)

try:
    to_unicde = unicode
except NameError:
    to_unicde = str

with open('data.json', 'r') as data_file:
    data_loaded = json.load(data_file)

events = data_loaded['events']


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not Found'}), 404)


@app.errorhandler(400)
def format_error(error):
    return make_response(jsonify({'error': 'Not valid JSON format'}, 400))


@app.route('/calendar/api/events', methods=['GET'])
def get_events():
    print("GETTING ALL EVENTS")
    return jsonify({'events': events})


@app.route('/calendar/api/events/id/<string:event_id>', methods=['GET'])
def get_event_by_id(event_id):
    print("GETTING EVENT BY ID")
    event_id = event_id.replace("%20", " ")
    print(event_id)
    event = [events for event in events if event['id'] == event_id]
    if len(event) == 0:
        abort(404)
    return jsonify({'event': event[0]})


@app.route('/calendar/api/events/<string:start_date>', methods=['GET'])
def get_event_by_date(start_date):
    print("GETTING EVENT BY DATE")
    start_date = start_date.replace("%20", " ")
    events_found = [event for event in events if event['start-date'] == start_date]
    return jsonify({'events': events_found})


@app.route('/calendar/api/events/create', methods=['POST'])
def create_event():
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
    print("DELETING EVENT")
    event = [event for event in events if event['id'] == event_id]
    if len(event) == 0:
        abort(404)
    events.remove(event[0])
    update_datafile()
    return jsonify({'result': True})


def update_datafile():
    with open('data.json', 'w') as f:
        formatted_events = {'events': events}
        json.dump(formatted_events, f)
    print(events)


if __name__ == "__main__":
    app.run(debug=True)

###############################################################
# ATTRIBUTIONS
# https://blog.miguelgrinberg.com/post/designing-a-restful-api-with-python-and-flask
#
################################################################
