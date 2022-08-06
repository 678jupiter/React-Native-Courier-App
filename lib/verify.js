import { BUSS } from "@env";

const BASE_URL = `${BUSS}`;

const checkVerification = async (phoneNumber, code) => {
  try {
    const data = JSON.stringify({
      to: phoneNumber,
      code,
    });

    const response = await fetch(`${BASE_URL}/check-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
    });

    const json = await response.json();
    return json.success;
  } catch (error) {
    alert(error);
    return false;
  }
};

module.exports = {
  checkVerification,
};
