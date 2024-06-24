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
      link: "acceuil",
      title: "Acceuil"
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
    console.log("use effect navbar");
    
    // Function to get the user's sector from the token
    const getUserSector = () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('OurSiteJWT='));
      console.log("token =" + token);
      
      if (token) {
        const jwtToken = token.split('=')[1];
        try {
          const decoded = jwt.decode(jwtToken) as { sector?: string } | null;
          if (decoded && decoded.sector) {
            setUserSector(decoded.sector);
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
    <header className="flex justify-between items-center w-full h-14 px-4 text-white bg-blue-900 mb-2 shadow-md nav">
      <div>
        <h1 className="text-5xl font-signature ml-2">
          <Link
            className="link-underline link-underline-black"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            <Image src={logo} alt={"logo"} height={60} width={60} />
          </Link>
        </h1>
      </div>

      <ul className="hidden md:flex">
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

      <div
        onClick={() => setNav(!nav)}
        className="cursor-pointer pr-4 z-10 text-white md:hidden"
      >
        {nav ? <FaTimes size={30} /> : <FaBars size={30} />}
      </div>

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
