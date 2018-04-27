# author(s): Kyle Nielsen
# contact: kylen@uoregon.edu
# date of creation: April 20, 2018
# last update: April 26, 2018

#TODO comments/description

from datetime import date


def backup_csv(events):
    '''
        saves events to a file called 'backup-<year>-<month>-<day>.csv' where the date is the date of creation
        expects a list of dicts with keys 'start-date', 'start-time', 'end-date', 'end-time', 'name', 'color', and 'id'
        returns a status code and a message
            0 signifies success (no errors)
            1 signifies invalid input
            2 signifies something went wrong with creating or writing to the file
    '''

    if type(events) is not list:  # Check that event is a list
        return 1, 'expected a list'

    output = 'start date\tstart time\tend time\tname\tend date\tid\tcolor\r\n'  # The header column

    for event in events:  # Check that all elements of events are dicts
        if type(event) is not dict:
            return 1, 'expected only dicts in the list'

        if not (event['start-date'] and event['start-time'] and event['end-time'] and event['name'] and event['end-date'] and event['id'] and event['color']):  # Check for all expected keys
            return 1, "one or more events missing one or more expected keys ('start-date', 'start-time', 'end-date', 'end-time', 'name', color, 'id')"

        # Assign values to variables
        start_date = event['start-date']
        start_time = event['start-time']
        end_time = event['end-time']
        name = event['name']
        end_date = event['end-date']
        event_id = event['id']
        color = event['color']

        output = '{}{}\t{}\t{}\t{}\t{}\t{}\t{}\r\n'.format(output, start_date, start_time, end_time, name, end_date, event_id, color)  # Generate the string to be written to the file

    filename = 'backup-{}.csv'.format(date.today().isoformat())  # Generate the filename from today's date
    try:  # Attempt to write the file
        f = open(filename, 'w')
        f.write(output)
        f.close()
    except:  # If writing fails, error
        return 2, 'Something went wrong with file creation or writing'

    return 0, 'success'
