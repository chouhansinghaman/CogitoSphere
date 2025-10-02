import API from "../lib/api";
export const getPostsApi = () => API.get("/posts");
export const createPostApi = (payload) => API.post("/posts", payload);
export const answerPostApi = (id, payload) => API.post(`/posts/${id}/answer`, payload);
export const votePostApi = (id, payload) => API.put(`/posts/${id}/vote`, payload);
export const deletePostApi = (id) => API.delete(`/posts/${id}`);
