"use client";

import React, { useState } from "react";

export default function BlogCommentForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="blog-post-details__comment-form-wrap">
      <h3 className="blog-post-details__comment-form-wrap--title">Leave a Comment</h3>
      {isSubmitted ? (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #10B981",
            color: "#065F46",
            padding: "16px 20px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <strong>Thank you!</strong> Your comment has been submitted and is pending moderation.
        </div>
      ) : (
        <form onSubmit={handleSubmit} id="contact-form">
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="form-clt">
                <input
                  type="text"
                  name="name"
                  id="comment-name"
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="form-clt">
                <input
                  type="email"
                  name="email"
                  id="comment-email"
                  placeholder="Your Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="col-lg-12">
              <div className="form-clt">
                <textarea
                  name="message"
                  id="comment-message"
                  placeholder="Write Your Comment *"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                ></textarea>
              </div>
            </div>
            <div className="col-lg-6">
              <button
                type="submit"
                className="theme-btn"
                disabled={isSubmitting}
                style={{ opacity: isSubmitting ? 0.7 : 1 }}
              >
                <span>{isSubmitting ? "Submitting..." : "Post A Comment"}</span>
                <i className="fa-regular fa-arrow-up-right"></i>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
