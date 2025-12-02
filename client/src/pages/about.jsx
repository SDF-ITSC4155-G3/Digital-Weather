import React, {useState} from 'react'
import "./About.css";
function About() {
  return (
    <div className="page page-card about-page">
      <h1 className="page-title">About Us</h1>
      <p className="page-subtitle">
        A software engineering project built at UNC Charlotte.
      </p>

      <section className="about-section">
        <p>
          Welcome to our website! This is a React application built using
          <span className="about-highlight"> create-react-app</span>, designed
          to explore a digital weather map overlay for the UNC Charlotte campus.
        </p>
        <p>
          The application features an interactive campus map, an about page, and
          a contact page that makes it easy to reach the team behind the
          project.
        </p>
      </section>

      <section className="about-section">
        <h2 className="about-subheading">The team</h2>
        <p>
          This project was developed by{" "}
          <span className="about-highlight">
            Brody Ehorn, Conner Hansen, Abel Varghese, Trenity Gilford, and
            William Harvey
          </span>{" "}
          as part of a software engineering course at UNC Charlotte.
        </p>
      </section>
    </div>
  );
}
export default About