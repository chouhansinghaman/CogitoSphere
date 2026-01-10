import API from "../lib/api";

export const getUserProfileApi = () => API.get("/users/profile");

export const updateUserAvatarApi = (formData) =>
  API.put("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const checkInApi = () => API.post("/users/check-in");
