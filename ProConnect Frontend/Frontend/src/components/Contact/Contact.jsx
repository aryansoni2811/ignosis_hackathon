import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('Thank you for reaching out! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
      <div className="contact-page-wrapper">
        <section className="contact-page-header">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you! Please fill out the form below.</p>
        </section>
        <section className="contact-page-form-wrapper">
          <form className="contact-page-form" onSubmit={handleSubmit}>
            <div className="contact-form-group">
              <label htmlFor="name">Name</label>
              <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
              />
            </div>
            <div className="contact-form-group">
              <label htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
              />
            </div>
            <div className="contact-form-group-full">
              <label htmlFor="message">Message</label>
              <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
              ></textarea>
            </div>
            <button type="submit" className="contact-form-submit-btn">Send Message</button>
          </form>
          {formStatus && <p className="contact-form-status-message">{formStatus}</p>}
        </section>
      </div>
  );
};

export default Contact;
