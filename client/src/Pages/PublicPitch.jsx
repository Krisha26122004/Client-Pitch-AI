import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StructuredProposalView } from "./Result";

export default function PublicPitch() {
    const { shareId } = useParams();
    const [pitch, setPitch] = useState(null);
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const loadPitch = async () => {
            try {
                const res = await axios.get(`/api/pitches/public/${shareId}`);
                setPitch(res.data);
                setStatus("ready");
            } catch (error) {
                console.error("Public pitch error:", error);
                setStatus("missing");
            }
        };

        loadPitch();
    }, [shareId]);

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 dark:bg-slate-950">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>
            </div>
        );
    }

    if (status === "missing") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 text-center dark:bg-slate-950">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Pitch not found</h1>
                    <p className="mt-3 text-slate-500 dark:text-slate-400">This share link may have expired or been removed.</p>
                    <Link to="/" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    const sections = pitch.sections?.length
        ? pitch.sections
        : (pitch.content || "").split(/\n\n+/).filter(Boolean).map((body, index) => ({
            title: index === 0 ? pitch.title || "Client Pitch" : `Section ${index + 1}`,
            body,
        }));

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white">
            <main className="mx-auto max-w-6xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-blue-600">Shared ClientPitch AI Proposal</p>
                        <h1 className="mt-2 text-2xl font-black">{pitch.title || `${pitch.company || "Client"} Proposal`}</h1>
                    </div>
                    <Link to="/" className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white hover:bg-blue-700">
                        Create Your Pitch
                    </Link>
                </div>

                <StructuredProposalView sections={sections} form={pitch} />
            </main>
        </div>
    );
}
