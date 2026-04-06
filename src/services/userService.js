import { ref, push, set, remove, update, onValue } from "firebase/database";
import { database } from "../config/firebase";

const USERS_REF = "users";

export const addUser = async (name, rfidUid, role) => {
  try {
    const usersRef = ref(database, USERS_REF);
    const newUserRef = push(usersRef);
    await set(newUserRef, {
      name,
      rfidUid,
      role: role || 'user',
      createdAt: Date.now(),
    });
    return { success: true, id: newUserRef.key };
  } catch (error) {
    console.error("Error adding user:", error);
    return { success: false, error: error.message };
  }
};

export const updateUser = async (id, data) => {
  try {
    const userRef = ref(database, `${USERS_REF}/${id}`);
    await update(userRef, { ...data, updatedAt: Date.now() });
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
};

export const deleteUser = async (id) => {
  try {
    const userRef = ref(database, `${USERS_REF}/${id}`);
    await remove(userRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: error.message };
  }
};

// This function can be used for one-time fetch, but we mostly use the hook
export const listenToUsers = (callback) => {
  const usersRef = ref(database, USERS_REF);
  return onValue(usersRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      const userList = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }));
      callback(userList);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error("Error fetching users:", error);
    callback([], error);
  });
};
