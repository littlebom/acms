'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    GripVertical,
    Type,
    Image as ImageIcon,
    Video,
    LayoutGrid,
    Quote,
    List,
    Code,
    Minus,
    Square,
    Loader2,
    ChevronDown,
    Eye,
    Settings,
    Columns,
    FileText,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Block Types
export type BlockType =
    | 'heading'
    | 'paragraph'
    | 'image'
    | 'video'
    | 'list'
    | 'code'
    | 'quote'
    | 'divider'
    | 'spacer'
    | 'hero'
    | 'cta' // Call to action
    | 'testimonial'
    | 'features'
    | 'columns'
    | 'grid'
    | 'navbar'
    | 'footer';

export interface Block {
    id: string;
    type: BlockType;
    content: Record<string, any>;
    label?: string; // Add label to interface to fix lint error
}

// Block Definitions
const BLOCK_TYPES: { type: BlockType; icon: any; label: string; category: string }[] = [
    // Layout
    { type: 'navbar', icon: LayoutGrid, label: 'Navbar', category: 'Layout' },
    { type: 'footer', icon: LayoutGrid, label: 'Footer', category: 'Layout' },
    { type: 'columns', icon: Columns, label: 'Columns', category: 'Layout' },
    { type: 'grid', icon: LayoutGrid, label: 'Grid', category: 'Layout' },
    { type: 'hero', icon: LayoutGrid, label: 'Hero Section', category: 'Sections' },
    { type: 'cta', icon: Star, label: 'Call to Action', category: 'Sections' },
    { type: 'testimonial', label: 'Testimonial', icon: Quote, category: 'Sections' },
    { type: 'divider', label: 'Divider', icon: Minus, category: 'Layout' },
    { type: 'spacer', label: 'Spacer', icon: Square, category: 'Layout' },
    // Content
    { type: 'heading', label: 'Heading', icon: Type, category: 'Text' },
    { type: 'paragraph', label: 'Paragraph', icon: FileText, category: 'Text' },
    { type: 'quote', label: 'Quote', icon: Quote, category: 'Text' },
    { type: 'list', label: 'List', icon: List, category: 'Text' },
    { type: 'image', label: 'Image', icon: ImageIcon, category: 'Media' },
    { type: 'video', label: 'Video', icon: Video, category: 'Media' },
    { type: 'code', label: 'Code', icon: Code, category: 'Advanced' },
];

// Default content for new blocks
export function getDefaultContent(type: BlockType): Record<string, any> {
    switch (type) {
        case 'heading':
            return { text: 'Heading', level: 'h2' };
        case 'paragraph':
            return { text: 'Start typing here...' };
        case 'image':
            return { src: '', alt: '', caption: '' };
        case 'video':
            return { src: '', type: 'youtube' };
        case 'quote':
            return { text: 'Quote text here...', author: '' };
        case 'list':
            return { items: ['Item 1', 'Item 2', 'Item 3'], type: 'unordered' };
        case 'divider':
            return { style: 'solid' };
        case 'spacer':
            return { height: 40 };
        case 'code':
            return { code: '', language: 'javascript' };
        case 'columns':
            return {
                columns: [
                    { title: 'Column 1', text: 'Content for column 1' },
                    { title: 'Column 2', text: 'Content for column 2' }
                ],
                count: 2,
                gap: 8 // gap-8 tailwind utility (32px)
            };
        case 'grid':
            return {
                columns: 3,
                gap: 20,
                items: [
                    { title: 'Item 1', text: 'Grid item content...' },
                    { title: 'Item 2', text: 'Grid item content...' },
                    { title: 'Item 3', text: 'Grid item content...' },
                ]
            };
        case 'hero':
            return {
                title: 'Welcome to Our Site',
                subtitle: 'Amazing experiences await you',
                buttonText: 'Get Started',
                buttonLink: '#',
                secondButtonText: '',
                secondButtonLink: '#',
                bgType: 'gradient', // gradient | solid | image
                bgColor: '#667eea',
                bgColorEnd: '#764ba2',
                bgImage: '',
                overlayOpacity: 50,
                textAlign: 'center', // left | center | right
                height: 'medium', // small | medium | large | full
                layout: 'centered' // centered | left | split
            };
        case 'cta':
            return {
                title: 'Ready to Get Started?',
                description: 'Join thousands of satisfied users today.',
                buttonText: 'Sign Up Now',
                buttonLink: '#'
            };
        case 'features':
            return {
                title: 'Our Features',
                features: [
                    { title: 'Feature One', description: 'Description here' },
                    { title: 'Feature Two', description: 'Description here' },
                    { title: 'Feature Three', description: 'Description here' },
                ]
            };
        case 'testimonial':
            return {
                text: 'This is an amazing product!',
                author: 'John Doe',
                role: 'CEO, Company'
            };
        case 'navbar':
            return {
                logoText: 'ACMS',
                links: [
                    { text: 'Home', url: '/' },
                    { text: 'About', url: '/about' },
                    { text: 'Schedule', url: '/schedule' },
                    { text: 'Speakers', url: '/speakers' },
                    { text: 'News', url: '/news' },
                    { text: 'Contact', url: '/contact' }
                ],
                showAuth: true
            };
        case 'footer':
            return {
                companyName: 'ACMS',
                description: 'The Academic Conference Management System. Streamlining conference organization for everyone.',
                column2Title: 'Quick Links',
                column2Links: [
                    { text: 'About Us', url: '/about' },
                    { text: 'Schedule', url: '/schedule' },
                    { text: 'Speakers', url: '/speakers' }
                ],
                column3Title: 'Legal',
                column3Links: [
                    { text: 'Privacy Policy', url: '#' },
                    { text: 'Terms of Service', url: '#' },
                    { text: 'Cookie Policy', url: '#' }
                ],
                contactEmail: 'contact@acms.com',
                contactPhone: '+66 2 123 4567',
                contactAddress: 'Bangkok, Thailand',
                copyrightText: `© ${new Date().getFullYear()} ACMS. All rights reserved.`
            };
        default:
            return {};
    }
}

