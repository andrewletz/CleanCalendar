## Use

### Installing requirements

Have python3 and python3-pip installed on your computer

run `sudo pip3 install -r requirements.txt` to install the pip requirements

### Running

enter `python3 cal_server.py` from a terminal

### Using the server

send an http request to 0.0.0.0:5001/new, /edit, /delete, or /view

each page expects the following args in the request:  
/new  
	* name - a string
	* date - a string of the form DD/MM/YYYY
	* start - a string of the form hh:mm
	* end - a string of the form hh:mm
	* desc - description, a string
	* loc - location, a string
	* cat - category, a string
	* priority - a string  
/edit  
	* all the same args as /new. These args should be the values you want the event to have, not the values it already has
	* old name - a string, the old event name to use for lookup  
/delete  
	* name - a string  
/view  
	* name - the name of the event to view, a string

responses:  
	* /new, /edit, and /delete respond with json {"success": "yes"}. This will probably be changed to respond with an appropriate message if there was a failure (invalid input, missing an arg, etc)
	* /view responds with a json {"name": name, "date": date, "start": start, "end": end, "desc": desc, "loc": loc, "cat": cat, "priority": priority}

An example request to create a new event. This example works in a web browser.  
`http://0.0.0.0:5001/new?name=test&date=01/02/2001&start=5:30&end=6:00&desc=a test&loc=home&cat=home&priority=low`  
the '?' indicates the start of the http args  
'&' indicates another arg
Note that the space in `desc=a test` is allowed.  
