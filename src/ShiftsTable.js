import { Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';

export const ShiftsTable = ({ shiftsData, nursesData }) => {
    const FIELDS = ["name", "start", "end", "qual_required", "nurse_id"];
    const COL_HEADERS = ["Shift", "Start time", "End time", "Certification required", "Assigned nurse"];
    const TIME_FIELDS = ["start", "end"];

    const produceDisplayText = (shift, field) => {

        // Process datetime (i.e. start & end)
        if (TIME_FIELDS.includes(field)) {
            return parseDateTime(shift[field]);
        }

        // Process nurse ID
        else if (field === 'nurse_id') {
            const nurseId = shift[field];
            if (!nurseId) {
                return '';
            }

            const nurse = nursesData.find(nur => nur.id === nurseId);
            const nurseString = nurse.first_name
                + " "
                + nurse.last_name
                + ", "
                + nurse.qualification;

            return nurseString;
        }

        // All other fields
        return shift[field];
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
    };

    return (
        <TableContainer
            component={Paper}
            variant="outlined"
        >
            <Table sx={{ maxWidth: '100vw' }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {FIELDS.map((field, index) => (
                            <TableCell key={field}>{COL_HEADERS[index]}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {shiftsData.map((shift) => (
                        <TableRow key={shift.id}>
                            {FIELDS.map((field) => {
                                const displayText = produceDisplayText(shift, field);
                                return <TableCell key={field + shift.id}>{displayText}</TableCell>;
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

    );

};

