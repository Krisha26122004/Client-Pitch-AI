import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useState } from "react";
import UpgradeModal from "./Payment";


function Home() {
    const [showUpgrade, setShowUpgrade] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 mt-auto">

            <Navbar hideThemeToggle={true} />

            {/* Hero Section */}
            <div className="pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
                    Create Winning Pitches with{" "}
                    <span className="bg-gradient-to-r from-indigo-500 to to-blue-500 text-transparent bg-clip-text">
                        AI Power
                    </span>
                </h1>
                <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-xl">
                    Turn your ideas into powerful startup pitches in seconds. Perfect for founders, students, and innovations.
                </p>

                <div className="mt-8 flex gap-4">
                    <Link
                        to={sessionStorage.getItem("isLoggedIn") === "true" ? "/dashboard" : "/signup"}
                        className="bg-indigo-500 text-black px-6 py-3 rounded-xl text-lg hover:bg-indigo-400 transition shadow-md"
                    >
                        Start Creating →
                    </Link>
                    <button
                        onClick={() => {
                            document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="border dark:border-gray-700 px-6 py-3 rounded-xl text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition "
                    >
                        How it Works
                    </button>
                </div>

                <p className="text-sm text-gray-900 dark:text-gray-400 mt-4">
                    No credit card required • 30-days Trials
                </p>

            </div>
            {/* How it works */}
            <div id="how-it-works" className="pt-16 pb-8 px-6 max-w-6xl mx-auto text-center ">
                <h2 className="text-4xl font-bold mb-4">
                    How It Works
                </h2>
                <p className="text-gray-900 dark:text-gray-400 mb-12">
                    Create a professional pitch in just 4 simple steps
                </p>

                <div className="grid md:grid-cols-2 gap-8">

                    <div className="p-5 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow hover:shadow-xl transition text-left">
                        <div className="w-7 h-7 flex items-center rounded-full justify-center bg-indigo-100 dark:bg-indigo-900 text-blue-950 dark:text-indigo-100 font-bold mb-4">
                            1
                        </div>

                        <h3 className="text-xl font-semibold mb-2">
                            Tell Us Your Idea
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400">
                            Just type a simple description of your startup idea — no technical skills needed.
                        </p>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow hover:shadow-xl transition text-left">
                        <div className="w-7 h-7 flex items-center rounded-full justify-center bg-indigo-100 dark:bg-indigo-900 text-blue-950 dark:text-indigo-100 font-bold mb-4">
                            2
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            AI Builds Your Pitch
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400">
                            Our AI instantly creates a clear, structured, and professional pitch for your idea.
                        </p>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow hover:shadow-xl transition text-left">
                        <div className="w-7 h-7 flex items-center rounded-full justify-center bg-indigo-100 dark:bg-indigo-900 text-blue-950 dark:text-indigo-100 font-bold mb-4">
                            3
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Edit & Use Anywhere
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400">
                            Customize your pitch, and use it for presentations, investors, or projects.
                        </p>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow hover:shadow-xl transition text-left">
                        <div className="w-7 h-7 flex items-center rounded-full justify-center bg-indigo-100 dark:bg-indigo-900 text-blue-950 dark:text-indigo-100 font-bold mb-4">
                            4
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            Export & Share
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400">
                            Download as PDF or share via web link with your branding.
                        </p>

                    </div>
                </div>
            </div>


            {/*Pricing Details*/}
            <section id="pricing" className="pt-5 pb-24 px-6 max-w-6xl mx-auto text-left">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    See Plans
                </h2>

                <p className="text-gray-950 mb-12">
                    Choose the plan that fits you needs
                </p>

                <div className="grid md:grid-cols-2 gap-10">
                    {/*Free Plan*/}
                    <div className="border dark:border-gray-700 rounded-2xl p-8 text-left bg-blue-50 dark:bg-gray-800 hover:shadow-md transition flex flex-col">
                        <h3 className="text-xl font-semibold mb-2">Free</h3>
                        <p className="text-3xl font-bold mb-4">₹0</p>

                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                            <li>✔  Pitch Generations</li>
                            <li>✔ Basic AI Output</li>
                            <li>✔ Edit & Customize</li>
                            <li>✔ Export The PDF</li>
                        </ul>

                        <Link 
                            to={sessionStorage.getItem("isLoggedIn") === "true" ? "/dashboard" : "/signup"}
                            className="w-full border py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-900 transition mt-auto text-center font-semibold"
                        >
                            {sessionStorage.getItem("isLoggedIn") === "true" ? "Go to Dashboard →" : "Get Started →"}
                        </Link>
                    </div>

                    {/*Pro Plan*/}
                    <div className="border dark:border-gray-700 rounded-2xl p-8 text-left bg-blue-50 dark:bg-gray-800 hover:shadow-md transition">
                        <h3 className="text-xl font-semibold mb-2">Pro</h3>
                        <p className="text-3xl font-bold mb-4">₹499</p>

                        <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                            <li>✔  Unlimited Pitches</li>
                            <li>✔ Advanced AI Output</li>
                            <li>✔ Share via Link</li>
                            <li>✔ Export The PDF</li>
                            <li>✔ Image Creation </li>
                        </ul>

                        <button
                            onClick={() => setShowUpgrade(true)}
                            className=" w-full mt-auto bg-blue-500 text-white px-4 py-2 rounded-lg">
                            Upgrade to Pro →
                        </button>

                        <UpgradeModal
                            isOpen={showUpgrade}
                            onClose={() => setShowUpgrade(false)}
                            onUpgrade={() => {
                                setShowUpgrade(false);
                            }}
                        />
                    </div>
                </div>
            </section>

            {/*Features*/}




            {/*Footer*/}
            <footer className="border-t dark:border-gray-800 py-10 mt-16 transition-colors duration-300">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-blue-600 dark:text-blue-400 mb-4 md:mb-0">
                        &copy; 2026 ClientPitch AI. All rights reserved.
                    </p>

                    <div className="flex gap-6">
                        <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            Privacy Policy
                        </a>
                        <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            Terms of Service
                        </a>
                        <Link to="/contact" className="text-blue-600 dark:text-blue-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>




        </div >

    );
}

export default Home;
