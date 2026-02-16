'use client';

import { PaperAuthor } from "@/app/actions/papers";

interface AbstractBookContentProps {
    papers: any[];
}

export function AbstractBookContent({ papers }: AbstractBookContentProps) {
    // Extract all unique institutions and map them to numbers
    const getAffiliationMap = (authors: PaperAuthor[]) => {
        const uniqueInstitutions: string[] = [];
        authors.forEach(author => {
            if (author.institution && !uniqueInstitutions.includes(author.institution)) {
                uniqueInstitutions.push(author.institution);
            }
        });
        return uniqueInstitutions;
    };

    if (papers.length === 0) {
        return (
            <div className="bg-white p-20 text-center shadow-sm rounded-lg">
                <p className="text-slate-500">No accepted papers found for this selection.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-[20mm] print:shadow-none print:p-0 font-serif">
            {/* Table of Contents */}
            <section className="mb-20" style={{ pageBreakAfter: 'always' }}>
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4 tracking-tighter uppercase border-b-4 border-double border-slate-900 pb-6">
                        Abstract Book
                    </h1>
                    <p className="text-xl text-slate-600 italic tracking-widest">Consolidated Proceedings</p>
                </div>

                <h2 className="text-2xl font-bold mb-8 uppercase tracking-widest border-b border-slate-300 pb-2">
                    Table of Contents
                </h2>
                <div className="space-y-6">
                    {papers.map((paper, index) => (
                        <div key={paper.id} className="flex justify-between items-baseline gap-4 group">
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 leading-tight">
                                    {(index + 1).toString().padStart(2, '0')}. {paper.title}
                                </p>
                                <p className="text-sm text-slate-500 italic mt-1">
                                    {paper.authors.map((a: any) => `${a.first_name} ${a.last_name}`).join(', ')}
                                </p>
                            </div>
                            <div className="text-slate-300 flex-1 border-b border-dotted mb-1 min-w-[50px]"></div>
                            <span className="font-mono text-sm text-slate-400">#{paper.id}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Papers List */}
            <div className="space-y-20">
                {papers.map((paper, index) => {
                    const institutions = getAffiliationMap(paper.authors);

                    return (
                        <section key={paper.id} className="pt-4 border-transparent" style={{ pageBreakInside: 'avoid' }}>
                            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                                <span className="text-[10px] font-mono text-slate-400">PAPER ID: #{paper.id}</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{paper.track_name}</span>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-6 leading-snug uppercase">
                                {paper.title}
                            </h3>

                            {/* Authors */}
                            <div className="flex flex-wrap gap-x-2 gap-y-1 mb-3 font-bold text-slate-800 text-lg">
                                {paper.authors.map((author: any, aIndex: number) => {
                                    const instIndex = institutions.indexOf(author.institution || '') + 1;
                                    return (
                                        <span key={aIndex}>
                                            {author.first_name} {author.last_name}
                                            {instIndex > 0 && <sup className="text-[10px] ml-0.5 text-primary">{instIndex}</sup>}
                                            {aIndex < paper.authors.length - 1 && ","}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Institutions */}
                            <div className="mb-10 space-y-1 ml-4 border-l-2 border-slate-100 pl-4">
                                {institutions.map((inst, iIndex) => (
                                    <p key={iIndex} className="text-sm text-slate-500 italic leading-relaxed">
                                        <sup className="text-[10px] mr-1 font-bold">{iIndex + 1}</sup>
                                        {inst}
                                    </p>
                                ))}
                            </div>

                            {/* Abstract */}
                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-[0.2em] mb-4 text-center">
                                    — Abstract —
                                </h4>
                                <p className="text-slate-700 leading-8 text-justify whitespace-pre-line text-[16px]">
                                    {paper.abstract}
                                </p>
                            </div>

                            {/* Keywords */}
                            {paper.keywords && (
                                <div className="flex gap-3 items-baseline pt-4 border-t border-slate-50">
                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Keywords:</span>
                                    <span className="text-sm text-slate-600 italic leading-relaxed">{paper.keywords}</span>
                                </div>
                            )}
                        </section>
                    );
                })}
            </div>

            {/* Print Footer */}
            <div className="hidden print:block fixed bottom-0 left-0 right-0 text-center text-[10px] text-slate-300 py-4">
                Generated by Academic Conference Management System
            </div>
        </div>
    );
}
