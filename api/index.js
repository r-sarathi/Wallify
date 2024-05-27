import axios from "axios";

const API_KEY = "44075366-85fe7a3b777e984a5834d56e2";
const API_URl = `https://pixabay.com/api/?key=${API_KEY}`;

const formatURL = (params) => {
  let url = API_URl + "&per_page=25&safesearch=true&editors_choice=true";
  if (!params) return url;
  let paramKeys = Object.keys(params);
  paramKeys.map((key) => {
    let value = key == "q" ? encodeURIComponent(params[key]) : params[key];
    url += `&${key}=${value}`;
  });
  console.log("Final URL: ", url);
  return url;
};

export const apiCall = async (params) => {
  try {
    const response = await axios.get(formatURL(params));
    const { data } = response;
    return { success: true, data };
  } catch (err) {
    console.log("Got error: ", err.message);
    return { success: false, msg: err.message };
  }
};
