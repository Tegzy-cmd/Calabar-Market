
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ImageUploaderProps {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}

export function ImageUploader({ value, onValueChange, label }: ImageUploaderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('url');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          onValueChange(e.target.result);
        }
      };
      reader.onerror = () => {
          toast({
              title: 'Error reading file',
              description: 'There was an issue reading the selected file.',
              variant: 'destructive'
          });
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        {value && (
            <div className="w-20 h-20 relative flex-shrink-0">
                <Image src={value} alt="Image preview" fill className="rounded-md object-cover border" />
            </div>
        )}
        <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url">
                    <LinkIcon className="mr-2 h-4 w-4" />
                    URL
                </TabsTrigger>
                <TabsTrigger value="upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                </TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="mt-2">
                <Input
                    placeholder="https://example.com/image.png"
                    value={value.startsWith('data:') ? '' : value}
                    onChange={(e) => onValueChange(e.target.value)}
                />
            </TabsContent>
            <TabsContent value="upload" className="mt-2">
                <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    onChange={handleFileChange}
                />
            </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
