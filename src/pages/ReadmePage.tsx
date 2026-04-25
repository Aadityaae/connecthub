import React from "react";

const README = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 prose prose-indigo">
      <h1>ConnectHub - Full Stack Social Media</h1>
      <p>
        A complete social media platform built with React, Node.js, Express, and MongoDB.
      </p>

      <h2>Features</h2>
      <ul>
        <li><strong>Authentication:</strong> JWT-based login and registration with password hashing.</li>
        <li><strong>Profiles:</strong> Custom bios, profile pictures, and follow/unfollow functionality.</li>
        <li><strong>Posts:</strong> Create text and image posts, like, and comment.</li>
        <li><strong>Messaging:</strong> Real-time-ish one-to-one chat with offline message delivery.</li>
      </ul>

      <h2>Local Setup</h2>
      <ol>
        <li>
          <strong>Install Dependencies:</strong>
          <pre><code>npm install</code></pre>
        </li>
        <li>
          <strong>Environment Variables:</strong>
          <p>Create a <code>.env</code> file in the root directory and add:</p>
          <pre><code>
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
          </code></pre>
        </li>
        <li>
          <strong>Run the App:</strong>
          <pre><code>npm run dev</code></pre>
        </li>
      </ol>

      <h2>How Offline Messaging Works</h2>
      <p>
        When a user sends a message, it is stored in the MongoDB database with a <code>read: false</code> flag. 
        If the receiver is not currently in the chat, the message remains unread. 
        When the receiver logs in or opens the chat, the application fetches all messages for that conversation 
        and updates the <code>read</code> status to <code>true</code>.
      </p>
    </div>
  );
};

export default README;
