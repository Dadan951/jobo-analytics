"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../../public/logo-jobo.png";
import { useRouter } from "next/navigation";
import jwt from 'jsonwebtoken';

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const router = useRouter();
  const [userSector, setUserSector] = useState<string | null>(null);

  const links = [
    {
      id: 1,
      link: "accueil",
      title: "Accueil"
    },
    {
      id: 2,
      link: "dashboards/dashboard-sector",
      title: "Dashboard"
    },
    {
      id: 3,
      link: "news",
      title: "Actualité"
    },
  ];

  useEffect(() => {
    console.log("useEffect Navbar");
  
    const getUserSector = () => {
      const tokenCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("OurSiteJWT="));
  
      console.log("Token from cookie:", tokenCookie);
  
      if (tokenCookie) {
        const jwtToken = tokenCookie.split("=")[1];
  
        try {
          const decoded = jwt.decode(jwtToken) as { userSector?: string } | null;
          console.log("Decoded token:", decoded);
  
          if (decoded && decoded.userSector) {
            setUserSector(decoded.userSector);
          } else {
            setUserSector(null);
          }
        } catch (error) {
          console.error("Error decoding token:", error);
          setUserSector(null);
        }
      } else {
        setUserSector(null);
      }
    };
  
    getUserSector();
  }, []);
  

  const handleDashboardClick = () => {
    if (userSector) {
      router.push(`/dashboards/dashboard-${userSector}`);
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <header className="flex justify-between items-center w-full h-16 px-6 text-white bg-blue-900 mb-4 shadow-lg nav">
      {/* Logo Section */}
      <div className="flex items-center space-x-4">
        <Image src={logo} alt="logo" height={50} width={50} />
        <h1 className="text-3xl font-semibold tracking-tight text-white">JOBO ANALYTICS</h1>
      </div>

      {/* Navbar Links */}
      <ul className="hidden md:flex space-x-6">
        {links.map(({ id, link, title }) => (
          <li
            key={id}
            className="nav-links px-4 cursor-pointer capitalize font-medium text-white hover:scale-105 hover:text-white duration-200 link-underline"
            onClick={link === "dashboards/dashboard-sector" ? handleDashboardClick : () => {}}
          >
            <Link href={link === "dashboards/dashboard-sector" ? "#" : `/${link}`}>{title}</Link>
          </li>
        ))}
      </ul>

      {/* Mobile Hamburger */}
      <div
        onClick={() => setNav(!nav)}
        className="cursor-pointer pr-4 z-10 text-white md:hidden"
      >
        {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>

      {/* Mobile Menu */}
      {nav && (
        <ul className="flex flex-col justify-center items-center absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-black to-gray-800 text-gray-500">
          {links.map(({ id, link }) => (
            <li
              key={id}
              className="px-4 cursor-pointer capitalize py-6 text-4xl"
              onClick={link === "dashboards/dashboard-sector" ? handleDashboardClick : () => {}}
            >
              <Link href={link === "dashboards/dashboard-sector" ? "#" : `/${link}`} onClick={() => setNav(!nav)}>
                {link}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
};

export default Navbar;
