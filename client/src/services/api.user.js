// src/api/userApi.js

import API from "../lib/api";

/**
 * Fetches the profile of the currently logged-in user.
 */
export const getUserProfileApi = () => API.get("/user/profile");

/**
 * Handles the avatar file upload.
 * @param {FormData} formData - The form data containing the image file.
 */
export const updateUserAvatarApi = (formData) => API.put('/user/avatar', formData, {
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

/**
 * Handles the study streak check-in.
 */
export const checkInApi = () => API.post('/user/check-in');