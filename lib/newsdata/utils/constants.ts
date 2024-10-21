export const BASE_NEWS_URL = "https://newsdata.io/api/1/";

export const BASE_ENDPOINTS = {
  LATEST: "latest",
  ARCHIVE: "archive",
};

const API_KEY_PARAM = "?apikey=";

export const LATEST_NEWS_URL =
  BASE_NEWS_URL + BASE_ENDPOINTS.LATEST + API_KEY_PARAM;
export const ARCHIVE_NEWS_URL =
  BASE_NEWS_URL + BASE_ENDPOINTS.ARCHIVE + API_KEY_PARAM;
