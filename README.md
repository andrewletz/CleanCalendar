# User's Guide

## Introduction
CleanCalendar is a calendar that will organize your tasks clearer and in a managing order. The calendar allows users to create, edit and delete events with descriptions. The calendar has clear day and week view for users to check events.

It was developed by a team of four students studying at the University of Oregon as part of their Spring Term CIS 422 Software Methodology class assignments. The team aimed to create an application that is robust and intuitive to use.

## System Requirements
CleanCalendar was mostly developed in the Windows environment, so the software is optimized under the Windows environment.
The software was not tested extensively in other mainstream operating systems, so do expect some imperfections in the program if you must use the software in a non-Windows environment. 

## Launching the Application
###### Skip this section if you are attempting to compile the software from the source files (Professor and GTF use this section)
          
          1. Start the server
             project > server > server.exe
             
          2. Start the client
             project > client > CleanCalendar-win32-ia32 > CleanCalendar.exe
             
          3. Start using the client!
          
###### To compile the software from source
          
          1. Build and start the server
             i.   Clone the 'backend' directory and its content
             ii.  Install Python3 (v3.6.5) if don't have already
             iii. Install Flask (v1.0.1) and PyInstaller (v3.3.1) 
             iv.  In the terminal at location 'backend', type
                    pyinstaller -F server.py
              v.  The executable can be found in 'backend > dist' named 'server.exe' 
             vi.  Copy the data.json file from 'backend' to the folder 'server.exe' exists, server will crash without data.json
          
          2. Build and start the client
             i.   Clone the 'frontend' directory and its content
             ii.  Install Node.js (v8.11.1) if don't have already
             iii. In the terminal at location 'frontend', type
                    npm install
                    npm run build-win
              v.  After build is completed, find CleanCalendar.exe inside 'frontend > release-build > CleanCalendar-win32-ia32 > CleanCalendar.exe'
          3. Start using the client!
          
## Create New Event
Create a new event by clicking on a time slot and provide the Name, Description, Start Date, Start Time, and End Time of the event. Then click 'Create'.

## Edit Existing Event
Make changes to an event by clicking on the appropriate time slot and provide the updated Name, Description, Start Date, Start Time, and End Time of the event. Then click 'Save'.

## Delete an Event
Delete an event you no longer want to commit to by clicking on the appropriate time slot and click 'Delete'.

## Day View Mode
In day view mode, only one day is shown at any moment. Click 'Day' in the dropdown menu at the top-right of the program to change to day view mode.

## Week View Mode
In week view mode, seven days are shown at once, always in the format SUN-MON-TUE-WED-THU-FRI-SAT. Click 'Week' in the dropdown menu at the top-right of the program to change to week view mode.

## File Backup
Want to load all of the events into a CSV format file? We got you covered. In any view mode, click the file download button to generate a CSV file. The file is in 'project1 > server >' or 'CleanCalendar > backend >'.

## Previous and Next Navigation
To navigate between days and weeks, use the left/right arrow buttons!
