# author(s): Kyle Nielsen
# contact: kylen@uoregon.edu
# date of creation: April 20, 2018
# last update: April 30, 2018

from datetime import date


def backup_csv(events):
    '''
        saves events to a file called 'backup-<year>-<month>-<day>.csv' where the date is the date of creation
        expects a list of dicts with keys 'start-date', 'start-time', 'end-date', 'end-time', 'name', 'description', 'color', and 'id'
        returns a status code and a message
            0 signifies success (no errors)
            1 signifies invalid input
            2 signifies something went wrong with creating or writing to the file
    '''
    MONTHS = {'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov':'11', 'Dec': '12'}


    if type(events) is not list:  # Check that event is a list
        return 1, 'expected a list'

    output = 'date\tstart time\tend time\tname\tdescription\tid\tcolor\r\n'  # The header column

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
        description = event['description']
        end_date = event['end-date']
        event_id = event['id']
        color = event['color']
		
        #format the date properly
        date_ls = start_date.replace(',', '').split(' ')
        month = date_ls[0]
        day = date_ls[1]
        year = date_ls[2]
        if len(month) == 3:  # if month was given as a 3 character name, replace it with a 2 digit number
            month = MONTHS[month]
        if (int(day) < 10) and (len(day) < 2):  # if single digit days don't already start with zeros, insert a zero at the front
            day = '0' + day
        formatted_date = '{}/{}/{}'.format(day, month, year)  # join the date components into proper format
        

        output = '{}{}\t{}\t{}\t{}\t{}\t{}\t{}\r\n'.format(output, formatted_date, start_time, end_time, name, description, event_id, color)  # Generate the string to be written to the file

    filename = 'backup-{}.csv'.format(date.today().isoformat())  # Generate the filename from today's date
    try:  # Attempt to write the file
        f = open(filename, 'w')
        f.write(output)
        f.close()
    except:  # If writing fails, error
        return 2, 'Something went wrong with file creation or writing'

    return 0, 'success'
