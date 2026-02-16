'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Download, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface Author {
    id: number;
    first_name: string;
    last_name: string;
    institution?: string;
    is_corresponding: boolean;
}

interface Paper {
    id: number;
    title: string;
    abstract: string;
    track_name?: string;
    authors: Author[];
    file: {
        file_path: string;
        file_name: string;
        file_size?: number;
    } | null;
}

interface ProceedingsListProps {
    papers: Paper[];
}

export function ProceedingsList({ papers }: ProceedingsListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedPaper, setExpandedPaper] = useState<number | null>(null);

    // Filter papers
    const filteredPapers = papers.filter(paper =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.some(a =>
            `${a.first_name} ${a.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        (paper.track_name && paper.track_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Group by Track
    const groupedPapers = filteredPapers.reduce((groups, paper) => {
        const track = paper.track_name || "General Track";
        if (!groups[track]) {
            groups[track] = [];
        }
        groups[track].push(paper);
        return groups;
    }, {} as Record<string, Paper[]>);

    const toggleAbstract = (id: number) => {
        setExpandedPaper(expandedPaper === id ? null : id);
    };

    return (
        <div className="space-y-8">
            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                    placeholder="Search by title, author, or keyword..."
                    className="pl-10 h-12 text-lg shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Empty State */}
            {filteredPapers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">No papers found matching your search.</p>
                </div>
            )}

            {/* Paper List Grouped by Track */}
            {Object.entries(groupedPapers).map(([track, trackPapers]) => (
                <div key={track} className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                        <Badge variant="outline" className="text-base py-1 px-3 bg-white">{track}</Badge>
                        <span className="text-sm font-normal text-slate-500 ml-auto">{trackPapers.length} papers</span>
                    </h3>

                    <div className="grid gap-4">
                        {trackPapers.map((paper) => (
                            <Card key={paper.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-slate-900 mb-2 leading-tight">
                                                {paper.title}
                                            </h4>

                                            <div className="text-sm text-slate-600 mb-3">
                                                {paper.authors.map((author, index) => (
                                                    <span key={author.id} className={author.is_corresponding ? "font-medium text-slate-800" : ""}>
                                                        {author.first_name} {author.last_name}
                                                        {index < paper.authors.length - 1 ? ", " : ""}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center gap-4 mt-4">
                                                {/* Abstract Toggle */}
                                                <button
                                                    onClick={() => toggleAbstract(paper.id)}
                                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                >
                                                    {expandedPaper === paper.id ? (
                                                        <>Hide Abstract <ChevronUp className="h-3 w-3" /></>
                                                    ) : (
                                                        <>Show Abstract <ChevronDown className="h-3 w-3" /></>
                                                    )}
                                                </button>

                                                {/* Download Button */}
                                                {paper.file && (
                                                    <a
                                                        href={paper.file.file_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <FileText className="h-3 w-3" />
                                                        PDF
                                                    </a>
                                                )}
                                            </div>

                                            {/* Abstract Content */}
                                            {expandedPaper === paper.id && (
                                                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed border border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    <p>{paper.abstract}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
