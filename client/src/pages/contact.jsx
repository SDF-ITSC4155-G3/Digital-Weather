import React, {useState} from 'react'
import "./Contact.css";
function Contact(){
    return (
        <div className="page page-card contact-page">
        <h1 className="page-title">Contact Us</h1>
        <p className="page-subtitle">
            Reach out to the team behind the Digital Weather Map.
        </p>

        <section className="contact-section">
            <p className="contact-label">Contact Information</p>

            <ul className="contact-list">
            <li>
                <span className="contact-name">William Harvey</span>
                <span className="contact-role">Scrum Master</span>
                <a href="mailto:wharvey@uncc.edu" className="contact-email">
                wharvey@uncc.edu
                </a>
            </li>

            <li>
                <span className="contact-name">Brody Ehorn</span>
                <span className="contact-role">Product Owner</span>
                <a href="mailto:behorn@uncc.edu" className="contact-email">
                behorn@uncc.edu
                </a>
            </li>

            <li>
                <span className="contact-name">Abel Varghese</span>
                <span className="contact-role">Developer</span>
                <a href="mailto:avarghes@uncc.edu" className="contact-email">
                avarghes@uncc.edu
                </a>
            </li>

            <li>
                <span className="contact-name">Trenity Gilford</span>
                <span className="contact-role">Developer</span>
                <a href="mailto:tgilford@uncc.edu" className="contact-email">
                tgilford@uncc.edu
                </a>
            </li>

            <li>
                <span className="contact-name">Conner Hansen</span>
                <span className="contact-role">Developer</span>
                <a href="mailto:chansen28@uncc.edu" className="contact-email">
                chansen28@uncc.edu
                </a>
            </li>
            </ul>
        </section>
        </div>
    );
}
export default Contact