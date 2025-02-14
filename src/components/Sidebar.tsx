import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";
import { FaSignOutAlt, FaHome, FaUserAlt } from "react-icons/fa"; // Adding icons

const Sidebar = () => {
  const router = useRouter();
  const [userName, setUserName] = useState("Default");
  const [userSector, setUserSector] = useState("Unknown Sector");

  useEffect(() => {
    console.log("Sidebar useEffect triggered");

    // ✅ Fetch JWT from API (instead of document.cookie)
    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/auth/token", { credentials: "include" }); // Ensures cookies are sent
        const data = await res.json();
        
        if (data.token) {
          const decoded = jwt.decode(data.token) as { username?: string; userSector?: string } | null;
          console.log("🟠 Decoded JWT:", decoded);

          if (decoded) {
            setUserName(decoded.username || "Unknown User");
            setUserSector(decoded.userSector || "Unknown Sector");
          }
        } else {
          console.log("❌ No token received");
        }
      } catch (error) {
        console.error("❌ Error fetching token:", error);
      }
    };

    fetchUserData();
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
    <div className="w-64 h-full bg-blue-900 text-white p-6 flex flex-col">
      {/* Removed the JOBO Analytics branding */}
      
      <div className="flex-1">
        <p className="text-lg font-bold mb-2">{userName}</p>
        
        {/* Highlight the sector */}
        <p className="text-2xl font-extrabold uppercase text-yellow-400 mb-6">{userSector}</p> {/* Larger, highlighted user sector */}

        <hr className="border-t border-gray-400 mb-8" />

        {/* Sidebar menu with icons */}
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-4 text-white hover:text-blue-300 cursor-pointer">
            <FaHome size={24} />
            <span>Home</span>
          </div>
          
          <div className="flex items-center space-x-4 text-white hover:text-blue-300 cursor-pointer">
            <FaUserAlt size={24} />
            <span>Profile</span>
          </div>
          
          {/* Add other items as necessary */}
        </div>
      </div>

      <button onClick={handleLogout} className="flex items-center text-white hover:text-red-500 mt-auto">
        <FaSignOutAlt className="mr-2" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
