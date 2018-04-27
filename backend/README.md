## Use

### Installing requirements

Have python 3.6.5 (or higher) and the accompanying pip installed on your computer  
If you have Windows or MacOS, visit python.org and go to the downloads section. During isntallation, select the option to add python to your PATH  
If you have linux, install the python3 and python3-pip packages (`sudo apt-get install python3 python3-pip` on Ubuntu)

Run `sudo pip install -r requirements.txt` from a terminal in the backend folder to install the pip requirements

### Running

Run `python3 cal_server.py` from a terminal in the backend folder to start the server. The server should now be running. If you are using Clean Calendar, you can stop here.

### Using the server

send an http request to:  
`127.0.0.1:5000/calendar/api/events` using HTTP method GET to view all events in json format  
`127.0.0.1:5000/calendar/api/events/id/<id>` using HTTP method GET to view the event with the corresponding id  
`127.0.0.1:5000/calendar/api/events/<start-date>` using HTTP method GET to view all events with the given start date  
`127.0.0.1:5000/calendar/api/events/create` using HTTP method POST to create a new event  
`127.0.0.1:5000/calendar/api/events/<id>` using HTTP method PUT to update an existing event  
`127.0.0.1:5000/calendar/api/events/<id>` using HTTP method DELETE to delete an existing event  
`127.0.0.1:5000/calendar/backup` using HTTP method GET to backup the calendar to a csv file  

The pages for creating and updating events expect a json request with the following keys:
 * id - a string, event's id should be unique
 * name - a string
 * start-date - a string of the form DD/MM/YYYY
 * end-date - a string of the form DD/MM/YYYY
 * start-time - a string of the form hh:mm
 * end-time - a string of the form hh:mm
 * ~~desc - description, a string~~
 * ~~loc - location, a string~~
 * ~~cat - category, a string~~
 * ~~priority - a string~~  
The pages will respond with status 400 if no json object is provided

The pages for backup and viewing and deleting events only require the URL


responses:
 * create and update respond with a json object containing
 * view responds with a json object containing the event(s) requested. A json object containing a list of events for view all or by date. A json object containing the event for view by id
 * delete responds with a json object indicating success
 * backup responds with a json object containing a status code (not an HTTP status code) and a message


## More Technical

The term 'valid event' for this readme refers to a dictionary/json of the form {'id':value, 'name': value, 'start-date': value, 'end-date': value, 'start-time': value, 'end-time': value, 'color': value}
 * all values should be strings
 * dates should be strings of the form 'DD/MM/YYYY'
 * times should be strings of the form 'hh:mm'
 * there should only be one event per id (i.e. ids are unique)

Create and update expect a json request containing a valid event, and they respond with json of the form `{'event': the_event}` where `the_event` is a valid event containing the new event info.  
HTTP status 400 if there is no json request
Update responds with HTTP status 404 if there is no event with the given id

view by id responds with json of the form `{'event': the_event}` where the_event is the valid event with the requested id  
HTTP status 404 if no such event exists.

view all and view by start date respond with json of the form `{'events': [event1, event2, ...]}` where all events are valid events (i.e. json with a list of valid events).  
HTTP status 404 if no such event exists

backup responds with json of the form  `{'status': status, 'message': message}` where status is 0 for no errors, 1 for invalid input (something wrong with the events list in the server), or 2 for file creation/writing error. The message is a string describing the error, or 'success' if no errors. The backup function calls a function from backup.py

For using backup.py on its own:  
`import backup` in a python file  
call backup_csv(events) to create a csv file of all the events. Expects `events` to be a list of valid events.  
Returns same status, message as above.

The backup file:  
* Name: `backup-<yyyy>-<mm>-<dd>.csv` where the date is the date of creation.  
* The first line contains column headers. Each subsequent line contains the data for a single event.  
* lines take the form: `<start-date>\t<start-time>\t<end-time>\t<name>\t<end-date>\t<id>\t<color>`
