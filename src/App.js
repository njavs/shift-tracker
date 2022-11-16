import React, { useState, useEffect } from 'react';

import { Button } from '@mui/material';

import './App.css';

import { ShiftsTable } from './ShiftsTable';
import { SetShiftModal } from './SetShiftModal';


function App() {
  const [nursesList, setNursesList] = useState([]);
  const [shiftsList, setShiftsList] = useState([]);

  // Modal open/close state hooks
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [justSaved, setJustSaved] = React.useState(false);

  // Get request to fetch nurses list
  const fetchNurses = async () => {
    const response = await fetch('/nurses');
    const respText = await response.text();
    if (response.status !== 200) throw Error(respText.message);

    return respText;
  };

  // Get request to fetch shifts list
  const fetchShifts = async () => {
    const response = await fetch('/shifts');
    const respText = await response.text();
    if (response.status !== 200) throw Error(respText.message);

    return respText;
  };

  // Put request to assign a nurse ID to a specific shift
  const saveShiftAssignment = async (shiftId, nurseID) => {
    setJustSaved(true);
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: nurseID
    };

    fetch('http://localhost:9001/shifts/' + shiftId + '/' + nurseID, requestOptions)
      .then(res => {
        if (res.status !== 200) {
          console.log("error")
        } else {
          res.json().then(data => {
            // console.log(data);
            fetchShifts().then(() => {
              console.log("saveShiftAssignment: Successfully saved")
            });
          })
        }
      });
  };

  // Fetch all data as soon as the app renders for the first time
  useEffect(() => {
    fetchNurses()
      .then(res => {
        // Need to parse because response is a string literal containing an array of objects
        const nurses = JSON.parse(res);
        setNursesList(nurses);

        console.log("Successfully fetched nurses in useEffect");

      }).catch(err => {
        console.log(err);
        console.log("Failed to fetch nurses in useEffect");
      });

    fetchShifts()
      .then(res => {
        // Need to parse because response is a string literal containing an array of objects
        const shifts = JSON.parse(res);
        setShiftsList(shifts);

        console.log("Successfully fetched shifts in useEffect");

      }).catch(err => {
        console.log(err);
        console.log("Failed to fetch shifts in useEffect");
      });
  }, []);

  // Update table when user hits Save Assignment
  useEffect(() => {
    setJustSaved(false);

    fetchNurses()
      .then(res => {
        const nurses = JSON.parse(res);
        setNursesList(nurses);

      }).catch(err => {
        console.log(err);
      });

    fetchShifts()
      .then(res => {
        const shifts = JSON.parse(res);
        setShiftsList(shifts);

      }).catch(err => {
        console.log(err);
      });

  }, [justSaved])

  return (
    <div className="App">
      <h1> Shift Tracker </h1>

      <div className="set-shift-asgnmt-btn">
        <Button onClick={handleOpen} variant="contained">Set Shift Assignment</Button>
      </div>

      <SetShiftModal isOpen={open}
        handleOpen={handleOpen}
        handleClose={handleClose}
        shiftsData={shiftsList}
        nursesData={nursesList}
        saveShiftAssignment={saveShiftAssignment}
        setJustSaved={setJustSaved}
      />

      <div className="shift-table">
        <ShiftsTable shiftsData={shiftsList} nursesData={nursesList} />
      </div>

    </div>
  );
}

export default App;
