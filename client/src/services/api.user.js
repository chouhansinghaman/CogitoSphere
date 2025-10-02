import API from "../lib/api";

export const getUserProfileApi = () => API.get("/user/profile");

export const updateUserAvatarApi = (formData) =>
  API.put("/user/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const checkInApi = () => API.post("/user/check-in");
