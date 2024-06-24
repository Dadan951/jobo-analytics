import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

const Sidebar = () => {
  const router = useRouter();

  const [userName, setUserName] = useState("Default");
  // console.log("sidebar mounted bien");

  useEffect(() => {
    // console.log("use effect trigerred");

    // Retrieve user data from cookies
    const fetchUserDataFromCookie = () => {
      // console.log("inside fetch user data func");
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("OurSiteJWT="));
      // console.log(token);

      if (token) {
        const jwtToken = token.split("=")[1];
        try {
          const decoded = jwt.decode(jwtToken) as { username?: string } | null;
          console.log("decoded:");
          // console.log(decoded);

          if (decoded && decoded.username) {
            console.log(decoded.username);

            setUserName(decoded.username);
          } else {
            setUserName("");
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          setUserName("");
        }
      } else {
        setUserName("");
      }
    };

    fetchUserDataFromCookie();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <div className="w-1/4 h-screen bg-gray-100 mr-1 shadow-md p-5 rounded-lg flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <p className="text-lg font-bold mb-2">{userName}</p>
        <hr className="w-full border-t-2 border-gray-300 mb-9" />
        <p className=" text-xl font-bold text-gray-700 mb-4">JOBO Analytics</p>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
