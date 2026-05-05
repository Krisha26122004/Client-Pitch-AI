import { Clock, Mail, MapPin, Phone, Send, UserRound } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Contact() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState("");
    const [sending, setSending] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus("");
        setSending(true);

        try {
            await axios.post("/api/contact", form);
            setStatus("success");
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (error) {
            console.error("Contact form error:", error);
            setStatus(error.response?.data?.message || "Could not send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-6 py-28 text-slate-900 dark:bg-gray-950 dark:text-slate-100">
            <Navbar />
            <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

                    <h2 className="mb-4 text-5xl font-bold text-slate-900 dark:text-white">
                        Let's Connect
                    </h2>
                    <div className="mb-4 h-1 w-10 bg-blue-500" />
                    <p className="mb-8 max-w-md text-blue-900 dark:text-blue-200">
                        Have questions, feedback, or want to learn more about ClientPitch AI? We'd love to hear from you.
                    </p>

                    <div className="space-y-6 text-blue-900 dark:text-blue-100">
                        <ContactRow icon={Mail} title="Email Us" value="support@clientpitchai.com" />
                        <ContactRow icon={Phone} title="Call Us" value="+91 98250 63477" />
                        <ContactRow icon={MapPin} title="Our Office" value="Vadodara, Gujarat, India" />
                        <ContactRow icon={Clock} title="Working Hours" value="Monday - Friday, 9:00 AM - 6:00 PM" />
                    </div>

                    <div className="mt-10 flex items-center gap-4 rounded-xl bg-blue-50 p-5 shadow-sm dark:bg-blue-500/10">
                        <div className="rounded-full bg-blue-600 p-3 text-white">
                            <UserRound size={18} />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                                We're here to help!
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Our team typically responds within one business day.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h2 className="mb-2 text-xl font-semibold text-slate-800 dark:text-white">
                        Send Us a Message
                    </h2>
                    <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                        Fill out the form below and we'll get back to you shortly.
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <input
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20"
                            />
                            <input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                required
                                className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20"
                            />
                        </div>
                        <input
                            name="subject"
                            type="text"
                            value={form.subject}
                            onChange={handleChange}
                            placeholder="Subject"
                            className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20"
                        />

                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="Your Message"
                            rows="5"
                            required
                            className="w-full rounded-lg border border-slate-200 p-3 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-500/20"
                        />

                        <button
                            disabled={sending}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-bold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Send size={18} />
                            {sending ? "Sending..." : "Send Message"}
                        </button>
                    </form>

                    {status === "success" && (
                        <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                            Message sent successfully. We'll get back to you shortly.
                        </p>
                    )}
                    {status && status !== "success" && (
                        <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-300">
                            {status}
                        </p>
                    )}

                    <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
                        Your information is secure and will never be shared.
                    </p>
                </section>
            </div>
        </div>
    );
}

function ContactRow({ icon, title, value }) {
    const RowIcon = icon;
    return (
        <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-3 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                <RowIcon size={18} />
            </div>
            <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{value}</p>
            </div>
        </div>
    );
}
