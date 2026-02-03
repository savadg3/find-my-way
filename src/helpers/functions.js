import moment from "moment/moment";

export const DownloadForExcel = (dataRes, fileName) => {
    const blob = new Blob([dataRes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName); // set the filename with .xlsx extension
    document.body.appendChild(link); // append the link to the DOM
    link.click();
    document.body.removeChild(link); // remove the link from the DOM after download
    window.URL.revokeObjectURL(url);
}

export const DownloadForPdf = (dataRes, pdfName) => {
    const blob = new Blob([dataRes], {
        type: "application/pdf",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${pdfName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

export const formatMonthYear = (inputDate) => {
    return moment(inputDate).format('MMM-YY'); // e.g. Jan-23, Feb-23
}

export const dateFormatDDMMYYYY = (inputDateString) => {
    if (inputDateString) {


        const inputDate = new Date(inputDateString);
        // Get day, month, and year
        const day = String(inputDate.getDate()).padStart(2, '0');
        const month = String(inputDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = inputDate.getFullYear();
        // Formatted date string
        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate;
    } else {
        return ''
    }
}

export const dateFormatYYYYMMDD = (inputDateString) => {
    if (inputDateString) {
        const inputDate = new Date(inputDateString);
        // Get day, month, and year
        const day = String(inputDate.getDate()).padStart(2, '0');
        const month = String(inputDate.getMonth() + 1).padStart(2, '0');
        const year = inputDate.getFullYear();
        // Formatted date string
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    } else {
        return ''
    }

}

const addMissingDates = (existingData, startDate, endDate) => {
    const existingDataMap = new Map(existingData.map(item => [item.date, item.count]));
    const extendedData = [];

    // Convert startDate and endDate to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Generate the date range array using Array.from
    const dateRange = Array.from({ length: (end - start) / (1000 * 60 * 60 * 24) + 1 }, (_, i) => {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i + 1);
        return currentDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
    });

    // Create extendedData by mapping over the dateRange
    dateRange.forEach(dateStr => {
        const count = existingDataMap.get(dateStr) || 0; // Get the count or default to 0
        extendedData.push({ date: dateStr, count });
    });

    return extendedData;
};

const addMissingMonths = (existingData, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const monthsToAdd = [];

    // Generate an array of months between the start and end dates
    let monthIter = new Date(start);
    while (monthIter <= end) {
        const month = monthIter.getMonth() + 1; // Get month as 1-12
        const year = monthIter.getFullYear(); // Get the year
        monthsToAdd.push({ month, year });
        monthIter.setMonth(monthIter.getMonth() + 1); // Move to the next month
    }

    // Create a map of existing data by month and year (including default year assumption)
    const existingDataMap = {};
    existingData.forEach(item => {
        const month = item.month; // Month from existing data (1-12 format)
        const year = item.year ? item.year : start.getFullYear(); // Assign the year if missing
        existingDataMap[`${year}-${month}`] = Number(item.count) || 0; // Store count as number
    });

    // Create the extended data for the output
    const extendedData = monthsToAdd.map(({ month, year }) => {
        const count = existingDataMap[`${year}-${month}`] || 0; // Get count or default to 0
        const formattedMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, month - 1));
        const formattedYear = year.toString().slice(-2); // Get last two digits of the year
        return { month: `${formattedMonth}-${formattedYear}`, year, count };
    });

    return extendedData;
};
const addMissingYears = (existingData, startDate, endDate) => {
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const yearsToAdd = [];

    for (let year = startYear; year <= endYear; year++) {
        yearsToAdd.push(year);
    }

    const extendedData = existingData.map(item => ({ ...item }));

    yearsToAdd.forEach(year => {
        const isExistingDataForYear = existingData.some(data => data.year === year);
        if (!isExistingDataForYear) {
            extendedData.push({ year, count: 0 });
        }
    });

    extendedData.sort((a, b) => a.year - b.year);
    return extendedData;
};

export const arrangeGraphData = (result, startDate, endDate) => {
    let extendedData = [];

    // Check the format of the data and arrange accordingly
    if (result[0]?.date) { // Daily data
        const datesData = addMissingDates(result, startDate, endDate);
        extendedData.push(...datesData);
    } else if (result[0]?.month) { // Monthly data
        const monthsData = addMissingMonths(result, startDate, endDate);
        extendedData.push(...monthsData);
    } else if (result[0]?.year) { // Yearly data
        const yearsData = addMissingYears(result, startDate, endDate);
        extendedData.push(...yearsData);
    }
    console.log(extendedData)
    // Generate counts and labels
    const counts = [];
    const labels = extendedData.map(item => {
        if (item.date) return item.date; // Daily
        if (item.month) return item.month; // Monthly
        if (item.year) return item.year.toString(); // Yearly
    });
    console.log(labels)

    extendedData.forEach(item => {
        if (item.date) {
            counts.push(item.count);
        } else if (item.month) {
            const existingData = extendedData.find(data => data.month === item.month && data.year === item.year);
            counts.push(existingData ? existingData.count : 0);
        } else if (item.year) {
            const existingData = extendedData.find(data => data.year === item.year);
            counts.push(existingData ? existingData.count : 0);
        }
    });

    const data = {
        labels: labels,
        datasets: [
            {
                data: counts,
                borderColor: '#26a3db',
                backgroundColor: '#26a3db',
                borderWidth: 4
            },
        ]
    };
    return data;
    // setGraphValues(data);
};