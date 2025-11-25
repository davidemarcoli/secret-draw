'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
}

import { useTranslations } from 'next-intl';

export function CopyButton({ text, label, className }: CopyButtonProps) {
    const t = useTranslations('CopyButton');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success(t('success'));
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error(t('error'));
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            className={className}
            onClick={handleCopy}
        >
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? t('copied') : (label || t('copy'))}
        </Button>
    );
}
