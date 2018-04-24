# author(s): Kyle Nielsen
# contact: kylen@uoregon.edu
# date of creation: April 20, 2018
# last update: April 24, 2018 #TODO
# credit: #TODO give credit, if any

#TODO update README


from datetime import date



def backup_csv(events):
    '''
        saves events to a file called 'backup-<year>-<month>-<day>.csv' where the date is the date of creation
        expects a list of dicts with keys 'start-date', 'start-time', 'end-date', 'end-time', 'name', 'color', and 'id'
        returns a status code and a message
            0 signifies success (no errors)
            1 signifies invalid inout
            2 signifies something when wrong with creating or writing to the file
    '''

    if type(events) is not list:
        return 1, 'expected a list'

    output = 'start date\tstart time\tend time\tname\tend date\tid\tcolor\r\n'
    for event in events:
        if type(event) is not dict:
            return 1, 'expected only dicts in the list'

        if not (event['start-date'] and event['start-time'] and event['end-time'] and event['name'] and event['end-time'] and event['id']):
            return 1, "one or more events missing one or more expected keys ('start-date', 'start-time', 'end-date', 'end-time', 'name', color, 'id')"

        start_date = event['start-date']
        start_time = event['start-time']
        end_time = event['end-time']
        name = event['name']
        end_date = event['end-date']
        event_id = event['id']
        color = event['color']

        output = '{}{}\t{}\t{}\t{}\t{}\t{}\t{}\r\n'.format(output, start_date, start_time, end_time, name, end_date, event_id, color)

    filename = 'backup-{}.csv'.format(date.today().isoformat())
    try:
        #TODO write output to file filename
        f = open(filename, 'w')
        f.write(output)
        f.close()
    except:
        return 2, 'Something went wrong with file creation or writing'

    return 0, 'success'
