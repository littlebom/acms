'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';

import {
    Bold, Italic, Strikethrough, Code,
    List, ListOrdered, Quote,
    Heading1, Heading2, Heading3,
    Link as LinkIcon, Image as ImageIcon, Youtube as YoutubeIcon,
    Table as TableIcon, Undo, Redo,
    AlignLeft, AlignCenter, AlignRight, AlignJustify
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import './tiptap-editor.css';

interface TiptapEditorProps {
    content: string;
    onChange: (html: string) => void;
    placeholder?: string;
    /** "full" = all features (tables, youtube, fonts). "simple" = basic formatting only. */
    variant?: 'full' | 'simple';
}

export function TiptapEditor({ content, onChange, placeholder = 'Write something...', variant = 'full' }: TiptapEditorProps) {
    const isSimple = variant === 'simple';

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            Youtube.configure({
                controls: false,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontFamily,
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const addImage = () => {
        const url = window.prompt('Image URL');

        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addYoutube = () => {
        const url = window.prompt('YouTube URL');

        if (url) {
            editor.commands.setYoutubeVideo({
                src: url,
            });
        }
    };

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-white">
            <div className="border-b border-slate-200 bg-slate-50 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
                {/* Font Selection — full variant only */}
                {!isSimple && (
                    <>
                        <div className="mr-1">
                            <Select
                                value={editor.getAttributes('textStyle').fontFamily || 'Inter'}
                                onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
                            >
                                <SelectTrigger className="h-8 w-[130px] text-xs bg-white border-slate-200">
                                    <SelectValue placeholder="Font" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Inter">Inter (Default)</SelectItem>
                                    <SelectItem value="Sarabun">Sarabun</SelectItem>
                                    <SelectItem value="Comic Sans MS, Comic Sans">Comic Sans</SelectItem>
                                    <SelectItem value="serif">Serif</SelectItem>
                                    <SelectItem value="monospace">Monospace</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="h-6 w-px bg-slate-200 mx-1" />
                    </>
                )}

                {/* Text Formatting */}
                <div className="flex bg-white rounded-md border border-slate-200 shadow-sm p-1 gap-0.5">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bold')}
                        onPressedChange={() => editor.chain().focus().toggleBold().run()}
                        aria-label="Toggle bold"
                    >
                        <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('italic')}
                        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                        aria-label="Toggle italic"
                    >
                        <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('strike')}
                        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                        aria-label="Toggle strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('code')}
                        onPressedChange={() => editor.chain().focus().toggleCode().run()}
                        aria-label="Toggle code"
                    >
                        <Code className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Alignment */}
                <div className="flex bg-white rounded-md border border-slate-200 shadow-sm p-1 gap-0.5">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: 'left' })}
                        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
                    >
                        <AlignLeft className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: 'center' })}
                        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
                    >
                        <AlignCenter className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: 'right' })}
                        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
                    >
                        <AlignRight className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive({ textAlign: 'justify' })}
                        onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
                    >
                        <AlignJustify className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Headings */}
                <div className="flex bg-white rounded-md border border-slate-200 shadow-sm p-1 gap-0.5">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 1 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 2 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('heading', { level: 3 })}
                        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        <Heading3 className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Lists & Quotes */}
                <div className="flex bg-white rounded-md border border-slate-200 shadow-sm p-1 gap-0.5">
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('bulletList')}
                        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('orderedList')}
                        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                        size="sm"
                        pressed={editor.isActive('blockquote')}
                        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote className="h-4 w-4" />
                    </Toggle>
                </div>

                {/* Media & Links */}
                <div className="flex bg-white rounded-md border border-slate-200 shadow-sm p-1 gap-0.5">
                    <Button variant="ghost" size="sm" onClick={addLink} className={editor.isActive('link') ? 'bg-slate-200' : ''}>
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={addImage}>
                        <ImageIcon className="h-4 w-4" />
                    </Button>
                    {/* YouTube & Table — full variant only */}
                    {!isSimple && (
                        <>
                            <Button variant="ghost" size="sm" onClick={addYoutube}>
                                <YoutubeIcon className="h-4 w-4" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className={editor.isActive('table') ? 'bg-slate-200' : ''}>
                                        <TableIcon className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                                        Insert Table
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
                                        Add Column After
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
                                        Delete Column
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
                                        Add Row After
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
                                        Delete Row
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
                                        Delete Table
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>

                <div className="flex-1" />

                {/* History */}
                <div className="flex bg-white rounded-md border border-slate-200 shadow-sm p-1 gap-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <EditorContent editor={editor} className="flex-1" />
        </div>
    );
}
