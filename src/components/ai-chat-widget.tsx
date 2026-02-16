'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageSquare, X, Send, Bot, User, Minimize2 } from "lucide-react";
import { chatWithBot } from '@/app/actions/chatbot';
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    role: 'user' | 'bot';
    text: string;
    timestamp: Date;
}

export function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'bot',
            text: "Hello! 👋 I'm the conference AI assistant. Ask me anything about the event, deadlines, or registration!",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatWithBot(userMsg.text);
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: response.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'bot',
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-indigo-600 hover:bg-indigo-700 z-50 transition-all duration-300 hover:scale-110"
                size="icon"
            >
                <MessageSquare className="h-6 w-6 text-white" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-6 right-6 w-[350px] h-[500px] shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 border-indigo-100">
            <CardHeader className="bg-indigo-600 text-white rounded-t-xl p-4 flex flex-row items-center justify-between shrink-0">
                <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Assistant
                </CardTitle>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-indigo-500 rounded-full"
                        onClick={() => setIsOpen(false)}
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-2 max-w-[85%]",
                            msg.role === 'user' ? "ml-auto" : "mr-auto"
                        )}
                    >
                        {msg.role === 'bot' && (
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                                <Bot className="h-4 w-4 text-indigo-600" />
                            </div>
                        )}

                        <div
                            className={cn(
                                "p-3 rounded-2xl text-sm shadow-sm",
                                msg.role === 'user'
                                    ? "bg-indigo-600 text-white rounded-br-none"
                                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                            )}
                        >
                            {msg.text}
                        </div>

                        {msg.role === 'user' && (
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                <User className="h-4 w-4 text-slate-500" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-2 mr-auto max-w-[85%]">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                            <Bot className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-3 bg-white border-t">
                <form
                    className="flex w-full gap-2"
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                >
                    <Input
                        placeholder="Type your question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 focus-visible:ring-indigo-500"
                        autoFocus
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
