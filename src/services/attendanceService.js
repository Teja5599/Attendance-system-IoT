import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../config/firebase";

const ATTENDANCE_REF = "attendance";

export const listenToAttendance = (callback, filterDate = null) => {
  let attendanceQuery = ref(database, ATTENDANCE_REF);

  if (filterDate) {
    // If we want to filter by date (e.g., "2026-04-06")
    attendanceQuery = query(attendanceQuery, orderByChild('date'), equalTo(filterDate));
  }

  return onValue(attendanceQuery, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const records = [];
      
      // The ESP32 is structuring data as: /attendance/YYYY-MM-DD/record_id
      // We need to flatten this into a single array
      Object.keys(data).forEach(dateKey => {
        const dayRecords = data[dateKey];
        
        // Ensure dayRecords is an object (it should be)
        if (typeof dayRecords === 'object' && dayRecords !== null) {
          Object.keys(dayRecords).forEach(recordKey => {
            const item = dayRecords[recordKey];
            
            // Build timestamp from 'date' and 'time' fields (e.g., "2026-04-06" + "14:24")
            let ts = Date.now();
            if (item.date && item.time) {
              const dateStr = `${item.date}T${item.time}:00`;
              const parsed = new Date(dateStr).getTime();
              if (!isNaN(parsed)) ts = parsed;
            } else if (item.timestamp) {
              ts = Number(item.timestamp);
            }
            
            records.push({
              id: recordKey,
              ...item,
              rfidUid: item.rfidUid || item.UID || item.uid || item.id || 'Unknown',
              timestamp: ts,
              date: item.date || dateKey, // Use folder date if missing
              status: item.status ? String(item.status).toUpperCase() : 'IN' // ESP doesn't send status, default to IN
            });
          });
        }
      });
      
      // Sort by timestamp descending (newest first)
      records.sort((a, b) => b.timestamp - a.timestamp);
      
      callback(records);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error fetching attendance:", error);
    callback([], error);
  });
};
