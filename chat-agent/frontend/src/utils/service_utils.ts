import axios from "axios";

const debug = true;
const base_url: string = "http://localhost:8000/";

export interface reqService {
  url: string;
  data?: object;
  method: string;
  headers?: object;
}

const resolveUrl = (url: string) => {
  let callUrl = url;
  if (!url.startsWith("http")) {
    callUrl = new URL(url, base_url).href;
  }
  return callUrl;
};

export const aReq = async (props: reqService) => {
  try {
    const { url, data, method, headers } = props;
    const callUrl = resolveUrl(url);
    const response = await axios({
      url: callUrl,
      data: data,
      method: method,
      headers: headers,
    });
    if (debug) console.log("Response: ", response);
    return response;
  } catch (error) {
    if (debug) console.log("Error: ", error);
    return {};
  }
};

export const req = (props: reqService) => {
  const { url, data, method, headers } = props;
  const callUrl = resolveUrl(url);
  axios({
    url: callUrl,
    data: data,
    method: method,
    headers: headers,
  })
    .then(function (response) {
      if (debug) console.log("Response: ", response);
      return response;
    })
    .catch(function (error) {
      if (debug) console.log("Error: ", error);
      return {};
    })
    .finally(function () {
      // always executed
    });
};

export const aStream = async (props: reqService) => {
  let { url, data, method } = props;

  const callUrl = resolveUrl(url);
  data = Object(data);
  const response: any = await fetch(callUrl, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data }),
  });
  return response;
};
