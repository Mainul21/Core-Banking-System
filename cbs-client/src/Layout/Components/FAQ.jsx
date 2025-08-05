import { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";

const ContactUsModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [faqVisible, setFaqVisible] = useState(false);

  const your_service_id = import.meta.env.VITE_EMAIL_SERVICE;
  const your_template_id = import.meta.env.VITE_CUSTOMER_TEMPLATE;
  const your_public_key = import.meta.env.VITE_EMAIL_PUBLIC_KEY;

  const handleSendEmail = (e) => {
    e.preventDefault();

    const templateParams = {
      from_email: email,
      to_email: "mainul.hossain.chisty@g.bracu.ac.bd",
      to_name: "Support Team",
      message: message,
    };

    emailjs
      .send(
        your_service_id,
        your_template_id,
        templateParams,
        your_public_key
      )
      .then(
        (response) => {
          console.log("Email sent successfully", response);
          toast.success("Email sent successfully!", { position: "top-right" });
          setEmail("");
          setMessage("");
        },
        (error) => {
          console.log("Error sending email:", error);
          toast.error("Failed to send email. Try again.", { position: "top-right" });
        }
      );
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="transition-transform transform -translate-x-full max-w-md mx-auto min-h-screen bg-gray-600 rounded-lg p-8 shadow-lg outline-none"
      overlayClassName="fixed inset-0 bg-opacity-60 flex justify-start items-center"
      ariaHideApp={false}
    >
      <div className="w-full rounded-lg p-6 space-y-6">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-white text-2xl"
        >
          ✕
        </button>

        <div className="flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold mb-4">Contact Us</h3>

        <h1 className="mb-2 text-center">Email: <span className="underline text-yellow-500 ">mainul.hossain.chisty@g.bracu.ac.bd</span></h1>
        <h1>Phone: <span className="text-yellow-500 underline">01634070584</span></h1>

        {/* FAQ Section */}
        <div className="mt-6">
          <button
            className="text-blue-400"
            onClick={() => setFaqVisible(!faqVisible)}
          >
            {faqVisible ? "Hide FAQ" : "Show FAQ"}
          </button>
          {faqVisible && (
            <div className="mt-4">
              <h4 className="font-bold text-lg">Frequently Asked Questions</h4>
              <div className="mt-2">
                <p className="font-semibold">Q: How can I contact support?</p>
                <p className="text-yellow-500">A: You can contact support via the email or phone provided above.</p>
              </div>
              <div className="mt-2">
                <p className="font-semibold">Q: How long does it take to get a response?</p>
                <p className="text-yellow-500">A: We aim to respond within 24 hours during business days.</p>
              </div>
            </div>
          )}
        </div>

        {/* Email Form */}
        <form onSubmit={handleSendEmail} className="relative space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Your Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
              placeholder="Enter your email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="mt-1 block w-full p-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none"
              placeholder="Enter your message"
            ></textarea>
          </label>

          <button
            type="submit"
            className="w-full bg-emerald-500 text-white py-2 rounded hover:bg-emerald-700 mt-3"
          >
            Send Message
          </button>
        </form>
        </div>
      </div>

      <ToastContainer />
    </Modal>
  );
};

export default ContactUsModal;