// Block Settings Panel
function BlockSettingsPanel({ block, onUpdate }: { block: Block; onUpdate: (content: any) => void }) {
    const { type, content } = block;

    const handleChange = (key: string, value: any) => {
        onUpdate({ ...content, [key]: value });
    };

    return (
        <div className="p-4 space-y-6">
            <div>
                <h3 className="font-semibold text-lg mb-1 capitalize">{block.label || block.type}</h3>
                <p className="text-xs text-slate-500">Configure block settings</p>
            </div>

            {type === 'navbar' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Logo Text</Label>
                        <Input
                            value={content.logoText || ''}
                            onChange={(e) => handleChange('logoText', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={content.showAuth || false}
                            onChange={(e) => handleChange('showAuth', e.target.checked)}
                            id="showAuth"
                            className="rounded border-slate-300"
                        />
                        <Label htmlFor="showAuth">Show Login/Register Buttons</Label>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded">
                        Menu links are placeholder for now. Full menu editor coming soon.
                    </div>
                </div>
            )}

            {type === 'footer' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                            value={content.companyName || ''}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={content.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                            value={content.contactEmail || ''}
                            onChange={(e) => handleChange('contactEmail', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input
                            value={content.contactPhone || ''}
                            onChange={(e) => handleChange('contactPhone', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Address</Label>
                        <Textarea
                            value={content.contactAddress || ''}
                            onChange={(e) => handleChange('contactAddress', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Copyright Text</Label>
                        <Input
                            value={content.copyrightText || ''}
                            onChange={(e) => handleChange('copyrightText', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {type === 'heading' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Text</Label>
                        <Input
                            value={content.text}
                            onChange={(e) => handleChange('text', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Level</Label>
                        <Select
                            value={content.level}
                            onValueChange={(value) => handleChange('level', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="h1">Heading 1</SelectItem>
                                <SelectItem value="h2">Heading 2</SelectItem>
                                <SelectItem value="h3">Heading 3</SelectItem>
                                <SelectItem value="h4">Heading 4</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {(['paragraph', 'quote'].includes(type)) && (
                <div className="space-y-2">
                    <Label>Text Content (HTML Allowed)</Label>
                    {type === 'paragraph' && (
                        <div className="flex gap-1 mb-2">
                            {['<b>Bold</b>', '<i>Italic</i>', '<br/>Break'].map((tag, i) => (
                                <button
                                    key={i}
                                    className="px-2 py-1 text-xs border rounded bg-slate-50 hover:bg-slate-100"
                                    onClick={() => {
                                        // Simple append for now as full cursor insertion needs ref
                                        const tagContent = tag.replace('Bold', '').replace('Italic', '').replace('Break', '');
                                        // For Break, it's self closing. For others, user wraps.
                                        // Actually simpler UX: just append the open/close tag at end
                                        if (tag.includes('Break')) handleChange('text', content.text + '<br/>');
                                        else {
                                            const tagName = tag.includes('Bold') ? 'b' : 'i';
                                            handleChange('text', content.text + `<${tagName}>text</${tagName}>`);
                                        }
                                    }}
                                >
                                    {tag.replace(/<[^>]*>/g, '')}
                                </button>
                            ))}
                        </div>
                    )}
                    <Textarea
                        rows={8}
                        value={content.text}
                        onChange={(e) => handleChange('text', e.target.value)}
                        className="font-mono text-xs"
                    />
                    <p className="text-[10px] text-slate-400">Supports basic HTML tags: &lt;b&gt;, &lt;i&gt;, &lt;span style="..."&gt;</p>

                    {type === 'quote' && (
                        <div className="space-y-2 mt-4">
                            <Label>Author</Label>
                            <Input
                                value={content.author || ''}
                                onChange={(e) => handleChange('author', e.target.value)}
                            />
                        </div>
                    )}
                </div>
            )}

            {type === 'grid' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Columns</Label>
                            <Input
                                type="number"
                                min="1" max="6"
                                value={content.columns || 3}
                                onChange={(e) => handleChange('columns', parseInt(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gap (px)</Label>
                            <Input
                                type="number"
                                min="0" max="100"
                                value={content.gap || 20}
                                onChange={(e) => handleChange('gap', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Grid Items</Label>
                        {content.items?.map((item: any, i: number) => (
                            <div key={i} className="space-y-2 border p-3 rounded-md bg-slate-50 relative group">
                                <button
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                        const newItems = [...content.items];
                                        newItems.splice(i, 1);
                                        handleChange('items', newItems);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                                <Input
                                    value={item.title || ''}
                                    placeholder="Title"
                                    className="h-8 font-semibold"
                                    onChange={(e) => {
                                        const newItems = [...content.items];
                                        newItems[i] = { ...newItems[i], title: e.target.value };
                                        handleChange('items', newItems);
                                    }}
                                />
                                <Textarea
                                    rows={2}
                                    value={item.text || ''}
                                    placeholder="Content..."
                                    className="text-xs"
                                    onChange={(e) => {
                                        const newItems = [...content.items];
                                        newItems[i] = { ...newItems[i], text: e.target.value };
                                        handleChange('items', newItems);
                                    }}
                                />
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                                const newItems = [...(content.items || [])];
                                newItems.push({ title: 'New Item', text: 'Content...' });
                                handleChange('items', newItems);
                            }}
                        >
                            <Plus className="h-3 w-3 mr-2" /> Add Item
                        </Button>
                    </div>
                </div>
            )}

            {type === 'columns' && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Number of Columns</Label>
                        <Select
                            value={String(content.count || 2)}
                            onValueChange={(value) => {
                                const count = parseInt(value);
                                const currentColumns = content.columns || [];
                                // Resize array while preserving existing content
                                const newColumns = Array(count).fill(null).map((_, i) =>
                                    currentColumns[i] || { title: `Column ${i + 1}`, text: `Content for column ${i + 1}` }
                                );
                                onUpdate({ ...content, count, columns: newColumns });
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2 Columns</SelectItem>
                                <SelectItem value="3">3 Columns</SelectItem>
                                <SelectItem value="4">4 Columns</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label>Column Content</Label>
                        <Tabs defaultValue="col0" className="w-full">
                            <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${content.count || 2}, 1fr)` }}>
                                {Array.from({ length: content.count || 2 }).map((_, i) => (
                                    <TabsTrigger key={i} value={`col${i}`}>Col {i + 1}</TabsTrigger>
                                ))}
                            </TabsList>
                            {Array.from({ length: content.count || 2 }).map((_, i) => (
                                <TabsContent key={i} value={`col${i}`} className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label>Title (Optional)</Label>
                                        <Input
                                            value={content.columns?.[i]?.title || ''}
                                            onChange={(e) => {
                                                const newCols = [...(content.columns || [])];
                                                if (!newCols[i]) newCols[i] = {};
                                                newCols[i].title = e.target.value;
                                                handleChange('columns', newCols);
                                            }}
                                            placeholder={`Header for Column ${i + 1}`}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Content</Label>
                                        <Textarea
                                            rows={5}
                                            value={content.columns?.[i]?.text || ''}
                                            onChange={(e) => {
                                                const newCols = [...(content.columns || [])];
                                                if (!newCols[i]) newCols[i] = {};
                                                newCols[i].text = e.target.value;
                                                handleChange('columns', newCols);
                                            }}
                                            placeholder="Column content..."
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            )}

            {type === 'image' && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input
                            value={content.src || ''}
                            onChange={(e) => handleChange('src', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Alt Text</Label>
                        <Input
                            value={content.alt || ''}
                            onChange={(e) => handleChange('alt', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Caption</Label>
                        <Input
                            value={content.caption || ''}
                            onChange={(e) => handleChange('caption', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {type === 'spacer' && (
                <div className="space-y-2">
                    <Label>Height (px)</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            value={content.height || 40}
                            onChange={(e) => handleChange('height', parseInt(e.target.value))}
                        />
                        <span className="text-sm text-slate-500">px</span>
                    </div>
                </div>
            )}

            {type === 'hero' && (
                <div className="space-y-6">
                    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border">
                        <h4 className="font-medium text-sm">Background</h4>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={content.bgType} onValueChange={(v) => handleChange('bgType', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gradient">Gradient</SelectItem>
                                    <SelectItem value="solid">Solid Color</SelectItem>
                                    <SelectItem value="image">Image</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {content.bgType === 'gradient' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Start Color</Label>
                                    <Input type="color" value={content.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">End Color</Label>
                                    <Input type="color" value={content.bgColorEnd} onChange={(e) => handleChange('bgColorEnd', e.target.value)} className="h-8" />
                                </div>
                            </div>
                        )}
                        {content.bgType === 'solid' && (
                            <div className="space-y-1">
                                <Label>Color</Label>
                                <Input type="color" value={content.bgColor} onChange={(e) => handleChange('bgColor', e.target.value)} className="h-8 w-full" />
                            </div>
                        )}
                        {content.bgType === 'image' && (
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input value={content.bgImage} onChange={(e) => handleChange('bgImage', e.target.value)} placeholder="https://..." />
                                <div className="pt-2">
                                    <Label>Overlay Opacity ({content.overlayOpacity || 50}%)</Label>
                                    <input type="range" min="0" max="100" value={content.overlayOpacity || 50} onChange={(e) => handleChange('overlayOpacity', parseInt(e.target.value))} className="w-full mt-2" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm">Content</h4>
                        <div className="space-y-2"><Label>Title</Label><Input value={content.title} onChange={(e) => handleChange('title', e.target.value)} /></div>
                        <div className="space-y-2"><Label>Subtitle</Label><Textarea value={content.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} /></div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-medium text-sm">Buttons</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <Input value={content.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} placeholder="Main Button" />
                            <Input value={content.buttonLink} onChange={(e) => handleChange('buttonLink', e.target.value)} placeholder="Link" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input value={content.secondButtonText} onChange={(e) => handleChange('secondButtonText', e.target.value)} placeholder="Secondary Button" />
                            <Input value={content.secondButtonLink} onChange={(e) => handleChange('secondButtonLink', e.target.value)} placeholder="Link" />
                        </div>
                    </div>
                </div>
            )}

            {type === 'cta' && (
                <div className="space-y-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={content.title} onChange={(e) => handleChange('title', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={content.description} onChange={(e) => handleChange('description', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Button</Label><Input value={content.buttonText} onChange={(e) => handleChange('buttonText', e.target.value)} placeholder="Text" /></div>
                </div>
            )}

            {type === 'testimonial' && (
                <div className="space-y-4">
                    <div className="space-y-2"><Label>Text</Label><Textarea value={content.text} onChange={(e) => handleChange('text', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Author</Label><Input value={content.author} onChange={(e) => handleChange('author', e.target.value)} /></div>
                    <div className="space-y-2"><Label>Role</Label><Input value={content.role} onChange={(e) => handleChange('role', e.target.value)} /></div>
                </div>
            )}

            {/* Fallback for others */}
            {!['navbar', 'footer', 'heading', 'paragraph', 'quote', 'image', 'spacer', 'hero', 'cta', 'testimonial'].includes(type) && (
                <div className="text-sm text-slate-500 italic text-center py-4">No settings available for this block type.</div>
            )}
        </div>
    );
}

// Block Renderer - (Preview Only)
function BlockRenderer({
    block,
}: {
    block: Block;
}) {
    const { type, content } = block;

    switch (type) {
        case 'heading':
            const HeadingTag = (content.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
            const headingClasses = {
                h1: 'text-4xl font-bold',
                h2: 'text-3xl font-bold',
                h3: 'text-2xl font-semibold',
                h4: 'text-xl font-semibold',
            };
            return (
                <div className="w-full py-4">
                    <div className="container mx-auto px-4">
                        <HeadingTag className={headingClasses[content.level as keyof typeof headingClasses] + ' text-slate-900'}>
                            {content.text}
                        </HeadingTag>
                    </div>
                </div>
            );

        case 'paragraph':
            return (
                <div className="w-full py-4">
                    <div className="container mx-auto px-4">
                        <div
                            className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: content.text }}
                        />
                    </div>
                </div>
            );

        case 'image':
            return (
                <div className="w-full py-8">
                    <div className="container mx-auto px-4 text-center">
                        {content.src ? (
                            <>
                                <img src={content.src} alt={content.alt} className="max-w-full rounded-lg mx-auto shadow-sm" />
                                {content.caption && <p className="text-sm text-slate-500 mt-2">{content.caption}</p>}
                            </>
                        ) : (
                            <div className="bg-slate-100 rounded-lg p-12 text-center border-2 border-dashed border-slate-200">
                                <ImageIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-400">Select an image</p>
                            </div>
                        )}
                    </div>
                </div>
            );

        case 'quote':
            return (
                <div className="w-full py-8 bg-slate-50">
                    <div className="container mx-auto px-4">
                        <blockquote className="border-l-4 border-blue-500 pl-4 py-1 max-w-3xl mx-auto">
                            <p className="italic text-lg text-slate-800 mb-2">"{content.text}"</p>
                            {content.author && <footer className="text-slate-600 text-sm font-medium">— {content.author}</footer>}
                        </blockquote>
                    </div>
                </div>
            );

        case 'divider':
            return (
                <div className="w-full">
                    <div className="container mx-auto px-4">
                        <hr className="border-t border-slate-200 my-4" />
                    </div>
                </div>
            );

        case 'spacer':
            return <div style={{ height: content.height || 40 }} className="w-full" />;

        case 'hero':
            const heightClasses = {
                small: 'py-16',
                medium: 'py-24',
                large: 'py-32',
                full: 'min-h-[80vh] flex items-center justify-center'
            };
            const textAlignClasses = {
                left: 'text-left',
                center: 'text-center',
                right: 'text-right'
            };
            const bgStyle = content.bgType === 'image' && content.bgImage
                ? { backgroundImage: `url(${content.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                : content.bgType === 'solid'
                    ? { backgroundColor: content.bgColor }
                    : { background: `linear-gradient(135deg, ${content.bgColor} 0%, ${content.bgColorEnd || '#764ba2'} 100%)` };

            return (
                <div
                    className={`w-full ${heightClasses[content.height as keyof typeof heightClasses] || 'py-24'} text-white relative overflow-hidden`}
                    style={bgStyle}
                >
                    {content.bgType === 'image' && content.bgImage && (
                        <div className="absolute inset-0 bg-black" style={{ opacity: (content.overlayOpacity || 50) / 100 }} />
                    )}
                    <div className="container mx-auto px-4 relative z-10 block">
                        <div className={`max-w-4xl mx-auto ${textAlignClasses[content.textAlign as keyof typeof textAlignClasses] || 'text-center'}`}>
                            <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{content.title}</h1>
                            <p className="text-lg md:text-xl opacity-90 mb-8 max-w-2xl mx-auto">{content.subtitle}</p>
                            <div className={`flex flex-wrap gap-4 ${content.textAlign === 'left' ? 'justify-start' : content.textAlign === 'right' ? 'justify-end' : 'justify-center'}`}>
                                {content.buttonText && (
                                    <span className="inline-block px-6 py-3 bg-white text-slate-900 rounded-lg font-bold shadow-md hover:bg-slate-50 transition-transform hover:scale-105 cursor-pointer">
                                        {content.buttonText}
                                    </span>
                                )}
                                {content.secondButtonText && (
                                    <span className="inline-block px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors cursor-pointer">
                                        {content.secondButtonText}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'cta':
            return (
                <div className="w-full py-16 bg-slate-800 text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3">{content.title}</h2>
                        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">{content.description}</p>
                        <span className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors cursor-pointer">
                            {content.buttonText}
                        </span>
                    </div>
                </div>
            );

        case 'testimonial':
            return (
                <div className="w-full py-12 bg-white">
                    <div className="container mx-auto px-4">
                        <div className="max-w-2xl mx-auto bg-slate-50 border text-center p-8 rounded-xl shadow-sm">
                            <Quote className="h-8 w-8 text-blue-100 mx-auto mb-4" />
                            <p className="text-xl italic text-slate-700 mb-6 font-light">"{content.text}"</p>
                            <div>
                                <p className="font-bold text-slate-900">{content.author}</p>
                                <p className="text-sm text-slate-500">{content.role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            );

        case 'navbar':
            return (
                <nav className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <span className="text-2xl font-bold text-blue-900">
                            {content.logoText}
                        </span>

                        <div className="hidden md:flex items-center gap-6">
                            {content.links?.map((link: any, i: number) => (
                                <span key={i} className="text-sm font-medium hover:text-blue-900 transition-colors cursor-pointer">
                                    {link.text}
                                </span>
                            ))}
                        </div>

                        {content.showAuth && (
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="sm">Login</Button>
                                <Button size="sm">Register</Button>
                            </div>
                        )}
                    </div>
                </nav>
            );

        case 'footer':
            return (
                <footer className="w-full bg-slate-900 text-slate-200 py-12">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">{content.companyName}</h3>
                                <p className="text-sm text-slate-400">
                                    {content.description}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">{content.column2Title || 'Links'}</h4>
                                <ul className="space-y-2 text-sm">
                                    {content.column2Links?.map((link: any, i: number) => (
                                        <li key={i}><span className="hover:text-white transition-colors cursor-pointer">{link.text}</span></li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">{content.column3Title || 'Legal'}</h4>
                                <ul className="space-y-2 text-sm">
                                    {content.column3Links?.map((link: any, i: number) => (
                                        <li key={i}><span className="hover:text-white transition-colors cursor-pointer">{link.text}</span></li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-4">Contact</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>{content.contactEmail}</li>
                                    <li>{content.contactPhone}</li>
                                    <li>{content.contactAddress}</li>
                                </ul>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-500">
                            {content.copyrightText}
                        </div>
                    </div>
                </footer>
            );

        case 'columns':
            const gridCols = {
                2: 'md:grid-cols-2',
                3: 'md:grid-cols-3',
                4: 'md:grid-cols-4',
            };
            const colCount = content.count || 2;

            return (
                <div className="w-full py-8">
                    <div className="container mx-auto px-4">
                        <div className={`grid grid-cols-1 ${gridCols[colCount as keyof typeof gridCols]} gap-8`}>
                            {content.columns?.map((col: any, i: number) => (
                                <div key={i} className="space-y-4">
                                    {col.title && <h3 className="text-xl font-bold text-slate-800">{col.title}</h3>}
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{col.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

        default:
            return <div className="p-4 border border-dashed rounded text-center text-slate-400">Block Type: {type}</div>;
    }
}

// Sortable Block Component
function SortableBlock({
    block,
    isSelected,
    onSelect,
    onUpdate,
    onDelete
}: {
    block: Block;
    isSelected: boolean;
    onSelect: () => void;
    onUpdate: (content: Record<string, any>) => void;
    onDelete: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border rounded-lg transition-all ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent hover:border-slate-300'
                }`}
            onClick={onSelect}
        >
            {/* Block Toolbar */}
            <div className={`absolute -top-3 left-2 flex items-center gap-1 bg-white rounded shadow-sm border px-1 py-0.5 z-10 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } transition-opacity`}>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab p-1 hover:bg-slate-100 rounded"
                >
                    <GripVertical className="h-3 w-3 text-slate-400" />
                </button>
                <span className="text-xs text-slate-500 px-1 capitalize">{block.type}</span>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-1 hover:bg-red-100 rounded text-red-500"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            {/* Block Content */}
            <div className="p-4">
                <BlockRenderer block={block} />
            </div>
        </div>
    );
}

// Convert blocks to HTML
function blocksToHtml(blocks: Block[]): string {
    return blocks.map(block => {
        const { type, content } = block;

        switch (type) {
            case 'heading':
                const HeadingTag = (content.level || 'h2') as 'h1' | 'h2' | 'h3' | 'h4';
                const headingStyle = content.level === 'h1' ? 'font-size: 2.25rem; font-weight: 700;' :
                    content.level === 'h2' ? 'font-size: 1.875rem; font-weight: 700;' :
                        content.level === 'h3' ? 'font-size: 1.5rem; font-weight: 600;' :
                            'font-size: 1.25rem; font-weight: 600;';
                return `<div data-block-type="heading" style="width: 100%; padding: 16px 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
                        <${HeadingTag} style="${headingStyle} color: #0f172a;">${content.text}</${HeadingTag}>
                    </div>
                </div>`;

            case 'paragraph':
                return `<div data-block-type="paragraph" style="width: 100%; padding: 16px 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
                        <div style="font-size: 1rem; line-height: 1.625; color: #334155;">${content.text}</div>
                    </div>
                </div>`;

            case 'image':
                return `<div data-block-type="image" style="width: 100%; padding: 32px 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px; text-align: center;">
                        <img src="${content.src}" alt="${content.alt}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                        ${content.caption ? `<p style="font-size: 0.875rem; color: #64748b; margin-top: 8px;">${content.caption}</p>` : ''}
                    </div>
                </div>`;

            case 'quote':
                return `<div data-block-type="quote" style="width: 100%; padding: 32px 0; background-color: #f8fafc;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
                        <blockquote style="border-left: 4px solid #3b82f6; padding-left: 16px; max-width: 48rem; margin: 0 auto;">
                            <p style="font-style: italic; font-size: 1.125rem; color: #1e293b; margin-bottom: 8px;">"${content.text}"</p>
                            ${content.author ? `<footer style="color: #475569; font-size: 0.875rem; font-weight: 500;">— ${content.author}</footer>` : ''}
                        </blockquote>
                    </div>
                </div>`;

            case 'divider':
                return `<div data-block-type="divider" style="width: 100%;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
                        <hr style="border-top: 1px solid #e2e8f0; margin: 32px 0;" />
                    </div>
                </div>`;

            case 'spacer':
                return `<div data-block-type="spacer" style="height: ${content.height}px; width: 100%;"></div>`;

            case 'hero':
                const heroBgStyle = content.bgType === 'image' && content.bgImage
                    ? `background-image: url(${content.bgImage}); background-size: cover; background-position: center;`
                    : content.bgType === 'solid'
                        ? `background-color: ${content.bgColor};`
                        : `background: linear-gradient(135deg, ${content.bgColor} 0%, ${content.bgColorEnd} 100%);`;
                const heroHeightStyle = content.height === 'full' ? 'min-height: 80vh; display: flex; align-items: center; justify-content: center;'
                    : content.height === 'large' ? 'padding: 128px 0;'
                        : content.height === 'small' ? 'padding: 64px 0;'
                            : 'padding: 96px 0;';

                return `<section data-block-type="hero" style="width: 100%; ${heroBgStyle} ${heroHeightStyle} position: relative; overflow: hidden; color: white;">
                    ${content.bgType === 'image' && content.bgImage ? `<div style="position: absolute; inset: 0; background-color: black; opacity: ${content.overlayOpacity / 100};"></div>` : ''}
                    <div style="position: relative; z-index: 10; max-width: 1200px; margin: 0 auto; padding: 0 16px; text-align: ${content.textAlign};">
                        <div style="max-width: 56rem; margin: 0 auto;">
                            <h1 style="font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">${content.title}</h1>
                            <p style="font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem;">${content.subtitle}</p>
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap; ${content.textAlign === 'center' ? 'justify-content: center;' : content.textAlign === 'right' ? 'justify-content: flex-end;' : 'justify-content: flex-start;'}">
                                ${content.buttonText ? `<a href="${content.buttonLink}" style="display: inline-block; padding: 12px 32px; background: white; color: #0f172a; border-radius: 8px; text-decoration: none; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">${content.buttonText}</a>` : ''}
                                ${content.secondButtonText ? `<a href="${content.secondButtonLink}" style="display: inline-block; padding: 12px 32px; background: transparent; border: 2px solid white; color: white; border-radius: 8px; text-decoration: none; font-weight: 700;">${content.secondButtonText}</a>` : ''}
                            </div>
                        </div>
                    </div>
                </section>`;

            case 'cta':
                return `<section data-block-type="cta" style="width: 100%; padding: 64px 0; background-color: #1e293b; color: white;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px; text-align: center;">
                        <h2 style="font-size: 1.875rem; font-weight: 700; margin-bottom: 12px;">${content.title}</h2>
                        <p style="color: #cbd5e1; margin-bottom: 24px; max-width: 42rem; margin-left: auto; margin-right: auto;">${content.description}</p>
                        <a href="${content.buttonLink}" style="display: inline-block; padding: 10px 24px; background-color: #2563eb; color: white; border-radius: 6px; text-decoration: none; font-weight: 600;">${content.buttonText}</a>
                    </div>
                </section>`;

            case 'testimonial':
                return `<section data-block-type="testimonial" style="width: 100%; padding: 48px 0; background-color: white;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
                        <div style="max-width: 42rem; margin: 0 auto; background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 32px; border-radius: 12px; text-align: center; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                            <p style="font-size: 1.25rem; font-style: italic; color: #334155; margin-bottom: 24px;">"${content.text}"</p>
                            <div>
                                <p style="font-weight: 700; color: #0f172a; margin: 0;">${content.author}</p>
                                <p style="font-size: 0.875rem; color: #64748b; margin: 0;">${content.role}</p>
                            </div>
                        </div>
                    </div>
                </section>`;

            case 'columns':
                const colCount = content.count || 2;
                const colWidth = 100 / colCount;
                return `<div data-block-type="columns" style="width: 100%; padding: 32px 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px; display: flex; flex-wrap: wrap; gap: 32px;">
                        ${content.columns?.map((col: any) => `
                            <div style="flex: 1; min-width: 250px;">
                                ${col.title ? `<h3 style="font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 16px;">${col.title}</h3>` : ''}
                                <p style="color: #475569; line-height: 1.625; white-space: pre-wrap;">${col.text}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>`;

            case 'navbar':
                return `<nav data-block-type="navbar" style="width: 100%; border-bottom: 1px solid #e2e8f0; background-color: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 40; height: 64px; display: flex; align-items: center;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px; width: 100%; display: flex; align-items: center; justify-content: space-between;">
                        <span style="font-size: 1.5rem; font-weight: 700; color: #1e3a8a;">${content.logoText}</span>
                        <div style="display: flex; gap: 24px;">
                            ${content.links?.map((link: any) => `<span style="font-size: 0.875rem; font-weight: 500; cursor: pointer;">${link.text}</span>`).join('')}
                        </div>
                    </div>
                </nav>`;

            case 'footer':
                return `<footer data-block-type="footer" style="width: 100%; background-color: #0f172a; color: #e2e8f0; padding: 48px 0;">
                    <div style="max-width: 1200px; margin: 0 auto; padding: 0 16px;">
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
                            <div>
                                <h3 style="font-size: 1.25rem; font-weight: 700; color: white; margin-bottom: 16px;">${content.companyName}</h3>
                                <p style="font-size: 0.875rem; color: #94a3b8;">${content.description}</p>
                            </div>
                            <div>
                                <h4 style="font-weight: 600; color: white; margin-bottom: 16px;">Links</h4>
                                <ul style="list-style: none; padding: 0; font-size: 0.875rem;">
                                    ${content.column2Links?.map((link: any) => `<li style="margin-bottom: 8px;">${link.text}</li>`).join('')}
                                </ul>
                            </div>
                             <div>
                                <h4 style="font-weight: 600; color: white; margin-bottom: 16px;">Legal</h4>
                                <ul style="list-style: none; padding: 0; font-size: 0.875rem;">
                                    ${content.column3Links?.map((link: any) => `<li style="margin-bottom: 8px;">${link.text}</li>`).join('')}
                                </ul>
                            </div>
                             <div>
                                <h4 style="font-weight: 600; color: white; margin-bottom: 16px;">Contact</h4>
                                <ul style="list-style: none; padding: 0; font-size: 0.875rem;">
                                    <li style="margin-bottom: 8px;">${content.contactEmail}</li>
                                    <li>${content.contactPhone}</li>
                                </ul>
                            </div>
                        </div>
                         <div style="border-top: 1px solid #1e293b; margin-top: 32px; padding-top: 32px; text-align: center; font-size: 0.875rem; color: #64748b;">
                            ${content.copyrightText}
                        </div>
                    </div>
                </footer>`;

            default:
                return '';
        }
    }).join('\n');
}

// Helper to parse HTML back to blocks
function htmlToBlocks(html: string): Block[] {
    if (!html) return [];

    // 1. Try to recover strict JSON structure matches first (Perfect fidelity)
    const jsonMatch = html.match(/<!--(AC?MS)_BLOCKS_DATA:([\s\S]*?)-->/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]);
        } catch (e) {
            console.error("Failed to parse embedded blocks JSON", e);
        }
    }

    // 2. Fallback: Parse HTML using DOMParser (Best effort for existing content)
    if (typeof window === 'undefined') return [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks: Block[] = [];

    // Helper to generate ID
    const newId = () => `block-${Math.random().toString(36).substr(2, 9)}`;

    Array.from(doc.body.children).forEach(el => {
        // Try to identify using data attributes first (if we add them in blocksToHtml)
        const blockType = el.getAttribute('data-block-type');

        if (blockType) {
            // Reconstruct based on type
            const content: any = {};
            switch (blockType) {
                case 'heading':
                    const hTag = el.querySelector('h1, h2, h3, h4');
                    content.text = hTag?.textContent || '';
                    content.level = hTag?.tagName.toLowerCase() || 'h2';
                    blocks.push({ id: newId(), type: 'heading', content });
                    break;
                case 'paragraph':
                    content.text = el.querySelector('p')?.textContent || '';
                    blocks.push({ id: newId(), type: 'paragraph', content });
                    break;
                case 'image':
                    const img = el.querySelector('img');
                    content.src = img?.getAttribute('src') || '';
                    content.alt = img?.getAttribute('alt') || '';
                    content.caption = el.querySelector('p')?.textContent || '';
                    blocks.push({ id: newId(), type: 'image', content });
                    break;
                case 'quote':
                    content.text = el.querySelector('p')?.textContent?.replace(/"/g, '') || '';
                    content.author = el.querySelector('footer')?.textContent?.replace('— ', '') || '';
                    blocks.push({ id: newId(), type: 'quote', content });
                    break;
                case 'divider':
                    content.style = 'solid';
                    blocks.push({ id: newId(), type: 'divider', content });
                    break;
                case 'spacer':
                    const heightStr = (el as HTMLElement).style.height || '40px';
                    content.height = parseInt(heightStr);
                    blocks.push({ id: newId(), type: 'spacer', content });
                    break;
                case 'hero':
                    content.title = el.querySelector('h1')?.textContent || '';
                    content.subtitle = el.querySelector('p')?.textContent || '';
                    const buttons = el.querySelectorAll('a');
                    if (buttons[0]) {
                        content.buttonText = buttons[0].textContent;
                        content.buttonLink = buttons[0].getAttribute('href');
                    }
                    if (buttons[1]) {
                        content.secondButtonText = buttons[1].textContent;
                        content.secondButtonLink = buttons[1].getAttribute('href');
                    }
                    // Defaults for styles as they are hard to parse back perfectly
                    content.bgType = 'gradient';
                    content.bgColor = '#667eea';
                    content.bgColorEnd = '#764ba2';
                    content.height = 'medium';
                    content.textAlign = 'center';
                    blocks.push({ id: newId(), type: 'hero', content });
                    break;
                case 'cta':
                    content.title = el.querySelector('h2')?.textContent || '';
                    content.description = el.querySelector('p')?.textContent || '';
                    const btn = el.querySelector('a');
                    content.buttonText = btn?.textContent || '';
                    content.buttonLink = btn?.getAttribute('href') || '#';
                    blocks.push({ id: newId(), type: 'cta', content });
                    break;
                case 'testimonial':
                    content.text = el.querySelector('p')?.textContent?.replace(/"/g, '') || '';
                    const authorInfo = el.querySelectorAll('div > div > div > p');
                    if (authorInfo.length >= 2) {
                        content.author = authorInfo[1].textContent;
                        content.role = authorInfo[2].textContent;
                    } else {
                        content.author = 'Author';
                        content.role = 'Role';
                    }
                    blocks.push({ id: newId(), type: 'testimonial', content });
                    break;
                case 'columns':
                    const cols = el.querySelectorAll('div > div > div'); // Adjust based on DOM structure
                    content.count = cols.length || 2;
                    content.columns = Array.from(cols).map(col => ({
                        title: col.querySelector('h3')?.textContent || '',
                        text: col.querySelector('p')?.textContent || ''
                    }));
                    blocks.push({ id: newId(), type: 'columns', content });
                    break;
                case 'grid':
                    const gridContainer = el.querySelector('div > div');
                    content.columns = 3; // parse from style if strictly needed, but might be hard. Default safe.
                    content.gap = 20;
                    const gridItems = gridContainer?.children || [];
                    content.items = Array.from(gridItems).map(item => ({
                        title: item.querySelector('h3')?.textContent || '',
                        text: item.querySelector('div')?.textContent || ''
                    }));
                    blocks.push({ id: newId(), type: 'grid', content });
                    break;
                case 'navbar':
                    content.logoText = el.querySelector('span')?.textContent || 'Logo';
                    const links = el.querySelectorAll('div > span');
                    content.links = Array.from(links).map(l => ({ text: l.textContent, url: '#' }));
                    content.showAuth = true;
                    blocks.push({ id: newId(), type: 'navbar', content });
                    break;
                case 'footer':
                    const h3 = el.querySelector('h3');
                    content.companyName = h3?.textContent || '';
                    content.description = el.querySelector('p')?.textContent || '';
                    content.copyrightText = el.lastElementChild?.textContent?.trim() || '';
                    // Defaults
                    content.contactEmail = '';
                    content.contactPhone = '';
                    blocks.push({ id: newId(), type: 'footer', content });
                    break;
            }
        } else {
            // Legacy/Generic element fallback
            if (el.tagName.toLowerCase() === 'nav') {
                blocks.push({ id: newId(), type: 'navbar', content: getDefaultContent('navbar') });
            }
            else if (el.tagName.toLowerCase() === 'footer') {
                blocks.push({ id: newId(), type: 'footer', content: getDefaultContent('footer') });
            }
            else {
                // Try to guess from structure or valid text
                const text = el.textContent?.trim();
                if (text) {
                    blocks.push({ id: newId(), type: 'paragraph', content: { text } });
                }
            }
        }
    });

    return blocks;
}

// Main Component
interface VisualBuilderProps {
    initialContent?: string;
    onSave: (html: string, css: string, title: string) => Promise<void>;
    title?: string;
    initialTitle?: string;
    backUrl: string;
    defaultBlocks?: Block[];
}

export function VisualBuilder({ initialContent = '', onSave, title, initialTitle, backUrl, defaultBlocks }: VisualBuilderProps) {
    const router = useRouter();
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [pageTitle, setPageTitle] = useState(initialTitle || title?.replace('Edit: ', '') || 'Untitled Page');

    // Get selected block object
    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Load initial content
    useEffect(() => {
        if (initialContent) {
            const parsedBlocks = htmlToBlocks(initialContent);
            if (parsedBlocks.length > 0) {
                setBlocks(parsedBlocks);
                return;
            }
        }

        if (defaultBlocks && defaultBlocks.length > 0) {
            setBlocks(defaultBlocks);
        }
    }, [initialContent, defaultBlocks]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const addBlock = (type: BlockType) => {
        const newBlock: Block = {
            id: `block-${Date.now()}`,
            type,
            content: getDefaultContent(type),
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const updateBlock = (id: string, content: Record<string, any>) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
    };

    const deleteBlock = (id: string) => {
        setBlocks(blocks.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let html = blocksToHtml(blocks);
            // Append the JSON representation of blocks as a hidden comment
            // This allows perfect reconstruction of the editor state when reloading
            html += `\n<!--ACMS_BLOCKS_DATA:${JSON.stringify(blocks)}-->`;

            await onSave(html, '', pageTitle);
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const groupedBlocks = BLOCK_TYPES.reduce((acc, block) => {
        if (!acc[block.category]) acc[block.category] = [];
        acc[block.category].push(block);
        return acc;
    }, {} as Record<string, typeof BLOCK_TYPES>);

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-white border-b shadow-sm z-50 sticky top-0">
                <div className="flex items-center justify-between px-4 h-14">
                    <div className="flex items-center gap-4 flex-1">
                        <Link href={backUrl}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="h-6 w-px bg-slate-200" />
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm">Page Title:</span>
                            <Input
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                className="h-8 w-64 font-medium"
                                placeholder="Page Title"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={previewMode ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                                setPreviewMode(!previewMode);
                                if (!previewMode) setSelectedBlockId(null);
                            }}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            {previewMode ? 'Edit' : 'Preview'}
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden h-[calc(100vh-56px)]">
                {/* 1. Left Sidebar - Block Library */}
                {!previewMode && (
                    <div className="w-64 bg-white border-r overflow-y-auto p-4 shrink-0">
                        <h3 className="font-semibold mb-4 text-sm uppercase text-slate-500">Components</h3>
                        <div className="space-y-6">
                            {Object.entries(groupedBlocks).map(([category, blocks]) => (
                                <div key={category}>
                                    <h4 className="text-xs font-semibold text-slate-400 mb-2">{category}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {blocks.map((block) => (
                                            <button
                                                key={block.type}
                                                onClick={() => addBlock(block.type as BlockType)}
                                                className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-slate-50 hover:border-blue-500 hover:text-blue-600 transition-all text-slate-600 bg-white shadow-sm"
                                            >
                                                <block.icon className="h-5 w-5 mb-1.5" />
                                                <span className="text-[10px] uppercase font-medium">{block.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Middle Canvas */}
                <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                    <div className={`w-full min-h-[800px] transition-all duration-300 ${previewMode ? 'scale-100' : ''}`}>
                        {blocks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-12 text-slate-400 bg-slate-50">
                                <LayoutGrid className="h-20 w-20 mb-6 opacity-20" />
                                <h3 className="text-xl font-semibold mb-2">Start Designing</h3>
                                <p>Click a component on the left to add it to your page.</p>
                            </div>
                        ) : previewMode ? (
                            // Preview Mode: Pure formatting
                            <div className="p-0">
                                {blocks.map((block) => (
                                    <div key={block.id} className="relative">
                                        <BlockRenderer block={block} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Edit Mode: Sortable & Selectable
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={blocks.map(b => b.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="min-h-full">
                                        {blocks.map((block) => (
                                            <SortableBlock
                                                key={block.id}
                                                block={block}
                                                isSelected={selectedBlockId === block.id}
                                                onSelect={() => setSelectedBlockId(block.id)}
                                                onUpdate={() => { }} // Update handled via sidebar
                                                onDelete={() => deleteBlock(block.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* 3. Right Sidebar - Settings Panel */}
                {!previewMode && (
                    <div className="w-80 bg-white border-l overflow-y-auto shrink-0 transition-all h-[calc(100vh-56px)]">
                        {selectedBlock ? (
                            <BlockSettingsPanel
                                block={selectedBlock}
                                onUpdate={(content) => updateBlock(selectedBlock.id, content)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                                <Settings className="h-12 w-12 mb-4 opacity-20" />
                                <p className="text-sm">Select a block on the canvas to configure its settings here.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
