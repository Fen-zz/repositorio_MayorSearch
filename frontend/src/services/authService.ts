import API from "./api";

export const googleLogin = (id_token: string) => {
  const formData = new FormData();
  formData.append("id_token_str", id_token); 
  return API.post("/login/google", formData);
};
