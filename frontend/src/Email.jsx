// src/EmailSender.jsx
import React, { useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000"; // backend URL

export default function EmailSender() {
  const [activeForm, setActiveForm] = useState("text"); // "text" or "image"

  const [textEmail, setTextEmail] = useState({ from: "", to: "", subject: "", message: "" });
  const [imageEmail, setImageEmail] = useState({ from: "", to: "", subject: "", message: "" });
  const [imageFile, setImageFile] = useState(null);

  // Send Text Email
  const handleSendText = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/send-text`, textEmail);
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Error sending text email");
    }
  };

  // Send Image Email
  const handleSendImage = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image first!");
      return;
    }

    const formData = new FormData();
    formData.append("from", imageEmail.from);
    formData.append("to", imageEmail.to);
    formData.append("subject", imageEmail.subject);
    formData.append("message", imageEmail.message);
    formData.append("image", imageFile);

    try {
      const res = await axios.post(`${API_URL}/send-email`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.error || "Error sending image email");
    }
  };

  return (
    <div className="w-full my-4 md:min-h-screen md:my-0 flex justify-center items-center bg-gray-900 p-6">
      <div className="w-full max-w-3xl space-y-6">
        {/* Buttons to toggle forms */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setActiveForm("text")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeForm === "text" ? "bg-blue-600 text-white" : "bg-white border border-blue-600 text-blue-600 hover:bg-blue-100"
            }`}
          >
            Text Email
          </button>
          <button
            onClick={() => setActiveForm("image")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              activeForm === "image" ? "bg-green-600 text-white" : "bg-white border border-green-600 text-green-600 hover:bg-green-100"
            }`}
          >
            Image Email
          </button>
        </div>

        {/* Text Email Form */}
        {activeForm === "text" && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-extrabold mb-5 text-blue-600 text-center">📧 Send Text Email</h2>
            <form onSubmit={handleSendText} className="space-y-4">
              <input type="email" placeholder="From" value={textEmail.from} onChange={(e) => setTextEmail({ ...textEmail, from: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              <input type="email" placeholder="To" value={textEmail.to} onChange={(e) => setTextEmail({ ...textEmail, to: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              <input type="text" placeholder="Subject" value={textEmail.subject} onChange={(e) => setTextEmail({ ...textEmail, subject: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              <textarea placeholder="Message" value={textEmail.message} onChange={(e) => setTextEmail({ ...textEmail, message: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" required></textarea>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">Send Text Email</button>
            </form>
          </div>
        )}

        {/* Image Email Form */}
        {activeForm === "image" && (
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-extrabold mb-5 text-green-600 text-center">🖼️ Send Image Email</h2>
            <form onSubmit={handleSendImage} className="space-y-4">
              <input type="email" placeholder="From" value={imageEmail.from} onChange={(e) => setImageEmail({ ...imageEmail, from: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
              <input type="email" placeholder="To" value={imageEmail.to} onChange={(e) => setImageEmail({ ...imageEmail, to: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
              <input type="text" placeholder="Subject" value={imageEmail.subject} onChange={(e) => setImageEmail({ ...imageEmail, subject: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required />
              <textarea placeholder="Message" value={imageEmail.message} onChange={(e) => setImageEmail({ ...imageEmail, message: e.target.value })} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400" required></textarea>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full p-2 border rounded-lg" required />
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">Send Image Email</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
