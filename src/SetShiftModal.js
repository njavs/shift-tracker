import { Backdrop, Box, Modal, Fade, Typography, InputLabel, MenuItem, FormControl, Select, Button, Alert } from '@mui/material';
import Moment from 'moment';
import { extendMoment } from 'moment-range';

import React, { useState, useEffect } from 'react';

export const SetShiftModal = ({
    isOpen,
    handleClose,
    shiftsData,
    nursesData,
    saveShiftAssignment,
    setJustSaved
}) => {
    const moment = extendMoment(Moment);

    const [shift, setShift] = useState('');
    const [nurse, setNurse] = useState('');
    const [qualError, setQualError] = useState('');
    const [timeError, setTimeError] = useState('');

    useEffect(() => {
        setQualError(validateQualifications()
            ? ''
            : "The nurse isn't qualified to work the chosen shift.");

        setTimeError(validateTimeWindow()
            ? ''
            : "The nurse is already working during the chosen shift.");

    }, [shift, nurse]);

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid grey',
        boxShadow: 24,
        p: 4,
    };

    const handleSave = () => {
        console.log("Saving assignment...");
        setJustSaved(true);
        saveShiftAssignment(shift.toString(), nurse.toString());
    };

    const resetForms = () => {
        setShift('');
        setNurse('');
    }

    const resetErrors = () => {
        setQualError('');
        setTimeError('');
    }

    const parseDateTime = (iso) => {
        const removeFrontZero = (str) => {
            if (str.length === 2 && str[0] === '0') {
                return str[1];
            }
        }

        // Break up date and time 2021-08-01T09:00:00Z
        const date_time_split = iso.split("T");
        var [date, time] = [date_time_split[0], date_time_split[1]];

        // Convert YYYY-MM-DD -> MM/DD/YY
        const date_split = date.split("-");
        var [year, month, day] = [date_split[0],
        date_split[1],
        date_split[2]];

        const dateString = removeFrontZero(month)
            + '/'
            + removeFrontZero(day)
            + '/'
            + year;

        // Convert time 13:00:00Z -> 1:00:00 AM
        const time_split = time.slice(0, -1).split(':');
        const [hour, min, sec] = [time_split[0],
        time_split[1],
        time_split[2]];

        const period = (hour < 12)
            ? 'AM'
            : 'PM';

        var newHour = parseInt(hour) > 12
            ? parseInt(hour) - 12
            : (parseInt(hour) === 0
                ? 12
                : parseInt(hour));

        newHour = newHour.toString();

        const timeString = [newHour, min, sec].join(":")
            + " "
            + period;

        const dateTimeDisplay = dateString + " " + timeString;

        return dateTimeDisplay;

        // console.log({ dateTimeDisplay, hour, newHour, min, sec });
    };

    const ShiftDropdown = ({ shiftsData }) => {
        const handleChange = (event) => {
            setShift(event.target.value);
        }

        return (
            <Box sx={{ minWidth: 120, mt: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Shift</InputLabel>
                    <Select
                        value={shift}
                        label="Shift"
                        onChange={handleChange}
                    >
                        {shiftsData.map((shift) => {
                            const shiftStr = shift.name + " " + parseDateTime(shift.start) + " " + shift.qual_required;
                            return <MenuItem key={shift.id} value={shift.id}>{shiftStr}</MenuItem>;
                        })}
                    </Select>
                </FormControl>
            </Box>

        )
    }

    const validateQualifications = () => {
        if (!shift || !nurse) {
            return true;
        }

        const qualHierarchy = {
            "CNA": 1,
            "LPN": 2,
            "RN": 3
        };
        const selectedNurse = nursesData.find(n => n.id === nurse);
        const selectedShift = shiftsData.find(s => s.id === shift);
        // console.log({ selectedShift });

        const qualRequired = selectedShift.qual_required;

        if (qualHierarchy[selectedNurse.qualification] < qualHierarchy[qualRequired]) {
            return false;
        } else {
            return true;
        }
    }

    const validateTimeWindow = () => {
        if (!shift || !nurse) {
            return true;
        }

        // Get all shift times for this nurse
        const allShiftTimes = shiftsData
            .filter(s => s.nurse_id === nurse)
            .map(s => [s.start, s.end]);

        const sortByStart = allShiftTimes.sort((a, b) => a[0] - b[0]);
        console.log({ sortByStart });

        if (sortByStart.length === 0) {
            return true;
        }

        // Get selected shift and compare it with each of the nurse's existing shifts
        const selectedShift = shiftsData.find(s => s.id === shift);
        
        for (const times of sortByStart) { 
            const rangeExisting = moment.range(times[0], times[1]);
            const rangeSelected = moment.range(selectedShift.start, selectedShift.end);

            console.log({ rangeExisting, rangeSelected });
            if (rangeExisting.overlaps(rangeSelected)) {
                console.log("Shift overlaps another");
                return false;
            }
        }
        
        return true;
    }

    const NurseDropdown = ({ nursesData }) => {
        const handleChange = (event) => {
            const nurseId = event.target.value;
            setNurse(nurseId);

            // Validate shift timing
            if (validateTimeWindow(nurseId)) {
                setTimeError('');
            } else {
                setTimeError("The nurse isn't qualified to work the chosen shift.");
            }

            // Validate qualifications
            if (validateQualifications(nurseId)) {
                setQualError('');
            } else {
                setQualError('The nurse is already working during the chosen shift.');
            };

        }

        return (
            <Box sx={{ minWidth: 120, mt: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Nurse</InputLabel>
                    <Select
                        value={nurse}
                        label="Nurse"
                        onChange={handleChange}
                    >
                        {nursesData.map((nurse) => {
                            const nurseStr = nurse.first_name + " " + nurse.last_name + ", " + nurse.qualification;
                            return <MenuItem key={nurse.id} name={nurse.id} value={nurse.id}>{nurseStr}</MenuItem>;
                        })}
                    </Select>
                </FormControl>
            </Box>
        );
    }

    return (<>
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={isOpen}
            onClose={() => {
                handleClose();
                resetForms();
                resetErrors();
            }}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Fade in={isOpen}>
                <Box sx={style}>
                    <Typography id="transition-modal-title" variant="h6" component="h2">
                        Set Shift Assignment
                    </Typography>
                    <ShiftDropdown shiftsData={shiftsData} />

                    <NurseDropdown nursesData={nursesData} />

                    {qualError && <Alert severity="error">{qualError}</Alert>}

                    {timeError && <Alert severity="error">{timeError}</Alert>}

                    <div className="save-shift-asgnmt-btn">
                        <Box sx={{ mt: 2 }}>
                            <Button onClick={() => {
                                handleSave();
                                handleClose();
                                resetForms();
                                resetErrors();
                            }} disabled={!(shift && nurse) || qualError.length > 0 || timeError.length > 0} variant="contained">Save Assignment</Button>
                        </Box>
                    </div>
                </Box>
            </Fade>
        </Modal>
    </>);
}