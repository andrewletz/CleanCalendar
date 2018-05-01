# User's Guide

## Introduction
CleanCalendar is a calendar that will organize your tasks clearer and in a managing order. The calendar allows users to create, edit and delete events with descriptions. The calendar has clear day and week view for users to check events.

It was developed by a team of four students studying at the University of Oregon as part of their Spring Term CIS 422 Software Methodology class assignments. The team aimed to create an application that is robust and intuitive to use.

## System Requirements
CleanCalendar was mostly developed in the Windows environment, so the software is optimized under the Windows environment.
The software was not tested extensively in other mainstream operating systems, so do expect some imperfections in the program if you must use the software in a non-Windows environment. 

## Launching the Application
###### For Users (Professor and GTF use this section)

          Unzip the folder named ‘project1’ containing the executable programs
          Open <project1/server/server.exe> to start the server
          Open <project1/client/CleanCalendar-win32-ia32/CleanCalendar.exe> to start the client.

          
###### For Developers (Installing the software from source files)
          1. Obtain the source code by cloning the repository from https://github.com/andrewletz/CleanCalendar
          2. Install Python 3.6.5 (or higher) and the accompanying pip. Make sure to select the option to add Python PATH environment variable during installation.
          3. Under <CleanCalendar/backend>, 
          4. Run sudo pip install -r requirements.txt from a terminal
          5. Run python server.py or python3 server.py to start the server
          6. In <CleanCalendar/frontend>,
          7. Install node js via https://nodejs.org/en/
          8. Install electron from a terminal using npm install -g electron
          9. Install dependencies from a terminal using npm install
          10. Run npm start to start the program

###### How to Compile Executable files
##### Building the server
          1. Clone the 'backend' directory
          2. Install Python3 (v3.6.5) or higher if not installed
          3. Install Flask (v1.0.1) and PyInstaller (v3.3.1)
          4. In the terminal at location 'backend', type
                    pyinstaller -F server.py
          5. The executable can be found in <backend/dist> named 'server.exe'
          6. Copy the data.json file from 'backend' to the folder where 'server.exe' exists, the server will not function without a data.json to store the schedule to

##### Building the client
          1. Clone the 'frontend' directory and its content
          2. Install Node.js (v8.11.1) if not installed
          3. In the terminal at location 'frontend', type
                    npm install
                    npm run build-win
          4. After build is completed, find CleanCalendar.exe inside <frontend/release-build/ CleanCalendar-win32-ia32>
          5. Start using the client by running the executable (remember it will not save data without the server running prior)
          
###### Software Dependencies
If you had issues using the previous instructions, you may want to install the libraries on your own. Here is a compiled list of dependencies:
          Python3 (v3.6.5)
          Flask (v1.0.1) 
          PyInstaller (v3.3.1)
          Node.js (v8.11.1)
          NPM jQuery (v3.3.1)
          NPM UUID (v3.2.1)
          NPM Electron (1.8.4)
          NPM Electron-Packager (v12.0.1)

          
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
