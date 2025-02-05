


const BASE_URL = "https://jobo-backend-919389594683.europe-west9.run.app";
export const login = async (username, password) => {


  console.log(username, password);
  console.log("helllloooooo");

  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await response.json();
    console.log(data);

    return data
  } catch (error) {
    console.log("Error during login:", error);
  }
}