"""
Tiny demo of Ajax interaction
"""

import flask
import logging
#import config


###
# Globals
###
app = flask.Flask(__name__)
#CONFIG = config.configuration()
app.secret_key = "something secure"


###
# Pages
###

@app.route("/")  # call this function when 'localhost:<port>/' is requested
def index():
    return flask.render_template('minijax.html')

###############
# AJAX request handlers
#   These return JSON to the JavaScript function on
#   an existing page, rather than rendering a new page.
###############


@app.route("/_countem")
def countem():
    text = flask.request.args.get("text", type=str)  # Get the item labelled "text" in the dict sent with the request
    length = len(text)
    rslt = {"long_enough": length >= 5}  # Create a dict to send with the response
    return flask.jsonify(result=rslt)  # Send a response in json format, label the data "result"

#############


if __name__ == "__main__":
    # Standalone (not running under green unicorn or similar)
    app.debug = True  # Only for developement. The server updates when this file is saved, rather than needing to restart the program
    app.logger.setLevel(logging.DEBUG)
    app.logger.info("Opening for global access on port {}".format(5000))
    app.run(port=5000, host="0.0.0.0")
