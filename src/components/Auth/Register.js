import React, { useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
// import "./registerStyles.css";
import logo from "../../Assets/Images/FacultyLogo.png";
// import BackButton from "../smallComponents/backButton";
// const returnToLoginLink=document.getElementById("returnToLogin");
// returnToLoginLink.addEventListener("click",(e)=>{console.log(returnToLoginLink)});
const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const confirmPassword = document.getElementById("confirmPassword");

  const confirmPasswordFun = (e) => {
    if (confirmPassword.value === password) {
      confirmPassword.classList.remove("is-invalid");
      confirmPassword.classList.add("is-valid");
    } else confirmPassword.classList.add("is-invalid");
  };

  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [qualifications, setQualifications] = useState("");

  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [nationalID, setNationalID] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate nationalID and contactInfo lengths
    if (role === "patient") {
      if (nationalID.length !== 14) {
        alert("National ID must be 14 digits.");
        return;
      }
      if (contactInfo.length !== 11) {
        alert("Contact Info must be 11 digits.");
        return;
      }
    }

    const data = {
      fullName,
      email,
      password,

      role,
      ...(role === "doctor"
        ? {
            specialty,
            licenseNumber,
            yearsOfExperience,
            qualifications,
            nationalID,
          }
        : {}),
      ...(role === "patient"
        ? { dateOfBirth, gender, contactInfo, nationalID }
        : {}),
    };

    try {
      await API.post("/register", data);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <>
      {/* <Link to="/login">
        <a
          href="/Login.js"
          id="returnToLogin"
          onClick={(event) => {
            console.log(event);
          }}
        >
          <i className="fa-solid fa-angle-left"></i>
        </a>
      </Link> */}
      {/* <backButton /> */}
      <div className="container">
        <div className="w-100">
          <form
            onSubmit={handleSubmit}
            className="container d-flex flex-column justify-content-center align-items-center signupForm"
            style={{marginTop: "-8rem"}}
          >
            <input
              className=" form-control "
              type="text"
              placeholder="Full Name"
              onChange={(e) => setFullName(e.target.value)}
            style={{marginTop: "-8rem"}}

            />
            <input
              className=" form-control "
              type="email"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className=" form-control "
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              id="confirmPassword"
              className=" form-control "
              type="password"
              placeholder="Confirm Password"
              onChange={(e) => confirmPasswordFun(e.target.value)}
            />
            <div className="upload-container">
              <label className="upload-label" for="imageUpload">
                upload your picture here:
              </label>
              <input type="file" id="imageUpload" accept="image/*" />
            </div>
            <input
              className=" form-control "
              type="text"
              placeholder="National ID"
              onChange={(e) => setNationalID(e.target.value)}
            />
            {role === "patient" && (
              <>
                <input
                  className=" form-control "
                  type="date"
                  placeholder="Date of Birth"
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <select
                  className="form-select"
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input
                  className=" form-control "
                  type="text"
                  placeholder="Contact Info"
                  onChange={(e) => setContactInfo(e.target.value)}
                />
              </>
            )}

            <button className="btn btn-primary m-2" type="submit">
              Register
            </button>
          </form>
        </div>
        <div
          className="d-flex justify-content-center align-items-center"
          id="imgDiv"
        >
          <img src={logo} alt="" style={{ width: "150%" }} />
        </div>
      </div>
    </>
  );
};

export default Register;
