from datetime import date, time, datetime


class Event:
    def __init__(self, name = None, edate = date(2000, 1, 1), start = time(0, 0), end = time(0, 0), desc = None, loc = None, cat = None, priority = "medium"):  # Using edate as event date to prevent conflict with the imported datetime.date
        '''
        input: name is a string; edate is the event date as a datetime.date object; start and end are start and end times as datetime.time objects; desc is description as string; loc is location as string; cat is category as string; priority is string.
        creates and Event object with the specified attributes. 
        '''
        self.name = None  #TODO make default date and time objects for edate, start, end
        self.edate = date(2000, 1, 1)
        self.start = time(0, 0)
        self.end = time(0, 0)
        self.desc = None
        self.loc = None
        self.cat = None
        self.priority = None

        self.set_name(name)
        self.set_date(edate)
        self.set_start(start)
        self.set_end(end)
        self.set_desc(desc)
        self.set_loc(loc)
        self.set_cat(cat)
        self.set_priority(priority)

        self.start_datetime = datetime.combine(self.edate, self.start)  # For sorting events based on when they start


    def get_name(self):
        return self.name

    def get_date(self):
        return self.edate

    def get_start(self):
        return self.start

    def get_end(self):
        return self.end

    def get_desc(self):
        return self.desc

    def get_loc(self):
        return self.loc

    def get_cat(self):
        return self.cat

    def get_priority(self):
        return self.priority

    def get_start_datetime(self):
        return self.start_datetime


    def set_name(self, name):  #TODO Validate input for each setter. Format: worked, message. True, "worked" if no problems
        self.name = name

    def set_date(self, edate):
        self.edate = edate
        self.start_datetime = datetime.combine(self.edate, self.start)  # recalculate start_datetime if date or start changes

    def set_start(self, start):
        self.start = start
        self.start_datetime = datetime.combine(self.edate, self.start)

    def set_end(self, end):
        self.end = end

    def set_desc(self, desc):
        self.desc = desc

    def set_loc(self, loc):
        self.loc = loc

    def set_cat(self, cat):
        self.cat = cat

    def set_priority(self, priority):
        self.priority = priority


    def __repr__(self):
        return "Name: {}, Date: {}, Start time: {}, End time: {}, Description: {}, Location: {}, Category: {}, Priority: {}".format(self.name, self.edate.strftime("%d/%m/%Y"), self.start.strftime("%I:%M%p"), self.end.strftime("%I:%M%p"), self.desc, self.loc, self.cat, self.priority)


    # Below are the methods for sorting and comparing Event objects
    def __lt__(self, other):  #TODO check that "other" is an Event in the comparison functions
        return self.start_datetime < other.get_start_datetime()

    def __le__(self, other):
        return self.start_datetime <= other.get_start_datetime()

    def __eq__(self, other):
        return self.start_datetime == other.get_start_datetime()

    def __ne__(self, other):
        return self.start_datetime != other.get_start_datetime()

    def __ge__(self, other):
        return self.start_datetime >= other.get_start_datetime()

    def __gt__(self, other):
        return self.start_datetime > other.get_start_datetime()










