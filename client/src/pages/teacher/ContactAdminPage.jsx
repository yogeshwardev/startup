import { useState } from "react";
import http from "../../api/http";
import SectionCard from "../../components/SectionCard";

const ContactAdminPage = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await http.post("/contact-admin", { message });
    setStatus("Message sent to admin.");
    setMessage("");
  };

  return (
    <SectionCard title="Contact Admin">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <textarea
          className="min-h-40 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3"
          placeholder="Share a concern, request new problems, or report suspicious activity."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="submit" className="rounded-full bg-accent px-5 py-3 font-semibold">
          Send Message
        </button>
        {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
      </form>
    </SectionCard>
  );
};

export default ContactAdminPage;



